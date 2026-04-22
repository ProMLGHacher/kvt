import { createToken } from '@kvt/core'
import type { LocalMediaRepository } from './LocalMediaRepository'
import type { MediaDeviceRepository } from './MediaDeviceRepository'

export const mediaDeviceRepositoryToken =
  createToken<MediaDeviceRepository>('MediaDeviceRepository')

export const localMediaRepositoryToken = createToken<LocalMediaRepository>('LocalMediaRepository')
