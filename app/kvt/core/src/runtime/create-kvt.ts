import { Container } from '../di/container'
import type { KvtModule } from '../di/module'
import { ViewModelStore } from '../lifecycle/view-model'
import type { Disposable } from '../lifecycle/disposable'

export interface KvtRuntime extends Disposable {
  readonly container: Container
  readonly viewModels: ViewModelStore
}

export interface KvtOptions {
  modules?: KvtModule[]
  container?: Container
  viewModels?: ViewModelStore
}

/**
 * Creates the framework runtime shared by an application or feature scope.
 */
export function createKvt(options: KvtOptions = {}): KvtRuntime {
  const container = options.container ?? new Container()
  const viewModels = options.viewModels ?? new ViewModelStore()

  for (const module of options.modules ?? []) {
    container.install(module)
  }

  return {
    container,
    viewModels,
    dispose() {
      viewModels.dispose()
      container.dispose()
    }
  }
}
