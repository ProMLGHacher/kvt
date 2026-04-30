import type { ChatUploadAttachmentParams } from '../model/Chat'
import type { ChatRepository } from '../repository/ChatRepository'

export class UploadChatAttachmentUseCase {
  constructor(private readonly repository: ChatRepository) {}

  execute(params: ChatUploadAttachmentParams) {
    return this.repository.uploadAttachment(params)
  }
}
