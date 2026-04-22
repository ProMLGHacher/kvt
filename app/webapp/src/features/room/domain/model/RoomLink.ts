export type CopyRoomLinkParams = {
  readonly roomId: string
  readonly origin: string
}

export type CopyRoomLinkResult = {
  readonly link: string
}

export type CopyRoomLinkError =
  | { readonly type: 'clipboard-unavailable' }
  | { readonly type: 'unknown-error' }
