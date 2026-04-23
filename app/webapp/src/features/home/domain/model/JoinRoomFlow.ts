export type JoinRoomFlowParams = {
  idOrLink: string
}

export type JoinRoomFlowResult = {
  roomId: string
}

export type JoinRoomFlowError =
  | { type: 'invalid-room-input' }
  | { type: 'unknown-error' }
  | { type: 'room-not-found' }
