import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'KVT',
  description: 'Clean architecture framework for TypeScript applications',
  cleanUrls: true,
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'KVT',
      description: 'Clean architecture framework for TypeScript applications',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/' },
          { text: 'Reference', link: '/reference/disposable' },
          { text: 'Android Docs', link: 'https://developer.android.com/topic/architecture' }
        ],
        sidebar: createEnglishSidebar(),
        editLink: {
          pattern: ''
        }
      }
    },
    ru: {
      label: 'Русский',
      lang: 'ru-RU',
      title: 'KVT',
      description: 'Фреймворк clean architecture для TypeScript-приложений',
      themeConfig: {
        nav: [
          { text: 'Руководство', link: '/ru/guide/' },
          { text: 'Справочник', link: '/ru/reference/disposable' },
          { text: 'Android Docs', link: 'https://developer.android.com/topic/architecture' }
        ],
        sidebar: createRussianSidebar(),
        outline: {
          label: 'На этой странице'
        },
        docFooter: {
          prev: 'Предыдущая',
          next: 'Следующая'
        },
        darkModeSwitchLabel: 'Тема',
        sidebarMenuLabel: 'Меню',
        returnToTopLabel: 'Наверх',
        langMenuLabel: 'Изменить язык',
        search: {
          provider: 'local',
          options: {
            locales: {
              ru: {
                translations: {
                  button: {
                    buttonText: 'Поиск',
                    buttonAriaLabel: 'Поиск'
                  },
                  modal: {
                    noResultsText: 'Ничего не найдено',
                    resetButtonTitle: 'Сбросить поиск',
                    footer: {
                      selectText: 'выбрать',
                      navigateText: 'перейти',
                      closeText: 'закрыть'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  themeConfig: {
    logo: '/logo.svg',
    search: {
      provider: 'local'
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com' }],
    footer: {
      message: 'Designed around Android-style clean architecture concepts.',
      copyright: 'KVT documentation'
    }
  }
})

function createEnglishSidebar() {
  return [
    {
      text: 'Get Started',
      items: [
        { text: 'Overview', link: '/guide/' },
        { text: 'Application Architecture', link: '/guide/architecture' },
        { text: 'Mental Model', link: '/guide/mental-model' }
      ]
    },
    {
      text: 'Core Concepts',
      items: [
        { text: 'Dependency Injection', link: '/guide/dependency-injection' },
        { text: 'ViewModel Lifecycle', link: '/guide/viewmodel-lifecycle' },
        { text: 'Flows and State', link: '/guide/flows' },
        { text: 'React Adapter', link: '/guide/react-adapter' },
        { text: 'Internationalization', link: '/guide/i18n' },
        { text: 'Design System', link: '/guide/design-system' },
        { text: 'Adaptive Layouts', link: '/guide/adaptive-layouts' },
        { text: 'Theming', link: '/guide/theming' }
      ]
    },
    {
      text: 'Reference',
      items: [
        { text: 'Disposable', link: '/reference/disposable' },
        { text: 'ViewModel', link: '/reference/viewmodel' },
        { text: 'Container', link: '/reference/container' },
        { text: 'Flow', link: '/reference/flow' }
      ]
    }
  ]
}

function createRussianSidebar() {
  return [
    {
      text: 'Начало',
      items: [
        { text: 'Обзор', link: '/ru/guide/' },
        { text: 'Архитектура приложения', link: '/ru/guide/architecture' },
        { text: 'Ментальная модель', link: '/ru/guide/mental-model' }
      ]
    },
    {
      text: 'Основные концепции',
      items: [
        { text: 'Dependency Injection', link: '/ru/guide/dependency-injection' },
        { text: 'Жизненный цикл ViewModel', link: '/ru/guide/viewmodel-lifecycle' },
        { text: 'Flows и состояние', link: '/ru/guide/flows' },
        { text: 'React adapter', link: '/ru/guide/react-adapter' },
        { text: 'Интернационализация', link: '/ru/guide/i18n' },
        { text: 'Дизайн-система', link: '/ru/guide/design-system' },
        { text: 'Адаптивные layouts', link: '/ru/guide/adaptive-layouts' },
        { text: 'Темы', link: '/ru/guide/theming' }
      ]
    },
    {
      text: 'Справочник',
      items: [
        { text: 'Disposable', link: '/ru/reference/disposable' },
        { text: 'ViewModel', link: '/ru/reference/viewmodel' },
        { text: 'Container', link: '/ru/reference/container' },
        { text: 'Flow', link: '/ru/reference/flow' }
      ]
    }
  ]
}
