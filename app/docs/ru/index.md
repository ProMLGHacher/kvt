# KVT framework

KVT — небольшой TypeScript-фреймворк для приложений в стиле clean architecture:
dependency injection, lifecycle-aware ViewModels, observable state, feature modules, routing,
themes и интернационализация.

Цель не в том, чтобы один-в-один скопировать Android API. Цель — перенести ту же ясность в web:

- UI описывает состояние и отправляет действия пользователя.
- ViewModel владеет presentation-логикой.
- Use case описывает бизнес-действие.
- Repository владеет доступом к данным.
- DI собирает граф зависимостей без ручного создания всего внутри компонентов.
- Lifecycle cleanup явный и предсказуемый.

## С чего начать

- Прочитай [Архитектуру приложения](./guide/architecture.md), чтобы понять слои.
- Прочитай [Жизненный цикл ViewModel](./guide/viewmodel-lifecycle.md) перед созданием экранов.
- Прочитай [Disposable](./reference/disposable.md), если непонятно, что значит cleanup в KVT.

## В стиле Android docs

Документация специально написана в практичном стиле Android documentation: сначала концепция, потом
рекомендованное использование, затем маленький пример.

Полезные Android references:

- [Guide to app architecture](https://developer.android.com/topic/architecture)
- [ViewModel overview](https://developer.android.com/topic/libraries/architecture/viewmodel)
- [StateFlow and SharedFlow](https://developer.android.com/kotlin/flow/stateflow-and-sharedflow)
- [Dependency injection in Android](https://developer.android.com/training/dependency-injection)
