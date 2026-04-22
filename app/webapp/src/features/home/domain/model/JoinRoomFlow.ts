export type JoinRoomFlowParams = {
  idOrLink: string
}

export type JoinRoomFlowResult = {
  roomId: string
}

export type JoinRoomFlowError = { type: 'unknown-error' } | { type: 'room-not-found' }
