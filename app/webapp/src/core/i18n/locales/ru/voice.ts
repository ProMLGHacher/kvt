export default {
  home: {
    badge: 'Голосовые комнаты',
    title: 'Создайте комнату, когда разговор уже нужен.',
    description:
      'Откройте конференцию, отправьте ссылку и дайте участникам войти с заранее выбранными микрофоном и камерой.',
    createRoom: 'Создать комнату',
    createHint: 'Микрофон и камеру можно настроить перед входом.',
    joinTitle: 'Войти в комнату',
    joinDescription: 'Вставьте id комнаты или полную ссылку.',
    roomInputPlaceholder: 'clear-river-42',
    continue: 'Продолжить',
    directJoinHint: 'Отдельной страницы входа нет: комната откроется сразу.',
    errors: {
      roomInputRequired: 'Введите id комнаты или ссылку',
      invalidRoom: 'Введите корректный id комнаты или ссылку',
      createRoom: 'Не удалось создать комнату.'
    }
  },
  prejoin: {
    badge: 'Перед входом',
    cameraPreview: 'Превью камеры',
    cameraOff: 'Камера выключена. Можно войти только со звуком.',
    title: 'Готовы войти?',
    description: 'Укажите имя и выберите, как хотите подключиться к комнате.',
    nameLabel: 'Ваше имя',
    namePlaceholder: 'Араик',
    microphone: 'Микрофон',
    camera: 'Камера',
    micOn: 'Вы войдёте с включённым микрофоном.',
    micOff: 'Вы войдёте с выключенным микрофоном.',
    cameraOn: 'Превью камеры включено.',
    cameraOffShort: 'Камера останется выключенной.',
    defaultDevice: 'По умолчанию',
    joinRoom: 'Войти в комнату',
    errors: {
      load: 'Не удалось загрузить настройки комнаты.',
      nameRequired: 'Введите имя',
      enterName: 'Введите имя перед входом.',
      join: 'Не удалось войти в комнату.',
      preview: 'Не удалось запустить превью.'
    }
  },
  room: {
    header: {
      title: 'Комната {{roomId}}',
      participants_one: '{{count}} участник',
      participants_few: '{{count}} участника',
      participants_many: '{{count}} участников',
      participants_other: '{{count}} участника',
      techInfo: 'Тех. инфо',
      copyLink: 'Скопировать ссылку',
      leave: 'Выйти'
    },
    empty: {
      title: 'Комната ожидает участников.',
      description: 'Перед подключением откроются настройки входа.'
    },
    participant: {
      you: 'Вы',
      screen: 'Экран',
      mic: 'Микрофон',
      cam: 'Камера',
      waitingMedia: 'Участник подключён, ожидаем медиа.',
      roles: {
        host: 'Организатор',
        participant: 'Участник'
      }
    },
    controls: {
      mute: 'Выключить микрофон',
      unmute: 'Включить микрофон',
      cameraOff: 'Выключить камеру',
      cameraOn: 'Включить камеру',
      stopShare: 'Остановить показ',
      shareScreen: 'Показать экран'
    },
    tech: {
      title: 'Техническая информация',
      room: 'Комната',
      publisher: 'Отправка',
      subscriber: 'Получение',
      signaling: 'Сигналинг',
      noDiagnostics: 'Диагностики пока нет.',
      export: 'Экспорт',
      clear: 'Очистить'
    },
    status: {
      chooseSettings: 'Выберите, как хотите войти в комнату.',
      logsCleared: 'Локальные логи очищены.',
      microphoneOn: 'Микрофон включён.',
      microphoneMuted: 'Микрофон выключен.',
      cameraOn: 'Камера включена.',
      cameraOff: 'Камера выключена.',
      screenStarted: 'Показ экрана начат.',
      screenStopped: 'Показ экрана остановлен.',
      linkCopied: 'Ссылка на комнату скопирована.',
      linkCopyFailed: 'Не удалось скопировать ссылку.',
      mediaStarting: 'Подключаем медиа комнаты.'
    },
    toasts: {
      logsConsole: 'Логи подготовлены в консоли для текущей проверки.',
      logsPrepared: 'Логи подготовлены.',
      logsCleared: 'Локальные логи очищены.',
      sessionMissing: 'Сессия входа не найдена.',
      microphoneFailed: 'Не удалось обновить микрофон.',
      cameraFailed: 'Не удалось обновить камеру.',
      screenFailed: 'Не удалось обновить показ экрана.',
      linkCopied: 'Ссылка на комнату скопирована.',
      linkCopyFailed: 'Не удалось скопировать ссылку.',
      mediaFailed: 'Не удалось запустить медиа комнаты.'
    }
  }
} as const
