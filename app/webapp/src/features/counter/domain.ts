import { createToken, type NoInputUseCase, type StateFlow } from '@kvt/core'

export interface CounterRepository {
  readonly count: StateFlow<number>
  increment(): number
}

export const counterRepositoryToken = createToken<CounterRepository>('CounterRepository')

export class IncrementCounterUseCase implements NoInputUseCase<number> {
  private readonly repository: CounterRepository

  constructor(repository: CounterRepository) {
    this.repository = repository
  }

  execute() {
    return this.repository.increment()
  }
}
