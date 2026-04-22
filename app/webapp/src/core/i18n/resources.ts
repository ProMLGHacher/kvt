import common from './locales/ru/common'
import reports from './locales/ru/reports'

/**
 * Default-locale resources used by i18next's official TypeScript integration.
 *
 * The app still lazy-loads runtime namespaces from locales/* in config.ts.
 * This object is the compile-time shape that powers useTranslation autocomplete.
 */
const resources = {
  common,
  reports
} as const

export default resources
