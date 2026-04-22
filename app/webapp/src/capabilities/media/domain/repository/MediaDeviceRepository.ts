import type { PromiseResult, StateFlow } from '@kvt/core'
import type { MediaDevice, MediaError, MediaPermissionState } from '../model'

export interface MediaDeviceRepository {
  readonly permissionState: StateFlow<MediaPermissionState>
  listDevices(): PromiseResult<readonly MediaDevice[], MediaError>
  requestAudioPermission(): PromiseResult<void, MediaError>
  requestVideoPermission(): PromiseResult<void, MediaError>
}
