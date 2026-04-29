import type { PromiseResult, StateFlow } from '@kvt/core'
import type {
  AudioPluginInstance,
  AudioProcessingSettings,
  AudioProcessingState,
  CreateProcessedMicrophoneStreamParams
} from '../model'

export type AudioProcessingError =
  | { readonly type: 'api-unavailable' }
  | { readonly type: 'stream-unavailable' }
  | { readonly type: 'unknown-error'; readonly message?: string }

export interface AudioProcessingRepository {
  readonly state: StateFlow<AudioProcessingState>
  configure(settings: AudioProcessingSettings): void
  setChain(chain: readonly AudioPluginInstance[]): void
  setMonitorEnabled(enabled: boolean): void
  createProcessedMicrophoneStream(
    params: CreateProcessedMicrophoneStreamParams
  ): PromiseResult<MediaStream, AudioProcessingError>
  release(owner: string): void
}
