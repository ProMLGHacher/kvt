import { useEffect, useRef, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import type { TFunction } from 'i18next'
import { renderMarkdown, type ChatMessage } from '@kvatum/chat-sdk'
import { Button, ScrollArea, Textarea, cn } from '@core/design-system'
import type { RoomChatState } from '../../model/RoomState'

type VoiceT = TFunction<'voice'>

export interface RoomChatPanelProps {
  readonly chat: RoomChatState
  readonly localParticipantId: string | null
  readonly onDraftChange: (value: string) => void
  readonly onReply: (messageId: string) => void
  readonly onReplyCancel: () => void
  readonly onReaction: (messageId: string, emoji: string) => void
  readonly onSend: () => void
  readonly onFileSelected: (file: File) => void
  readonly t: VoiceT
}

export function RoomChatPanel({
  chat,
  localParticipantId,
  onDraftChange,
  onReply,
  onReplyCancel,
  onReaction,
  onSend,
  onFileSelected,
  t
}: RoomChatPanelProps) {
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const replyTarget = chat.replyToId
    ? chat.messages.find((message) => message.id === chat.replyToId)
    : null

  useEffect(() => {
    const node = messagesRef.current
    if (node) {
      node.scrollTop = node.scrollHeight
    }
  }, [chat.messages.length, chat.open])

  function submit(event: FormEvent) {
    event.preventDefault()
    onSend()
  }

  function handleDraftKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
      return
    }
    event.preventDefault()
    onSend()
  }

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelected(file)
    }
    event.target.value = ''
  }

  return (
    <aside className="animate-panel-in grid h-[min(42rem,calc(100dvh-6.5rem))] min-h-0 w-full self-start overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/94 text-white shadow-2xl shadow-black/25 backdrop-blur-xl lg:w-[24rem] xl:w-[28rem]">
      <div className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">{t('room.chat.title')}</h2>
            {chat.status !== 'connected' && (
              <span className="rounded-full bg-white/8 px-2 py-1 text-[0.68rem] uppercase tracking-wide text-slate-400">
                {chat.status}
              </span>
            )}
          </div>
          {chat.error && <p className="mt-1 text-xs text-destructive">{chat.error}</p>}
        </div>

        <ScrollArea ref={messagesRef} className="min-h-0 overscroll-contain px-4 py-3">
          {chat.messages.length === 0 ? (
            <div className="grid min-h-48 place-items-center text-center text-sm text-slate-400">
              {t('room.chat.empty')}
            </div>
          ) : (
            <div className="grid gap-1">
              {buildRows(chat.messages, chat.lastReadMessageId).map((row) => {
                if (row.type === 'date') {
                  return <DateDivider key={row.id} label={row.label} />
                }
                if (row.type === 'new') {
                  return <NewMessagesDivider key={row.id} label={t('room.chat.newMessages')} />
                }
                return (
                  <MessageRow
                    key={row.message.id}
                    compact={row.compact}
                    localParticipantId={localParticipantId}
                    message={row.message}
                    t={t}
                    onReaction={onReaction}
                    onReply={onReply}
                  />
                )
              })}
            </div>
          )}
        </ScrollArea>

        <form className="border-t border-white/10 p-3" onSubmit={submit}>
          {replyTarget && (
            <div className="mb-2 grid gap-1 rounded-2xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs text-slate-300">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate font-medium text-primary">
                  {t('room.chat.reply')}: {replyTarget.author.displayName}
                </span>
                <button
                  className="shrink-0 text-slate-200 hover:text-white"
                  type="button"
                  onClick={onReplyCancel}
                >
                  {t('room.chat.cancelReply')}
                </button>
              </div>
              <span className="line-clamp-2 text-slate-400">{replyPreview(replyTarget)}</span>
            </div>
          )}

          <div className="grid gap-2">
            {chat.pendingAttachments.length > 0 && (
              <div className="grid gap-1">
                {chat.pendingAttachments.map((attachment) => (
                  <AttachmentChip key={attachment.id} attachment={attachment} />
                ))}
              </div>
            )}

            <Textarea
              className="max-h-36 min-h-16 resize-none rounded-3xl border-white/10 bg-white/8 text-white placeholder:text-slate-500"
              placeholder={t('room.chat.placeholder')}
              value={chat.draft}
              onChange={(event) => onDraftChange(event.target.value)}
              onKeyDown={handleDraftKeyDown}
            />

            <div className="flex items-center gap-2">
              <label className="inline-flex h-10 cursor-pointer items-center rounded-full bg-white/8 px-3 text-sm text-slate-200 hover:bg-white/12">
                <input className="sr-only" type="file" onChange={selectFile} />
                Файл
              </label>
              <Button
                className="flex-1 rounded-full"
                disabled={!chat.draft.trim() && chat.pendingAttachments.length === 0}
                type="submit"
              >
                {t('room.chat.send')}
              </Button>
            </div>

            <p className="px-2 text-[0.68rem] text-slate-500">
              Enter - отправить, Shift+Enter - новая строка
            </p>
          </div>
        </form>
      </div>
    </aside>
  )
}

