import { MutableStateFlow } from '@kvt/core'
import type { ClientLogEntry } from '@capabilities/client-logs/domain/model/ClientLog'
import type { ClientLogRepository } from '@capabilities/client-logs/domain/repository/ClientLogRepository'
import { RingBuffer } from '@core/utils/RingBuffer'

const storageKey = 'kvatum.client-logs'
const legacyStorageKey = 'kvt.rooms.client-logs'
const maxEntries = 1000

export class LocalStorageClientLogRepository implements ClientLogRepository {
  private buffer = new RingBuffer<ClientLogEntry>(maxEntries, this.readMutable())

  private readonly state = new MutableStateFlow<readonly ClientLogEntry[]>(this.buffer.toArray())

  readonly entries = this.state.asStateFlow()

  private emitScheduled = false
  private persistTimer: number | undefined
  private dirty = false

  append(entry: Omit<ClientLogEntry, 'id' | 'timestamp'>): void {
    this.buffer.push({
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    })

    this.scheduleEmit()
    this.schedulePersist()
  }

  getEntries(): readonly ClientLogEntry[] {
    this.buffer = new RingBuffer<ClientLogEntry>(maxEntries, this.readMutable())

    const snapshot = this.buffer.toArray()
    this.state.set(snapshot)

    return snapshot
  }

  clear(): void {
    this.buffer.clear()
    this.state.set([])
    localStorage.removeItem(storageKey)
    localStorage.removeItem(legacyStorageKey)
  }

  private scheduleEmit(): void {
    if (this.emitScheduled) {
      return
    }

    this.emitScheduled = true

    requestAnimationFrame(() => {
      this.emitScheduled = false
      this.state.set(this.buffer.toArray())
    })
  }

  private schedulePersist(): void {
    this.dirty = true

    if (this.persistTimer !== undefined) {
      return
    }

    this.persistTimer = window.setTimeout(() => {
      this.persistTimer = undefined
      this.flushPersist()
    }, 500)
  }

  private flushPersist(): void {
    if (!this.dirty) {
      return
    }

    this.dirty = false
    localStorage.setItem(storageKey, JSON.stringify(this.buffer.toArray()))
  }

  private readMutable(): ClientLogEntry[] {
    const stored = localStorage.getItem(storageKey) ?? localStorage.getItem(legacyStorageKey)

    if (!stored) {
      return []
    }

    try {
      return (JSON.parse(stored) as ClientLogEntry[]).slice(-maxEntries)
    } catch {
      return []
    }
  }
}
