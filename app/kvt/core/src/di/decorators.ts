import { defineModule, type KvtModule } from './module'
import { provideFactory, provideSingleton, provideViewModel, type Provider } from './provider'
import type { ServiceIdentifier } from './token'

type ProviderKind = 'factory' | 'singleton' | 'viewModel'
type ModuleClass = abstract new (...args: never[]) => unknown

interface DecoratedModuleOptions {
  readonly name?: string
  readonly includes?: readonly KvtModule[]
}

interface ProviderMetadata {
  readonly propertyKey: string | symbol
  identifier?: ServiceIdentifier<unknown>
  kind: ProviderKind
  dependencies: ServiceIdentifier<unknown>[]
}

interface ModuleMetadata {
  options: DecoratedModuleOptions
  providers: Map<string | symbol, ProviderMetadata>
}

const moduleMetadata = new WeakMap<object, ModuleMetadata>()

/**
 * Marks a class as a DI module, similar to Android's `@Module`.
 */
export function Module(options: DecoratedModuleOptions = {}): ClassDecorator {
  return (target) => {
    getModuleMetadata(target).options = options
  }
}

/**
 * Marks a static method as a provider, similar to Android's `@Provides`.
 */
export function Provides<TService>(identifier: ServiceIdentifier<TService>): MethodDecorator {
  return (target, propertyKey) => {
    const metadata = getProviderMetadata(target, propertyKey)
    metadata.identifier = identifier
  }
}

/**
 * Makes a provider lazy singleton. The instance is created on first resolve.
 */
export function Singleton(): MethodDecorator {
  return (target, propertyKey) => {
    getProviderMetadata(target, propertyKey).kind = 'singleton'
  }
}

/**
 * Marks a provider as ViewModel factory. ViewModelStore owns the lifecycle.
 */
export function ViewModelProvider(): MethodDecorator {
  return (target, propertyKey) => {
    getProviderMetadata(target, propertyKey).kind = 'viewModel'
  }
}

/**
 * Declares a provider method dependency.
 *
 * Parameter decorators keep dependencies close to the provider signature and
 * avoid reflect-metadata, so interfaces/tokens stay explicit.
 */
export function Inject<TService>(identifier: ServiceIdentifier<TService>): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (propertyKey === undefined) {
      throw new Error('@Inject is only supported on provider method parameters')
    }

    const metadata = getProviderMetadata(target, propertyKey)
    metadata.dependencies[parameterIndex] = identifier
  }
}

/**
 * Converts a decorated module class into an installable KVT module.
 */
export function createModuleFromClass(moduleClass: ModuleClass): KvtModule {
  const metadata = moduleMetadata.get(moduleClass)
  if (!metadata) {
    throw new Error('Class is not decorated with @Module')
  }

  return defineModule({
    name: metadata.options.name ?? moduleClass.name,
    includes: metadata.options.includes,
    providers: Array.from(metadata.providers.values()).map((providerMetadata) => {
      return createProviderFromMetadata(moduleClass, providerMetadata)
    })
  })
}

function createProviderFromMetadata(moduleClass: ModuleClass, metadata: ProviderMetadata): Provider {
  if (!metadata.identifier) {
    throw new Error(`Provider "${String(metadata.propertyKey)}" is missing @Provides(...)`)
  }

  const providerMethod = Reflect.get(moduleClass, metadata.propertyKey)
  if (typeof providerMethod !== 'function') {
    throw new Error(`Provider "${String(metadata.propertyKey)}" must be a static method`)
  }

  const factory = (...dependencies: unknown[]) => providerMethod(...dependencies)

  if (metadata.kind === 'singleton') {
    return provideSingleton(metadata.identifier, metadata.dependencies, factory)
  }

  if (metadata.kind === 'viewModel') {
    return provideViewModel(metadata.identifier, metadata.dependencies, factory)
  }

  return provideFactory(metadata.identifier, metadata.dependencies, factory)
}

function getProviderMetadata(target: object, propertyKey: string | symbol): ProviderMetadata {
  const moduleTarget = typeof target === 'function' ? target : target.constructor
  const metadata = getModuleMetadata(moduleTarget)
  const existing = metadata.providers.get(propertyKey)
  if (existing) {
    return existing
  }

  const created: ProviderMetadata = {
    propertyKey,
    kind: 'factory',
    dependencies: []
  }
  metadata.providers.set(propertyKey, created)
  return created
}

function getModuleMetadata(target: object): ModuleMetadata {
  const existing = moduleMetadata.get(target)
  if (existing) {
    return existing
  }

  const created: ModuleMetadata = {
    options: {},
    providers: new Map()
  }
  moduleMetadata.set(target, created)
  return created
}
