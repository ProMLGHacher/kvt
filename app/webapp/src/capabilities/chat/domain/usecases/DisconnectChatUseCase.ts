import type { ChatRepository } from '../repository/ChatRepository'

export class DisconnectChatUseCase {
  constructor(private readonly repository: ChatRepository) {}

  execute() {
    this.repository.disconnect()
  }
}
