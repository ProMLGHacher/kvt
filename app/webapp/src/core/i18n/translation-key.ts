import type resources from './resources'

type TranslationPrimitive = string | number | boolean | null | undefined

export type ResourceShape<T> = {
  readonly [Key in keyof T]: T[Key] extends TranslationPrimitive ? string : ResourceShape<T[Key]>
}

export const defineResource =
  <BaseResource>() =>
  <Resource extends ResourceShape<BaseResource>>(resource: Resource) =>
    resource

type DotPath<T> = {
  [Key in keyof T & string]: T[Key] extends TranslationPrimitive ? Key : `${Key}.${DotPath<T[Key]>}`
}[keyof T & string]

export type TranslationNamespace = keyof typeof resources

export type TranslationKey<Namespace extends TranslationNamespace> = DotPath<
  (typeof resources)[Namespace]
>

export type PrefixedTranslationKey<
  Namespace extends TranslationNamespace,
  Prefix extends string
> = Extract<TranslationKey<Namespace>, `${Prefix}.${string}`>
