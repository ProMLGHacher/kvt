import { Subscription } from '../lifecycle/disposable'
import type { Disposable } from '../lifecycle/disposable'
import type { FlowListener, StateFlow } from './types'

/**
 * Mutable state holder intended to stay private inside ViewModels or repositories.
 *
 * Expose `asStateFlow()` to UI code so external consumers can observe state but
 * cannot mutate it directly.
 */
export class MutableStateFlow<T> implements StateFlow<T> {
  private listeners = new Set<FlowListener<T>>()
  private currentValue: T

  constructor(initialValue: T) {
    this.currentValue = initialValue
  }

  get value() {
    return this.currentValue
  }

  set(value: T) {
    if (Object.is(this.currentValue, value)) {
      return
    }

    this.currentValue = value
    this.emit(value)
  }

  update(reducer: (current: T) => T) {
    this.set(reducer(this.currentValue))
  }

  subscribe(listener: FlowListener<T>): Disposable {
    this.listeners.add(listener)
    listener(this.currentValue)
    return new Subscription(() => {
      this.listeners.delete(listener)
    })
  }

  asStateFlow(): StateFlow<T> {
    const thisFlow = this

    return {
      get value() {
        return thisFlow.value
      },
      subscribe: (listener) => thisFlow.subscribe(listener)
    }
  }

  private emit(value: T) {
    for (const listener of this.listeners) {
      listener(value)
    }
  }
}
