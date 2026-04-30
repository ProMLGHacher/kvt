import type { ChatRepository } from '../repository/ChatRepository'

export class ToggleChatReactionUseCase {
  constructor(private readonly repository: ChatRepository) {}

  execute(messageId: string, emoji: string) {
    return this.repository.toggleReaction(messageId, emoji)
  }
}
