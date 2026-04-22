export type SignalPeer = 'publisher' | 'subscriber'

export type SignalingMessageType =
  | 'room.snapshot'
  | 'participant.joined'
  | 'participant.left'
  | 'participant.updated'
  | 'publisher.offer'
  | 'publisher.answer'
  | 'subscriber.offer'
  | 'subscriber.answer'
  | 'trickle.candidate'
  | 'media.slot.updated'
  | 'ice.restart.requested'
  | 'ice.restart.completed'
  | 'heartbeat.ping'
  | 'heartbeat.pong'
  | 'error'

export type SignalingMessage<TPayload = unknown> = {
  readonly type: SignalingMessageType
  readonly payload: TPayload
}
