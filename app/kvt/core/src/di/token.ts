// Constructor arguments are intentionally `any[]`: DI containers construct
// classes whose concrete dependency lists differ by implementation.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = unknown> = new (...args: any[]) => T

/**
 * Typed key for dependency lookup when an interface has no runtime value.
 */
export interface Token<T> {
  readonly id: symbol
  readonly description: string
}

export type ServiceIdentifier<T> = Token<T> | Constructor<T>
export type DependencyList = readonly ServiceIdentifier<unknown>[]

export interface InjectableConstructor<T> extends Constructor<T> {
  readonly inject?: DependencyList
}

export function createToken<T>(description: string): Token<T> {
  return {
    id: Symbol(description),
    description
  }
}

export function getServiceKey(
  identifier: ServiceIdentifier<unknown>
): symbol | Constructor<unknown> {
  return isToken(identifier) ? identifier.id : identifier
}

export function describeService(identifier: ServiceIdentifier<unknown>) {
  return isToken(identifier) ? identifier.description : identifier.name
}

export function isToken<T>(identifier: ServiceIdentifier<T>): identifier is Token<T> {
  return typeof identifier === 'object' && 'id' in identifier
}
