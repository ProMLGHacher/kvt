import type { Disposable } from '../lifecycle/disposable'
import type { KvtModule, LazyModuleLoader } from './module'
import { resolveLoadedModule } from './module'
import type { Constructor, DependencyList, InjectableConstructor, ServiceIdentifier } from './token'
import { describeService, getServiceKey } from './token'

type Binding<T> =
  | { kind: 'value'; value: T }
  | { kind: 'factory'; scope: BindingScope; factory: (container: Container) => T; instance?: T; hasInstance: boolean }
  | {
      kind: 'class'
      scope: BindingScope
      implementation: InjectableConstructor<T>
      dependencies?: DependencyList
      instance?: T
      hasInstance: boolean
    }

export type BindingScope = 'transient' | 'singleton'

/**
 * Small constructor-based DI container with parent/child scopes.
 *
 * The API mirrors the useful parts of Inversify (`bind().to()`, `toSelf()`,
 * singleton/transient scopes) without requiring decorators or reflect-metadata.
 * Dependencies are explicit through `static inject` or `withDependencies(...)`,
 * which keeps construction predictable in Vite and easy to test.
 */
export class Container implements Disposable {
  private readonly bindings = new Map<symbol | Constructor<unknown>, Binding<unknown>>()
  private readonly children = new Set<Container>()
  private readonly lazyModules = new Map<string, Promise<void>>()
  private disposed = false

  constructor(private readonly parent?: Container) {}

  bind<T>(identifier: ServiceIdentifier<T>): BindingBuilder<T> {
    return new BindingBuilder(this, identifier)
  }

  bindValue<T>(identifier: ServiceIdentifier<T>, value: T): this {
    this.setBinding(identifier, { kind: 'value', value })
    return this
  }

  bindFactory<T>(identifier: ServiceIdentifier<T>, factory: (container: Container) => T): this {
    this.setBinding(identifier, { kind: 'factory', scope: 'transient', factory, hasInstance: false })
    return this
  }

  bindSingleton<T>(identifier: ServiceIdentifier<T>, factory: (container: Container) => T): this {
    this.setBinding(identifier, { kind: 'factory', scope: 'singleton', factory, hasInstance: false })
    return this
  }

  bindClass<T>(
    identifier: ServiceIdentifier<T>,
    implementation: InjectableConstructor<T>,
    options: { scope?: BindingScope; dependencies?: DependencyList } = {}
  ): this {
    this.setBinding(identifier, {
      kind: 'class',
      scope: options.scope ?? 'transient',
      implementation,
      dependencies: options.dependencies,
      hasInstance: false
    })
    return this
  }

  bindSelf<T>(
    implementation: InjectableConstructor<T>,
    options?: { scope?: BindingScope; dependencies?: DependencyList }
  ): this {
    return this.bindClass(implementation, implementation, options)
  }

  rebind<T>(identifier: ServiceIdentifier<T>): BindingBuilder<T> {
    this.unbind(identifier)
    return this.bind(identifier)
  }

  unbind<T>(identifier: ServiceIdentifier<T>): this {
    this.bindings.delete(getServiceKey(identifier))
    return this
  }

  install(module: KvtModule): this {
    module(this)
    return this
  }

  /**
   * Installs a code-split module once.
   *
   * The loader is usually a dynamic `import(...)`, so feature bindings are not
   * pulled into the main bundle until the route/screen actually needs them.
   */
  loadModule(key: string, loader: LazyModuleLoader): Promise<void> {
    const existing = this.lazyModules.get(key)
    if (existing) {
      return existing
    }

    const promise = loader().then((loadedModule) => {
      this.install(resolveLoadedModule(loadedModule))
    })
    this.lazyModules.set(key, promise)
    return promise
  }

  createChild(): Container {
    const child = new Container(this)
    this.children.add(child)
    return child
  }

  resolve<T>(identifier: ServiceIdentifier<T>): T {
    const binding = this.getBinding(identifier)
    if (!binding) {
      if (this.parent) {
        return this.parent.resolve(identifier)
      }

      if (typeof identifier === 'function') {
        return this.instantiate(identifier as InjectableConstructor<T>)
      }

      throw new Error(`No binding found for "${describeService(identifier)}"`)
    }

    return this.resolveBinding(binding)
  }

