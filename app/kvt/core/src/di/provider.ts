import type { Container } from './container'
import type { SingletonOptions } from './container'
import type { ServiceIdentifier } from './token'

export type ResolvedDependencies<TDependencies extends readonly ServiceIdentifier<unknown>[]> = {
  [Index in keyof TDependencies]: TDependencies[Index] extends ServiceIdentifier<infer TService>
    ? TService
    : never
}

export interface Provider {
  install(container: Container): void
}

/**
 * Registers an already-created object.
 *
 * This is useful for platform/runtime services that are created outside DI,
 * similar to binding Android framework objects in an app component.
 */
export function provideValue<TService>(
  identifier: ServiceIdentifier<TService>,
  value: TService
): Provider {
  return {
    install(container) {
      container.bindValue(identifier, value)
    }
  }
}

/**
 * Registers a singleton provider.
 *
 * By default the factory is executed during module installation. Pass
 * `{ lazy: true }` to create the instance on first resolve.
 */
export function provideSingleton<
  TService,
  TDependencies extends readonly ServiceIdentifier<unknown>[]
>(
  identifier: ServiceIdentifier<TService>,
  dependencies: TDependencies,
  factory: (...dependencies: ResolvedDependencies<TDependencies>) => TService,
  options: SingletonOptions = {}
): Provider {
  return {
    install(container) {
      container.bindSingleton(
        identifier,
        (scope) => factory(...resolveAll(scope, dependencies)),
        options
      )
    }
  }
}

/**
 * Registers a transient provider. Each resolve creates a fresh instance.
 */
export function provideFactory<
  TService,
  TDependencies extends readonly ServiceIdentifier<unknown>[]
>(
  identifier: ServiceIdentifier<TService>,
  dependencies: TDependencies,
  factory: (...dependencies: ResolvedDependencies<TDependencies>) => TService
): Provider {
  return {
    install(container) {
      container.bindFactory(identifier, (scope) => factory(...resolveAll(scope, dependencies)))
    }
  }
}

/**
 * Registers a ViewModel factory.
 *
 * ViewModels are transient in the container; `ViewModelStore` owns their actual
 * lifecycle, matching Android's ViewModelProvider behavior.
 */
export function provideViewModel<
  TService,
  TDependencies extends readonly ServiceIdentifier<unknown>[]
>(
  identifier: ServiceIdentifier<TService>,
  dependencies: TDependencies,
  factory: (...dependencies: ResolvedDependencies<TDependencies>) => TService
): Provider {
  return provideFactory(identifier, dependencies, factory)
}

function resolveAll<TDependencies extends readonly ServiceIdentifier<unknown>[]>(
  container: Container,
  dependencies: TDependencies
): ResolvedDependencies<TDependencies> {
  return dependencies.map((dependency) =>
    container.resolve(dependency)
  ) as ResolvedDependencies<TDependencies>
}
