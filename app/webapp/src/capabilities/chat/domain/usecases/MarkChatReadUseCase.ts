import type { ChatRepository } from '../repository/ChatRepository'

export class MarkChatReadUseCase {
  constructor(private readonly repository: ChatRepository) {}

  execute(messageId: string) {
    return this.repository.markRead(messageId)
  }
}
