import type ruChat from '../ru/chat'
import { defineResource } from '../../translation-key'

export default defineResource<typeof ruChat>()({
  eyebrow: 'KVT clean demo',
  title: 'Team chat',
  panes: {
    chats: 'Chats',
    thread: 'Thread',
    details: 'Details'
  },
  search: {
    label: 'Search chats and messages',
    placeholder: 'Search people and messages'
  },
  chatList: {
    pinned: 'pin',
    read: 'read'
  },
  composer: {
    placeholder: 'Write with **markdown**...',
    replyingTo: 'Replying to'
  },
  details: {
    title: 'Message details',
    readBy: 'Read by',
    reactions: 'Reactions',
    noReactions: 'No reactions yet'
  },
  actions: {
    send: 'Send',
    reply: 'Reply',
    delete: 'Delete',
    close: 'Close',
    cancel: 'Cancel'
  },
  empty: {
    noChat: 'Choose a chat',
    noMessage: 'Double-click a message to open details'
  },
  tips: {
    doubleClick: 'Double-click a message to open details'
  },
  toasts: {
    messageSent: 'Message sent',
    reactionUpdated: 'Reaction updated',
    messageDeleted: 'Message deleted',
    replyStarted: 'Reply mode enabled'
  },
  resize: {
    list: 'Resize chat list',
    details: 'Resize details pane'
  }
} as const)