type Row =
  | { readonly type: 'date'; readonly id: string; readonly label: string }
  | { readonly type: 'new'; readonly id: string }
  | { readonly type: 'message'; readonly message: ChatMessage; readonly compact: boolean }

function buildRows(messages: readonly ChatMessage[], lastReadMessageId: string | null): Row[] {
  const rows: Row[] = []
  let previousAuthorId: string | null = null
  let previousDay: string | null = null
  let insertedNewDivider = false

  for (const message of messages) {
    const day = new Date(message.createdAt).toDateString()
    if (day !== previousDay) {
      rows.push({ type: 'date', id: `date:${day}`, label: formatDay(message.createdAt) })
      previousDay = day
      previousAuthorId = null
    }

    if (!insertedNewDivider && lastReadMessageId && message.id !== lastReadMessageId) {
      const lastReadIndex = messages.findIndex((item) => item.id === lastReadMessageId)
      const currentIndex = messages.findIndex((item) => item.id === message.id)
      if (lastReadIndex >= 0 && currentIndex > lastReadIndex) {
        rows.push({ type: 'new', id: `new:${message.id}` })
        insertedNewDivider = true
        previousAuthorId = null
      }
    }

    rows.push({
      type: 'message',
      message,
      compact: previousAuthorId === message.author.id
    })
    previousAuthorId = message.author.id
  }

  return rows
}

