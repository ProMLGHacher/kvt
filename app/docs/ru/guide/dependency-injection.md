# Dependency Injection

KVT DI — constructor-based и explicit. Он берет читаемость Android/Hilt modules, но не требует
reflection metadata.

Android reference: [Dependency injection in Android](https://developer.android.com/training/dependency-injection).

## Зачем нужен DI

DI позволяет экрану запросить то, что ему нужно, без ручной сборки всей цепочки зависимостей.

Вместо этого в компоненте:

```ts
const repository = new CounterRepository()
const useCase = new IncrementCounterUseCase(repository)
const viewModel = new CounterViewModel(useCase)
```

компонент просит только ViewModel:

```ts
const viewModel = useViewModel(CounterViewModel)
```

Container resolve-ит все остальное.

## Module style

```ts
@Module()
export class CounterModule {
  @Provides(CounterRepositoryToken)
  @Singleton({ lazy: true })
  static repository() {
    return new InMemoryCounterRepository()
  }

  @Provides(IncrementCounterUseCase)
  static incrementUseCase(@Inject(CounterRepositoryToken) repository: CounterRepository) {
    return new IncrementCounterUseCase(repository)
  }
}
```

## Жизненный цикл Singleton

`@Singleton()` по умолчанию eager. Instance создается при install модуля.

Lazy нужно включать явно:

```ts
@Singleton({ lazy: true })
```

Lazy значит, что instance создается при первом запросе.

Так app startup остается быстрым, и это хорошо работает с route-level code splitting.

## Feature modules

Feature modules могут загружаться routes. Framework устанавливает DI module до render lazy
component, поэтому screen сразу может resolve-ить ViewModel.
