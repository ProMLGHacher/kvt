import type { Disposable } from '../lifecycle/disposable'

export type FlowListener<T> = (value: T) => void

/**
 * Read-only stream of values. This is the KVT equivalent of a minimal Kotlin Flow.
 */
export interface Flow<T> {
  subscribe(listener: FlowListener<T>): Disposable
}

/**
 * Read-only state stream with a synchronously available current value.
 */
export interface StateFlow<T> extends Flow<T> {
  readonly value: T
}

/**
 * Event stream for one-off effects such as navigation or toast messages.
 */
export type SharedFlow<T> = Flow<T>
