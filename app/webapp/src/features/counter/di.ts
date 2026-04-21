import {
  Inject,
  Module,
  Provides,
  Singleton,
  ViewModelProvider,
  createModuleFromClass,
} from "@kvt/core";
import { InMemoryCounterRepository } from "./data";
import {
  counterRepositoryToken,
  IncrementCounterUseCase,
  type CounterRepository,
} from "./domain";
import { CounterViewModel } from "./presentation";

/**
 * Feature composition root.
 *
 * Screens do not assemble repositories, use cases, or ViewModels manually; they
 * request a ViewModel and the container resolves the whole graph from here.
 */
@Module({ name: "CounterModule" })
class CounterModule {
  @Provides(counterRepositoryToken)
  @Singleton()
  static provideCounterRepository(): CounterRepository {
    return new InMemoryCounterRepository();
  }

  @Provides(IncrementCounterUseCase)
  static provideIncrementCounterUseCase(
    @Inject(counterRepositoryToken) repository: CounterRepository,
  ): IncrementCounterUseCase {
    return new IncrementCounterUseCase(repository);
  }

  @Provides(CounterViewModel)
  @ViewModelProvider()
  static provideCounterViewModel(
    @Inject(IncrementCounterUseCase) incrementCounter: IncrementCounterUseCase,
    @Inject(counterRepositoryToken) repository: CounterRepository,
  ): CounterViewModel {
    return new CounterViewModel(incrementCounter, repository);
  }
}

export const counterModule = createModuleFromClass(CounterModule);
