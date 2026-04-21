import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { defaultKvtTheme } from '../tokens/default-theme'
import type { KvtTheme, ResolvedThemeMode, ThemeMode } from '../tokens/types'

const storageKey = 'kvt.theme.mode'

export interface KvtThemeContextValue {
  readonly theme: KvtTheme
  readonly mode: ThemeMode
  readonly resolvedMode: ResolvedThemeMode
  setMode(mode: ThemeMode): void
  toggleMode(): void
}

export interface KvtThemeProviderProps {
  readonly children: ReactNode
  readonly theme?: KvtTheme
  readonly defaultMode?: ThemeMode
  readonly storage?: Storage
}

const KvtThemeContext = createContext<KvtThemeContextValue | null>(null)

export function KvtThemeProvider({
  children,
  theme = defaultKvtTheme,
  defaultMode = 'system',
  storage = globalThis.localStorage
}: KvtThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return (storage?.getItem(storageKey) as ThemeMode | null) ?? defaultMode
  })
  const [systemMode, setSystemMode] = useState<ResolvedThemeMode>(() => getSystemMode())
  const resolvedMode = mode === 'system' ? systemMode : mode

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => setSystemMode(mediaQuery.matches ? 'dark' : 'light')
    listener()
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  useEffect(() => {
    applyThemeToDocument(theme, resolvedMode)
  }, [resolvedMode, theme])

  const value = useMemo<KvtThemeContextValue>(() => {
    const setMode = (nextMode: ThemeMode) => {
      storage?.setItem(storageKey, nextMode)
      setModeState(nextMode)
    }

    return {
      theme,
      mode,
      resolvedMode,
      setMode,
      toggleMode() {
        setMode(resolvedMode === 'dark' ? 'light' : 'dark')
      }
    }
  }, [mode, resolvedMode, storage, theme])

  return <KvtThemeContext.Provider value={value}>{children}</KvtThemeContext.Provider>
}

export function useKvtTheme(): KvtThemeContextValue {
  const value = useContext(KvtThemeContext)
  if (!value) {
    throw new Error('useKvtTheme must be used inside KvtThemeProvider')
  }

  return value
}

function getSystemMode(): ResolvedThemeMode {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeToDocument(theme: KvtTheme, mode: ResolvedThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.classList.toggle('light', mode === 'light')
  root.style.colorScheme = mode

  const colorScheme = theme[mode]
  root.style.setProperty('--primary', colorScheme.primary)
  root.style.setProperty('--primary-hover', colorScheme.primaryHover)
  root.style.setProperty('--primary-active', colorScheme.primaryActive)
  root.style.setProperty('--primary-foreground', colorScheme.primaryForeground)
  root.style.setProperty('--background', colorScheme.background)
  root.style.setProperty('--foreground', colorScheme.foreground)
  root.style.setProperty('--surface', colorScheme.surface)
  root.style.setProperty('--surface-foreground', colorScheme.surfaceForeground)
  root.style.setProperty('--muted', colorScheme.muted)
  root.style.setProperty('--muted-foreground', colorScheme.mutedForeground)
  root.style.setProperty('--accent', colorScheme.accent)
  root.style.setProperty('--accent-foreground', colorScheme.accentForeground)
  root.style.setProperty('--border', colorScheme.border)
  root.style.setProperty('--input', colorScheme.input)
  root.style.setProperty('--ring', colorScheme.ring)
  root.style.setProperty('--success', colorScheme.success)
  root.style.setProperty('--warning', colorScheme.warning)
  root.style.setProperty('--destructive', colorScheme.destructive)
  root.style.setProperty('--info', colorScheme.info)
  root.style.setProperty('--on-feedback', colorScheme.onFeedback)
}
