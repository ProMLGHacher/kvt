import { createToken } from '@kvt/core'
import type { RtcRepository } from './RtcRepository'
import type { SignalingRepository } from './SignalingRepository'

export const rtcRepositoryToken = createToken<RtcRepository>('RtcRepository')
export const signalingRepositoryToken = createToken<SignalingRepository>('SignalingRepository')
