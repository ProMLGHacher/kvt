import type { ChatRepository } from '../repository/ChatRepository'

export class ObserveChatUseCase {
  constructor(private readonly repository: ChatRepository) {}

  execute() {
    return this.repository.state
  }
}
