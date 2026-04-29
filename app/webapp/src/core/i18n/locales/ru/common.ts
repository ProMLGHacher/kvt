export default {
  nav: {
    brand: 'Кватум',
    tagline: 'Голосовые комнаты с быстрым входом',
    main: 'Главная',
    theme: 'Тема',
    language: 'Язык',
    themeMode: {
      light: 'светлая',
      dark: 'тёмная'
    }
  },
  settings: {
    eyebrow: 'Приложение',
    title: 'Настройки',
    close: 'Закрыть настройки',
    tabs: {
      profile: 'Профиль',
      media: 'Медиа',
      audio: 'Звук',
      appearance: 'Интерфейс'
    },
    profile: {
      title: 'Профиль',
      description: 'Имя сохранится локально и будет подставляться перед входом в комнату.',
      name: 'Никнейм',
      hint: 'Можно поменять перед каждой встречей.'
    },
    media: {
      title: 'Медиа',
      description: 'Проверьте камеру и микрофон, выберите устройства и сохраните настройки входа.',
      microphone: 'Микрофон',
      camera: 'Камера',
      micHint: 'По умолчанию входить с включенным микрофоном.',
      cameraHint: 'По умолчанию входить с включенной камерой.',
      defaultDevice: 'По умолчанию',
      previewOff: 'Камера выключена или превью недоступно.'
    },
    audio: {
      title: 'Звук',
      description: 'Соберите цепочку обработки микрофона. Она применяется к прослушке и звонкам.',
      monitor: 'Прослушка',
      monitorHint: 'Слышать свой обработанный микрофон локально.',
      addPlugin: 'Добавить плагин',
      locked: 'Всегда первый',
      enabled: 'Включен',
      remove: 'Удалить',
      moveUp: 'Выше',
      moveDown: 'Ниже',
      plugins: {
        volume: 'Громкость',
        noiseGate: 'Noise gate',
        compressor: 'Компрессия',
        equalizer10: '10-полосный эквалайзер',
        saturator: 'Сатуратор'
      },
      fields: {
        gain: 'Громкость',
        threshold: 'Порог',
        attack: 'Атака',
        release: 'Релиз',
        ratio: 'Ratio',
        makeup: 'Makeup',
        drive: 'Drive',
        mix: 'Mix',
        output: 'Выход'
      }
    },
    appearance: {
      title: 'Интерфейс',
      description: 'Язык и тема теперь живут здесь, без отдельной шапки сайта.',
      language: 'Язык',
      theme: 'Тема',
      light: 'Светлая тема',
      dark: 'Темная тема'
    },
    errors: {
      permissionDenied: 'Браузер запретил доступ к камере или микрофону.',
      deviceNotFound: 'Выбранное устройство не найдено.',
      deviceBusy: 'Камера или микрофон заняты другим приложением.',
      insecureContext: 'Камера и микрофон доступны только в защищенном контексте.',
      apiUnavailable: 'Этот браузер не поддерживает доступ к камере и микрофону.',
      preview: 'Не удалось запустить превью.'
    }
  },
  loading: {
    title: 'Загружаем комнату...',
    description: 'Подготавливаем экран и состояние приложения.'
  }
} as const
