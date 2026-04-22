import { MutableStateFlow, err, ok, type PromiseResult } from '@kvt/core'
import type {
  LocalMediaState,
  LocalMediaTrackKind,
  MediaError
} from '@capabilities/media/domain/model'
import type {
  LocalMediaRepository,
  StartLocalPreviewParams
} from '@capabilities/media/domain/repository/LocalMediaRepository'

const initialState: LocalMediaState = {
  tracks: [
    { kind: 'audio', enabled: true, available: true, deviceId: null, label: null },
    { kind: 'camera', enabled: false, available: true, deviceId: null, label: null },
    { kind: 'screen', enabled: false, available: true, deviceId: null, label: null }
  ],
  preview: {
    micEnabled: true,
    cameraEnabled: false,
    previewAvailable: false,
    stream: null,
    status: 'idle',
    error: null
  },
  noiseSuppressionEnabled: true
}

export class BrowserLocalMediaRepository implements LocalMediaRepository {
  private readonly mediaState = new MutableStateFlow<LocalMediaState>(initialState)
  private previewStream: MediaStream | null = null

  readonly state = this.mediaState.asStateFlow()

  async startPreview(params: StartLocalPreviewParams): PromiseResult<void, MediaError> {
    if (!navigator.mediaDevices?.getUserMedia) {
      return err({ type: 'api-unavailable' })
    }

    this.mediaState.update((state) => ({
      ...state,
      preview: { ...state.preview, status: 'requesting', error: null }
    }))

    this.stopPreview()

    try {
      this.previewStream = await navigator.mediaDevices.getUserMedia({
        audio: params.micEnabled
          ? {
              deviceId: params.microphoneDeviceId
                ? { exact: params.microphoneDeviceId }
                : undefined,
              noiseSuppression: true,
              echoCancellation: true,
              autoGainControl: true
            }
          : false,
        video: params.cameraEnabled
          ? {
              deviceId: params.cameraDeviceId ? { exact: params.cameraDeviceId } : undefined
            }
          : false
      })

      this.mediaState.update((state) => ({
        ...state,
        tracks: state.tracks.map((track) => {
          if (track.kind === 'audio') {
            return {
              ...track,
              enabled: params.micEnabled,
              deviceId: params.microphoneDeviceId ?? null,
              available: Boolean(this.previewStream?.getAudioTracks().length)
            }
          }
          if (track.kind === 'camera') {
            return {
              ...track,
              enabled: params.cameraEnabled,
              deviceId: params.cameraDeviceId ?? null,
              available: Boolean(this.previewStream?.getVideoTracks().length)
            }
          }
          return track
        }),
        preview: {
          micEnabled: params.micEnabled,
          cameraEnabled: params.cameraEnabled,
          previewAvailable:
            params.cameraEnabled && Boolean(this.previewStream?.getVideoTracks().length),
          stream: this.previewStream,
          status: 'ready',
          error: null
        }
      }))

      return ok(undefined)
    } catch (error) {
      const mediaError = toMediaError(error)
      this.mediaState.update((state) => ({
        ...state,
        preview: { ...state.preview, status: 'failed', error: mediaError, stream: null }
      }))
      return err(mediaError)
    }
  }

  stopPreview(): void {
    this.previewStream?.getTracks().forEach((track) => track.stop())
    this.previewStream = null
    this.mediaState.update((state) => ({
      ...state,
      preview: { ...state.preview, previewAvailable: false, stream: null, status: 'idle' }
    }))
  }

  async setMicrophoneEnabled(enabled: boolean): PromiseResult<void, MediaError> {
    this.previewStream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled
    })
    this.updateTrack('audio', enabled)
    this.mediaState.update((state) => ({
      ...state,
      preview: { ...state.preview, micEnabled: enabled }
    }))
    return ok(undefined)
  }

  async setCameraEnabled(enabled: boolean): PromiseResult<void, MediaError> {
    const current = this.mediaState.value.preview
    return this.startPreview({
      micEnabled: current.micEnabled,
      cameraEnabled: enabled,
      microphoneDeviceId: this.deviceIdFor('audio'),
      cameraDeviceId: this.deviceIdFor('camera')
    })
  }

  async setScreenShareEnabled(enabled: boolean): PromiseResult<void, MediaError> {
    this.updateTrack('screen', enabled)
    return ok(undefined)
  }

  setNoiseSuppressionEnabled(enabled: boolean): void {
    this.mediaState.update((state) => ({ ...state, noiseSuppressionEnabled: enabled }))
  }

  private updateTrack(kind: LocalMediaTrackKind, enabled: boolean) {
    this.mediaState.update((state) => ({
      ...state,
      tracks: state.tracks.map((track) => (track.kind === kind ? { ...track, enabled } : track))
    }))
  }

  private deviceIdFor(kind: LocalMediaTrackKind): string | null {
    return this.mediaState.value.tracks.find((track) => track.kind === kind)?.deviceId ?? null
  }
}

function toMediaError(error: unknown): MediaError {
  if (error instanceof DOMException && error.name === 'NotAllowedError') {
    return { type: 'permission-denied' }
  }
  if (error instanceof DOMException && error.name === 'NotFoundError') {
    return { type: 'device-not-found' }
  }
  if (error instanceof DOMException && error.name === 'NotReadableError') {
    return { type: 'device-busy' }
  }
  return { type: 'unknown-error', message: error instanceof Error ? error.message : undefined }
}
