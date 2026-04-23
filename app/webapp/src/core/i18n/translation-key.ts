import type resources from './resources'

type TranslationPrimitive = string | number | boolean | null | undefined

export type ResourceShape<T> = {
  readonly [Key in keyof T]: T[Key] extends TranslationPrimitive ? string : ResourceShape<T[Key]>
}

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

export type CommonTranslationKey = TranslationKey<'common'>
export type ChatTranslationKey = TranslationKey<'chat'>
export type VoiceTranslationKey = TranslationKey<'voice'>
