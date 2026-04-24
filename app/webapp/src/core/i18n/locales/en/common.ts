import type ruCommon from '../ru/common'
import { defineResource } from '../../translation-key'

export default defineResource<typeof ruCommon>()({
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
} as const)