  instantiate<T>(implementation: InjectableConstructor<T>, dependencies = implementation.inject ?? []): T {
    const args = dependencies.map((dependency) => this.resolve(dependency))
    return new implementation(...(args as never[]))
  }

  dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true
    for (const child of this.children) {
      child.dispose()
    }
    this.children.clear()
    this.parent?.children.delete(this)
  }

  setScope(identifier: ServiceIdentifier<unknown>, scope: BindingScope): void {
    const binding = this.getLocalBinding(identifier)
    if (binding.kind === 'value') {
      throw new Error('Value bindings do not have a scope')
    }

    binding.scope = scope
  }

  setDependencies(identifier: ServiceIdentifier<unknown>, dependencies: DependencyList): void {
    const binding = this.getLocalBinding(identifier)
    if (binding.kind !== 'class') {
      throw new Error('withDependencies() is only available for class bindings')
    }

    binding.dependencies = dependencies
  }

  private resolveBinding<T>(binding: Binding<T>): T {
    if (binding.kind === 'value') {
      return binding.value
    }

    if (binding.kind === 'factory') {
      if (binding.scope === 'singleton' && binding.hasInstance) {
        return binding.instance as T
      }

      const value = binding.factory(this)
      if (binding.scope === 'singleton') {
        binding.instance = value
        binding.hasInstance = true
      }
      return value
    }

    if (binding.scope === 'singleton' && binding.hasInstance) {
      return binding.instance as T
    }

    const value = this.instantiate(binding.implementation, binding.dependencies)
    if (binding.scope === 'singleton') {
      binding.instance = value
      binding.hasInstance = true
    }
    return value
  }

  private getBinding<T>(identifier: ServiceIdentifier<T>): Binding<T> | undefined {
    return this.bindings.get(getServiceKey(identifier)) as Binding<T> | undefined
  }

  private getLocalBinding(identifier: ServiceIdentifier<unknown>) {
    const binding = this.bindings.get(getServiceKey(identifier))
    if (!binding) {
      throw new Error(`No local binding found for "${describeService(identifier)}"`)
    }

    return binding
  }

  private setBinding<T>(identifier: ServiceIdentifier<T>, binding: Binding<T>) {
    this.bindings.set(getServiceKey(identifier), binding as Binding<unknown>)
  }
}

/**
 * Fluent binding builder inspired by Inversify's binding syntax.
 */
export class BindingBuilder<T> {
  constructor(
    private readonly container: Container,
    private readonly identifier: ServiceIdentifier<T>
  ) {}

  to(implementation: InjectableConstructor<T>): BindingScopeBuilder {
    this.container.bindClass(this.identifier, implementation)
    return new BindingScopeBuilder(this.container, this.identifier)
  }

  toSelf(this: BindingBuilder<T & object>): BindingScopeBuilder {
    if (typeof this.identifier !== 'function') {
      throw new Error('toSelf() can only be used with class identifiers')
    }

    this.container.bindClass(this.identifier, this.identifier as InjectableConstructor<T>)
    return new BindingScopeBuilder(this.container, this.identifier)
  }

  toFactory(factory: (container: Container) => T): BindingScopeBuilder {
    this.container.bindFactory(this.identifier, factory)
    return new BindingScopeBuilder(this.container, this.identifier)
  }

  toValue(value: T): void {
    this.container.bindValue(this.identifier, value)
  }
}

export class BindingScopeBuilder {
  constructor(
    private readonly container: Container,
    private readonly identifier: ServiceIdentifier<unknown>
  ) {}

  inTransientScope(): void {
    this.container.setScope(this.identifier, 'transient')
  }

  inSingletonScope(): void {
    this.container.setScope(this.identifier, 'singleton')
  }

  withDependencies(...dependencies: DependencyList): void {
    this.container.setDependencies(this.identifier, dependencies)
  }
}
