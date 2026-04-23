import type { ButtonState } from '@core/utils/ButtonState'
import type { FormFieldStateWithShowError } from '@core/utils/FormFieldState'

export type HomeUiState = {
  readonly idOrLinkToJoinState: FormFieldStateWithShowError<string>
  readonly joinButtonState: ButtonState
  readonly createRoomButtonState: ButtonState
  readonly feedback: string | null
}

export type HomeUiAction =
  | { readonly type: 'id-or-link-to-join-changed'; readonly value: string }
  | { readonly type: 'join-pressed' }
  | { readonly type: 'create-room-pressed' }

export type HomeUiEffect =
  | { readonly type: 'open-room'; readonly roomId: string }
  | { readonly type: 'show-message'; readonly message: string }

export const initialHomeState: HomeUiState = {
  idOrLinkToJoinState: { value: '', error: null, showError: false },
  joinButtonState: { enabled: false, loading: false, error: null },
  createRoomButtonState: { enabled: true, loading: false, error: null },
  feedback: null
}
