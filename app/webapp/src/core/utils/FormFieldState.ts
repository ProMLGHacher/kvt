export type FormFieldState<T, ErrorKey extends string = string> = {
  readonly value: T
  readonly error: ErrorKey | null
}

export type FormFieldStateWithShowError<T, ErrorKey extends string = string> = {
  readonly value: T
  readonly error: ErrorKey | null
  readonly showError: boolean
}
