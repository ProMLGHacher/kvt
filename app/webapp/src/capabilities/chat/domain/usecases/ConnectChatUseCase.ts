import type { ChatConnectParams } from '../model/Chat'
import type { ChatRepository } from '../repository/ChatRepository'

export class ConnectChatUseCase {
  constructor(private readonly repository: ChatRepository) {}

  execute(params: ChatConnectParams) {
    return this.repository.connect(params)
  }
}
