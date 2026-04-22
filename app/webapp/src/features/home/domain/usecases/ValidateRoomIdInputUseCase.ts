import type { UseCase } from '@kvt/core'
import type { RoomIdInput, RoomIdInputValidation } from '../model/RoomIdInput'

export class ValidateRoomIdInputUseCase implements UseCase<RoomIdInput, RoomIdInputValidation> {
  execute(input: RoomIdInput): RoomIdInputValidation {
    const trimmed = input.value.trim()
    if (!trimmed) {
      return { valid: false, reason: 'empty' }
    }

    const roomUrlMatch = trimmed.match(/\/rooms\/([^/?#]+)/)
    const roomId = roomUrlMatch?.[1] ?? trimmed
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(roomId)) {
      return { valid: false, reason: 'invalid-format' }
    }

    return { valid: true, roomId }
  }
}
