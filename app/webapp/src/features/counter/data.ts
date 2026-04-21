import { MutableStateFlow } from '@kvt/core'
import type { CounterRepository } from './domain'

export class InMemoryCounterRepository implements CounterRepository {
  private readonly state = new MutableStateFlow(0)
  readonly count = this.state.asStateFlow()

  increment() {
    const next = this.state.value + 1
    this.state.set(next)
    return next
  }
}
