import i18next from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next'

export const supportedLanguages = ['ru', 'en'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

const languageStorageKey = 'webapp.language'

/**
 * Webapp-owned i18n setup.
 *
 * We use i18next/react-i18next as the industry-standard runtime and lazy-load
 * locale namespaces through dynamic imports so feature translations can split
 * with feature code.
 */
export const i18n = i18next
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`./locales/${language}/${namespace}.ts`)
    })
  )
  .use(initReactI18next)

export function initI18n() {
  if (i18n.isInitialized) {
    return i18n
  }

  i18n.init({
    lng: getInitialLanguage(),
    fallbackLng: 'ru',
    supportedLngs: [...supportedLanguages],
    defaultNS: 'common',
    ns: ['common'],
    partialBundledLanguages: true,
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: true
    }
  })

  i18n.on('languageChanged', (language) => {
    localStorage.setItem(languageStorageKey, language)
    document.documentElement.lang = language
  })

  document.documentElement.lang = i18n.language
  return i18n
}

export function setLanguage(language: SupportedLanguage) {
  return i18n.changeLanguage(language)
}

function getInitialLanguage(): SupportedLanguage {
  const storedLanguage = localStorage.getItem(languageStorageKey)
  if (isSupportedLanguage(storedLanguage)) {
    return storedLanguage
  }

  const browserLanguage = navigator.language.split('-')[0]
  return isSupportedLanguage(browserLanguage) ? browserLanguage : 'ru'
}

function isSupportedLanguage(language: string | null): language is SupportedLanguage {
  return supportedLanguages.includes(language as SupportedLanguage)
}
