export type RoomRequestKey =
  | 'openRoom'
  | 'enterRoom'
  | 'connectRoom'
  | 'microphone'
  | 'camera'
  | 'screenShare'

export class RoomRequestGuards {
  private readonly revisions = new Map<RoomRequestKey, number>()

  next(key: RoomRequestKey): number {
    const nextRevision = (this.revisions.get(key) ?? 0) + 1
    this.revisions.set(key, nextRevision)
    return nextRevision
  }

  isActual(key: RoomRequestKey, requestId: number): boolean {
    return requestId === (this.revisions.get(key) ?? 0)
  }

  invalidate(...keys: readonly RoomRequestKey[]) {
    for (const key of keys) {
      this.next(key)
    }
  }
}