function MessageRow({
  message,
  compact,
  localParticipantId,
  onReply,
  onReaction,
  t
}: {
  readonly message: ChatMessage
  readonly compact: boolean
  readonly localParticipantId: string | null
  readonly onReply: (messageId: string) => void
  readonly onReaction: (messageId: string, emoji: string) => void
  readonly t: VoiceT
}) {
  const mine = message.author.id === localParticipantId
  const deleted = Boolean(message.deletedAt)

  return (
    <div className={cn('group grid grid-cols-[2.25rem_minmax(0,1fr)] gap-2', compact && 'pt-0')}>
      <div className="pt-1">
        {!compact && (
          <div className="grid size-9 place-items-center rounded-full bg-white/12 text-sm font-semibold">
            {message.author.displayName.slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>
      <div className={cn('min-w-0 rounded-2xl px-2 py-1.5', mine && 'bg-white/5')}>
        {!compact && (
          <div className="flex items-baseline gap-2">
            <p className="truncate text-sm font-semibold">{message.author.displayName}</p>
            <time className="text-[0.7rem] text-slate-500">{formatTime(message.createdAt)}</time>
            {message.pending && <span className="text-[0.7rem] text-slate-500">sending</span>}
            {message.editedAt && (
              <span className="text-[0.7rem] text-slate-500">{t('room.chat.edited')}</span>
            )}
          </div>
        )}

        {message.replyToId && (
          <div className="mb-1 rounded-xl border-l-2 border-primary/60 bg-white/5 px-2 py-1 text-xs text-slate-400">
            {t('room.chat.reply')}
          </div>
        )}

        <div
          className={cn(
            'chat-markdown max-w-none break-words text-sm leading-6 [&_a]:text-primary [&_blockquote]:border-l-2 [&_blockquote]:border-primary/50 [&_blockquote]:pl-2 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_p]:my-0 [&_strong]:font-semibold',
            deleted && 'italic text-slate-500'
          )}
          dangerouslySetInnerHTML={{
            __html: deleted ? 'Сообщение удалено.' : renderMarkdown(message.bodyMarkdown)
          }}
        />

        {message.linkPreviews.map((preview) => (
          <a
            key={preview.url}
            className="mt-2 block rounded-2xl border border-white/10 bg-white/8 p-3 text-xs text-slate-300 hover:bg-white/12"
            href={preview.url}
            rel="noreferrer"
            target="_blank"
          >
            <span className="block truncate font-semibold text-white">
              {preview.title || preview.url}
            </span>
            {preview.description && (
              <span className="mt-1 line-clamp-2 block">{preview.description}</span>
            )}
          </a>
        ))}

        {message.attachments.length > 0 && (
          <div className="mt-2 grid gap-2">
            {message.attachments.map((attachment) => (
              <AttachmentPreview key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-1 opacity-80 transition group-hover:opacity-100">
          {Object.entries(message.reactions ?? {}).map(([emoji, users]) => (
            <button
              key={emoji}
              className={cn(
                'rounded-full bg-white/8 px-2 py-0.5 text-xs hover:bg-white/14',
                users.includes(localParticipantId ?? '') && 'bg-primary/70 text-primary-foreground'
              )}
              type="button"
              onClick={() => onReaction(message.id, emoji)}
            >
              {emoji} {users.length}
            </button>
          ))}
          {!deleted && !message.pending && (
            <>
              <button
                className="rounded-full px-2 py-0.5 text-xs text-slate-400 hover:bg-white/8 hover:text-white"
                type="button"
                onClick={() => onReaction(message.id, '👍')}
              >
                👍
              </button>
              <button
                className="rounded-full px-2 py-0.5 text-xs text-slate-400 hover:bg-white/8 hover:text-white"
                type="button"
                onClick={() => onReply(message.id)}
              >
                {t('room.chat.reply')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function AttachmentChip({ attachment }: { readonly attachment: ChatMessage['attachments'][number] }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/8 px-3 py-2 text-xs text-slate-300">
      <span className="min-w-0 truncate">{attachment.fileName}</span>
      <span className="shrink-0 text-slate-500">{attachment.status}</span>
    </div>
  )
}

function AttachmentPreview({
  attachment
}: {
  readonly attachment: ChatMessage['attachments'][number]
}) {
  if (attachment.kind === 'image') {
    return (
      <a href={attachment.url} rel="noreferrer" target="_blank">
        <img
          alt={attachment.fileName}
          className="max-h-56 w-full rounded-2xl object-cover"
          src={attachment.previewUrl || attachment.url}
        />
      </a>
    )
  }
  if (attachment.kind === 'video') {
    return (
      <video
        className="max-h-64 w-full rounded-2xl bg-black"
        controls
        poster={attachment.posterUrl}
        src={attachment.url}
      />
    )
  }
  return (
    <a
      className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xs text-slate-300 hover:bg-white/12"
      href={attachment.url}
      rel="noreferrer"
      target="_blank"
    >
      <span className="min-w-0 truncate">{attachment.fileName}</span>
      <span className="shrink-0">{formatBytes(attachment.sizeBytes)}</span>
    </a>
  )
}

function DateDivider({ label }: { readonly label: string }) {
  return (
    <div className="flex items-center gap-3 py-3 text-xs font-semibold text-slate-500">
      <span className="h-px flex-1 bg-white/10" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  )
}

function NewMessagesDivider({ label }: { readonly label: string }) {
  return (
    <div className="flex items-center gap-3 py-2 text-xs font-semibold text-primary">
      <span className="h-px flex-1 bg-primary/50" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-primary/50" />
    </div>
  )
}

function replyPreview(message: ChatMessage): string {
  if (message.deletedAt) {
    return 'Сообщение удалено.'
  }
  return message.bodyPlain || message.bodyMarkdown || message.attachments[0]?.fileName || ''
}

function formatDay(value: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(
    new Date(value)
  )
}

function formatBytes(value: number): string {
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`
  return `${Math.round(value / 1024 / 1024)} MB`
}
