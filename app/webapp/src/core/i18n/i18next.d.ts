import 'i18next'
import { defaultNS } from './config'
import resources from './resources'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    compatibilityJSON: 'v4'
    resources: typeof resources
  }
}
