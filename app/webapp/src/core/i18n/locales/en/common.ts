import type ruCommon from '../ru/common'
import type { ResourceShape } from '../../translation-key'

export default {
  nav: {
    brand: 'KVT rooms',
    main: 'Home',
    theme: 'Theme',
    language: 'Language',
    themeMode: {
      light: 'light',
      dark: 'dark'
    }
  },
  loading: {
    title: 'Loading room...',
    description: 'Preparing the screen and app state.'
  }
} as const satisfies ResourceShape<typeof ruCommon>
