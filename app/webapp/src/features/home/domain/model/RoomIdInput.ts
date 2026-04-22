export type RoomIdInput = {
  readonly value: string
}

export type RoomIdInputValidation =
  | { readonly valid: true; readonly roomId: string }
  | { readonly valid: false; readonly reason: 'empty' | 'invalid-format' }
