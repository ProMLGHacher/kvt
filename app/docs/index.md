# KVT framework

KVT is a small TypeScript framework for building applications with clean architecture ideas:
dependency injection, lifecycle-aware ViewModels, observable state, feature modules, routing,
themes, and app-level internationalization.

The goal is not to copy Android APIs one-to-one. The goal is to bring the same clarity to web
apps:

- UI describes state and sends user actions.
- ViewModels own presentation logic.
- Use cases describe business actions.
- Repositories own data access.
- DI connects the graph without constructing everything inside components.
- Lifecycle cleanup is explicit and predictable.

## Start here

- Read [Application Architecture](./guide/architecture.md) to understand the layers.
- Read [ViewModel Lifecycle](./guide/viewmodel-lifecycle.md) before writing screens.
- Read [Disposable](./reference/disposable.md) if you are wondering what cleanup means in KVT.

## Inspired by Android docs

These docs intentionally follow the practical style of Android documentation: concept first,
recommended usage next, then a small example.

Useful Android references:

- [Guide to app architecture](https://developer.android.com/topic/architecture)
- [ViewModel overview](https://developer.android.com/topic/libraries/architecture/viewmodel)
- [StateFlow and SharedFlow](https://developer.android.com/kotlin/flow/stateflow-and-sharedflow)
- [Dependency injection in Android](https://developer.android.com/training/dependency-injection)
