import {
  MutableSharedFlow,
  MutableStateFlow,
  ViewModel,
  type SharedFlow,
  type StateFlow
} from '@kvt/core'
import type { CounterRepository, IncrementCounterUseCase } from './domain'

export interface CounterUiState {
  readonly count: number
  readonly canCelebrate: boolean
}

export class CounterViewModel extends ViewModel {
  private readonly mutableUiState = new MutableStateFlow<CounterUiState>(createCounterUiState(0))
  private readonly mutableEffects = new MutableSharedFlow<number>()
  private readonly incrementCounter: IncrementCounterUseCase

  readonly uiState: StateFlow<CounterUiState> = this.mutableUiState.asStateFlow()
  readonly effects: SharedFlow<number> = this.mutableEffects.asSharedFlow()

  constructor(
    incrementCounter: IncrementCounterUseCase,
    counterRepository: CounterRepository
  ) {
    super()
    this.incrementCounter = incrementCounter
    this.addDisposable(
      counterRepository.count.subscribe((count) => {
        this.mutableUiState.set(createCounterUiState(count))
      })
    )
  }

  onIncrementClicked() {
    const next = this.incrementCounter.execute()
    if (next > 0 && next % 5 === 0) {
      this.mutableEffects.emit(next)
    }
  }
}

function createCounterUiState(count: number): CounterUiState {
  return {
    count,
    canCelebrate: count > 0 && count % 5 === 0
  }
}
