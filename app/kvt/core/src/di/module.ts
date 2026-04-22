import type { Container } from './container'
import type { Provider } from './provider'

export type KvtModule = (container: Container) => void

export interface ModuleDefinition {
  readonly name?: string
  readonly includes?: readonly KvtModule[]
  readonly providers: readonly Provider[]
}

export type LoadedModule = KvtModule | { default: KvtModule } | { module: KvtModule }
export type LazyModuleLoader = () => Promise<LoadedModule>

/**
 * Android-like module declaration.
 *
 * A module is only a composition root: it describes providers and included
 * modules. Singleton providers are eager unless registered with `{ lazy: true }`.
 */
export function defineModule(definition: ModuleDefinition): KvtModule {
  return (container) => {
    for (const includedModule of definition.includes ?? []) {
      container.install(includedModule)
    }

    for (const provider of definition.providers) {
      provider.install(container)
    }
  }
}

/**
 * Backward-compatible function module helper.
 */
export function createModule(configure: KvtModule): KvtModule {
  return configure
}

export function resolveLoadedModule(loadedModule: LoadedModule): KvtModule {
  if (typeof loadedModule === 'function') {
    return loadedModule
  }

  return 'module' in loadedModule ? loadedModule.module : loadedModule.default
}
