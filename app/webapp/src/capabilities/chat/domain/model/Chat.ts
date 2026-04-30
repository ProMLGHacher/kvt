import type {
  ChatAttachment,
  ChatChannel,
  ChatConnectionStatus,
  ChatLinkPreview,
  ChatMessage,
  ChatParticipant,
  ChatReadCursor
} from '@kvatum/chat-sdk'

export type {
  ChatAttachment,
  ChatChannel,
  ChatConnectionStatus,
  ChatLinkPreview,
  ChatMessage,
  ChatParticipant,
  ChatReadCursor
}

export type ChatState = {
  readonly status: ChatConnectionStatus
  readonly participant: ChatParticipant | null
  readonly activeChannelId: string | null
  readonly channels: readonly ChatChannel[]
  readonly messages: readonly ChatMessage[]
  readonly readCursors: readonly ChatReadCursor[]
  readonly unreadCount: number
  readonly lastError: string | null
}

export type ChatConnectParams = {
  readonly chatUrl: string
  readonly chatToken: string
  readonly chatChannelId: string
}

export type ChatSendMessageParams = {
  readonly markdown: string
  readonly replyToId?: string | null
  readonly attachments?: readonly ChatAttachment[]
}

export type ChatUploadAttachmentParams = {
  readonly file: File
}

export type ChatError = {
  readonly type: 'connection-failed' | 'send-failed' | 'unknown-error'
  readonly message?: string
}
