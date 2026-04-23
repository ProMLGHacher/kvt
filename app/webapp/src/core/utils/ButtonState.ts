export type ButtonState<ErrorKey extends string = string> = {
  readonly enabled?: boolean
  readonly loading?: boolean
  readonly error?: ErrorKey | null
}
