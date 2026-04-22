import type { Flow } from '@kvt/core'
import type { ClientLogEntry } from '../model/ClientLog'

export interface ClientLogRepository {
  readonly entries: Flow<readonly ClientLogEntry[]>
  append(entry: Omit<ClientLogEntry, 'id' | 'timestamp'>): void
  getEntries(): readonly ClientLogEntry[]
  clear(): void
}
