import { describe, expect, it } from 'vitest'
import { decidePeerRecoveryAction } from '@/lib/rtc/recovery'

describe('decidePeerRecoveryAction', () => {
  it('falls back to relay when the default transport fully fails', () => {
    expect(
      decidePeerRecoveryAction({
        transportMode: 'all',
        iceConnectionState: 'failed',
        health: {
          hasSelectedCandidatePair: false,
          totalBytes: 0,
          hadSuccessfulTransport: false
        }
      })
    ).toBe('fallback-relay')
  })

  it('tries an ICE restart first when a previously healthy default transport disconnects', () => {
    expect(
      decidePeerRecoveryAction({
        transportMode: 'all',
        iceConnectionState: 'disconnected',
        health: {
          hasSelectedCandidatePair: true,
          totalBytes: 128000,
          hadSuccessfulTransport: true
        }
      })
    ).toBe('restart')
  })

  it('falls back to relay when default ICE stays stuck in checking with no transport bytes', () => {
    expect(
      decidePeerRecoveryAction({
        transportMode: 'all',
        iceConnectionState: 'checking',
        health: {
          hasSelectedCandidatePair: false,
          totalBytes: 0,
          hadSuccessfulTransport: false
        }
      })
    ).toBe('fallback-relay')
  })

  it('restarts the peer when relay mode still degrades later', () => {
    expect(
      decidePeerRecoveryAction({
        transportMode: 'relay',
        iceConnectionState: 'failed',
        health: {
          hasSelectedCandidatePair: false,
          totalBytes: 0,
          hadSuccessfulTransport: false
        }
      })
    ).toBe('restart')
  })
})
