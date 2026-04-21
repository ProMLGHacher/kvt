export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedThemeMode = 'light' | 'dark'

export interface ColorScheme {
  readonly primary: string
  readonly primaryHover: string
  readonly primaryActive: string
  readonly primaryForeground: string
  readonly background: string
  readonly foreground: string
  readonly surface: string
  readonly surfaceForeground: string
  readonly muted: string
  readonly mutedForeground: string
  readonly accent: string
  readonly accentForeground: string
  readonly border: string
  readonly input: string
  readonly ring: string
  readonly success: string
  readonly warning: string
  readonly destructive: string
  readonly info: string
  readonly onFeedback: string
}

export interface TypographyScale {
  readonly fontSans: string
  readonly fontDisplay: string
  readonly fontMono: string
  readonly sizes: Record<string, string>
  readonly lineHeights: Record<string, string>
  readonly tracking: Record<string, string>
}

export interface ShapeScale {
  readonly radius: Record<string, string>
}

export interface KvtTheme {
  readonly light: ColorScheme
  readonly dark: ColorScheme
  readonly typography: TypographyScale
  readonly shapes: ShapeScale
}
