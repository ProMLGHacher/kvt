import { Subscription } from '../lifecycle/disposable'
import type { Disposable } from '../lifecycle/disposable'
import type { Flow, FlowListener, SharedFlow } from './types'

/**
 * Mutable one-off event stream.
 *
 * SharedFlow is intended for effects such as toast messages, navigation events
 * or analytics pings. It does not replay old values to new subscribers.
 */
export class MutableSharedFlow<T> implements Flow<T> {
  private listeners = new Set<FlowListener<T>>()

  emit(value: T) {
    for (const listener of this.listeners) {
      listener(value)
    }
  }

  subscribe(listener: FlowListener<T>): Disposable {
    this.listeners.add(listener)
    return new Subscription(() => {
      this.listeners.delete(listener)
    })
  }

  asSharedFlow(): SharedFlow<T> {
    return {
      subscribe: (listener) => this.subscribe(listener)
    }
  }
}
