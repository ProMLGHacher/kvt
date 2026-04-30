import type { ChatSendMessageParams } from '../model/Chat'
import type { ChatRepository } from '../repository/ChatRepository'

export class SendChatMessageUseCase {
  constructor(private readonly repository: ChatRepository) {}

  execute(params: ChatSendMessageParams) {
    return this.repository.sendMessage(params)
  }
}
