import { act, render, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const loadJoinSessionMock = vi.fn()
const startMock = vi.fn()
const closeMock = vi.fn()
const setMicEnabledMock = vi.fn()
const setCameraEnabledMock = vi.fn()
const setScreenEnabledMock = vi.fn()
const conferenceClientCtor = vi.fn()
const clearJoinSessionMock = vi.fn()

vi.mock('@/features/session/session-storage', () => ({
  loadJoinSession: (...args: unknown[]) => loadJoinSessionMock(...args),
  clearJoinSession: (...args: unknown[]) => clearJoinSessionMock(...args)
}))

vi.mock('@/lib/rtc/conference-client', () => ({
  ConferenceClient: function MockConferenceClient(...args: unknown[]) {
    conferenceClientCtor(...args)
    return {
      start: startMock,
      close: closeMock,
      setMicEnabled: setMicEnabledMock,
      setCameraEnabled: setCameraEnabledMock,
      setScreenEnabled: setScreenEnabledMock
    }
  }
}))

import { RoomPage } from '@/features/room/room-page'

describe('RoomPage lifecycle', () => {
  beforeEach(() => {
    loadJoinSessionMock.mockReset()
    conferenceClientCtor.mockReset()
    clearJoinSessionMock.mockReset()
    startMock.mockReset().mockResolvedValue(undefined)
    closeMock.mockReset()
    setMicEnabledMock.mockReset()
    setCameraEnabledMock.mockReset()
    setScreenEnabledMock.mockReset()

    loadJoinSessionMock.mockImplementation(() => ({
      sessionId: crypto.randomUUID(),
      participantId: 'participant-1',
      roomId: 'room-1',
      role: 'host',
      wsUrl: 'ws://localhost/ws?sessionId=session-1',
      iceServers: [],
      snapshot: {
        roomId: 'room-1',
        hostParticipantId: 'participant-1',
        participants: [
          {
            id: 'participant-1',
            displayName: 'Host',
            role: 'host',
            slots: [
              { kind: 'audio', enabled: true, publishing: true, trackBound: true, revision: 1 },
              { kind: 'camera', enabled: false, publishing: false, trackBound: false, revision: 1 },
              { kind: 'screen', enabled: false, publishing: false, trackBound: false, revision: 1 }
            ]
          }
        ]
      }
    }))
  })

  it('keeps the same room session object across rerenders for the same room id', async () => {
    const tree = (
      <MemoryRouter initialEntries={['/rooms/room-1']}>
        <Routes>
          <Route path="/rooms/:roomId" element={<RoomPage />} />
        </Routes>
      </MemoryRouter>
    )

    const { rerender } = render(tree)

    await waitFor(() => {
      expect(startMock).toHaveBeenCalledTimes(1)
    })

    rerender(tree)

    await waitFor(() => {
      expect(loadJoinSessionMock).toHaveBeenCalledTimes(1)
      expect(conferenceClientCtor).toHaveBeenCalledTimes(1)
      expect(startMock).toHaveBeenCalledTimes(1)
    })
  })

  it('renders local self-preview when the room client exposes a local stream', async () => {
    loadJoinSessionMock.mockReset()
    loadJoinSessionMock.mockImplementation(() => ({
      sessionId: crypto.randomUUID(),
      participantId: 'participant-1',
      roomId: 'room-1',
      role: 'host',
      wsUrl: 'ws://localhost/ws?sessionId=session-1',
      iceServers: [],
      snapshot: {
        roomId: 'room-1',
        hostParticipantId: 'participant-1',
        participants: [
          {
            id: 'participant-1',
            displayName: 'Host',
            role: 'host',
            slots: [
              { kind: 'audio', enabled: true, publishing: true, trackBound: true, revision: 1 },
              { kind: 'camera', enabled: true, publishing: true, trackBound: true, revision: 1 },
              { kind: 'screen', enabled: false, publishing: false, trackBound: false, revision: 1 }
            ]
          }
        ]
      }
    }))

    const { container } = render(
      <MemoryRouter initialEntries={['/rooms/room-1']}>
        <Routes>
          <Route path="/rooms/:roomId" element={<RoomPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(conferenceClientCtor).toHaveBeenCalledTimes(1)
    })

    const events = conferenceClientCtor.mock.calls[0]?.[0] as {
      onLocalStream?: (stream: MediaStream | null) => void
    }

    await act(async () => {
      events.onLocalStream?.({} as MediaStream)
    })

    expect(container.querySelectorAll('video')).toHaveLength(1)
  })

  it('clears stale remote stream diagnostics when a participant disappears from the snapshot', async () => {
    loadJoinSessionMock.mockReset()
    loadJoinSessionMock.mockImplementation(() => ({
      sessionId: crypto.randomUUID(),
      participantId: 'participant-1',
      roomId: 'room-1',
      role: 'host',
      wsUrl: 'ws://localhost/ws?sessionId=session-1',
      iceServers: [],
      snapshot: {
        roomId: 'room-1',
        hostParticipantId: 'participant-1',
        participants: [
          {
            id: 'participant-1',
            displayName: 'Host',
            role: 'host',
            slots: [
              { kind: 'audio', enabled: true, publishing: true, trackBound: true, revision: 1 },
              { kind: 'camera', enabled: false, publishing: false, trackBound: false, revision: 1 },
              { kind: 'screen', enabled: false, publishing: false, trackBound: false, revision: 1 }
            ]
          },
          {
            id: 'participant-2',
            displayName: 'Guest',
            role: 'participant',
            slots: [
              { kind: 'audio', enabled: true, publishing: true, trackBound: true, revision: 1 },
              { kind: 'camera', enabled: false, publishing: false, trackBound: false, revision: 1 },
              { kind: 'screen', enabled: false, publishing: false, trackBound: false, revision: 1 }
            ]
          }
        ]
      }
    }))

    const { findByText } = render(
      <MemoryRouter initialEntries={['/rooms/room-1']}>
        <Routes>
          <Route path="/rooms/:roomId" element={<RoomPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(conferenceClientCtor).toHaveBeenCalledTimes(1)
    })

    const events = conferenceClientCtor.mock.calls[0]?.[0] as {
      onRemoteTrack?: (participantId: string, kind: 'audio' | 'camera' | 'screen', stream: MediaStream) => void
      onSnapshot?: (snapshot: {
        roomId: string
        hostParticipantId: string
        participants: Array<{
          id: string
          displayName: string
          role: 'host' | 'participant'
          slots: Array<{
            kind: 'audio' | 'camera' | 'screen'
            enabled: boolean
            publishing: boolean
            trackBound: boolean
            revision: number
          }>
        }>
      }) => void
    }

    await act(async () => {
      events.onRemoteTrack?.('participant-2', 'audio', {} as MediaStream)
    })

    await findByText('1 remote streams')

    await act(async () => {
      events.onSnapshot?.({
        roomId: 'room-1',
        hostParticipantId: 'participant-1',
        participants: [
          {
            id: 'participant-1',
            displayName: 'Host',
            role: 'host',
            slots: [
              { kind: 'audio', enabled: true, publishing: true, trackBound: true, revision: 1 },
              { kind: 'camera', enabled: false, publishing: false, trackBound: false, revision: 1 },
              { kind: 'screen', enabled: false, publishing: false, trackBound: false, revision: 1 }
            ]
          }
        ]
      })
    })

    await findByText('0 remote streams')
  })
})
