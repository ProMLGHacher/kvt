import { MutableStateFlow } from '@kvt/core'
import type { ClientLogEntry } from '@capabilities/client-logs/domain/model/ClientLog'
import type { ClientLogRepository } from '@capabilities/client-logs/domain/repository/ClientLogRepository'

const storageKey = 'kvt.rooms.client-logs'
const maxEntries = 1000

export class LocalStorageClientLogRepository implements ClientLogRepository {
  private readonly state = new MutableStateFlow<readonly ClientLogEntry[]>(this.read())
  readonly entries = this.state.asStateFlow()

  append(entry: Omit<ClientLogEntry, 'id' | 'timestamp'>): void {
    const next = [
      ...this.state.value,
      { ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() }
    ].slice(-maxEntries)
    this.persist(next)
  }

  getEntries(): readonly ClientLogEntry[] {
    const entries = this.read()
    this.state.set(entries)
    return entries
  }

  clear(): void {
    this.persist([])
  }

  private read(): readonly ClientLogEntry[] {
    const stored = localStorage.getItem(storageKey)
    if (!stored) {
      return []
    }

    try {
      return JSON.parse(stored) as ClientLogEntry[]
    } catch {
      return []
    }
  }

  private persist(entries: readonly ClientLogEntry[]) {
    localStorage.setItem(storageKey, JSON.stringify(entries))
    this.state.set(entries)
  }
}
