import { MutableStateFlow } from './state-flow'
import type { Flow, StateFlow } from './types'

/**
 * Maps every value from a source flow. StateFlow inputs preserve synchronous state.
 */
export function map<T, R>(source: StateFlow<T>, mapper: (value: T) => R): StateFlow<R>
export function map<T, R>(source: Flow<T>, mapper: (value: T) => R): Flow<R>
export function map<T, R>(source: Flow<T>, mapper: (value: T) => R): Flow<R> {
  if (isStateFlow(source)) {
    const state = new MutableStateFlow(mapper(source.value))
    source.subscribe((value) => {
      state.set(mapper(value))
    })
    return state.asStateFlow()
  }

  return {
    subscribe: (listener) => source.subscribe((value) => listener(mapper(value)))
  }
}

/**
 * Skips repeated values. Object.is is used by default to mirror React snapshots.
 */
export function distinctUntilChanged<T>(source: StateFlow<T>, equals?: (left: T, right: T) => boolean): StateFlow<T>
export function distinctUntilChanged<T>(source: Flow<T>, equals?: (left: T, right: T) => boolean): Flow<T>
export function distinctUntilChanged<T>(source: Flow<T>, equals: (left: T, right: T) => boolean = Object.is): Flow<T> {
  if (isStateFlow(source)) {
    const state = new MutableStateFlow(source.value)
    source.subscribe((value) => {
      if (!equals(state.value, value)) {
        state.set(value)
      }
    })
    return state.asStateFlow()
  }

  return {
    subscribe(listener) {
      let hasPrevious = false
      let previous: T

      return source.subscribe((value) => {
        if (!hasPrevious || !equals(previous, value)) {
          hasPrevious = true
          previous = value
          listener(value)
        }
      })
    }
  }
}

/**
 * Combines two StateFlows into one derived StateFlow.
 */
export function combine<A, B, R>(
  left: StateFlow<A>,
  right: StateFlow<B>,
  combiner: (left: A, right: B) => R
): StateFlow<R> {
  const state = new MutableStateFlow(combiner(left.value, right.value))
  const update = () => {
    state.set(combiner(left.value, right.value))
  }

  left.subscribe(update)
  right.subscribe(update)

  return state.asStateFlow()
}

function isStateFlow<T>(flow: Flow<T>): flow is StateFlow<T> {
  return 'value' in flow
}
