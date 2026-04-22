export type ClipboardWriteParams = {
  readonly text: string
}

export type ClipboardWriteError =
  | { readonly type: 'clipboard-unavailable' }
  | { readonly type: 'permission-denied' }
  | { readonly type: 'unknown-error'; readonly message?: string }
