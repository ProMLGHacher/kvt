export type RoomControlKind = 'microphone' | 'camera' | 'screen'

export type RoomControlState = {
  readonly kind: RoomControlKind
  readonly enabled: boolean
  readonly loading: boolean
  readonly error: string | null
}

export type LeaveRoomResult = {
  readonly shouldNavigateHome: boolean
}
