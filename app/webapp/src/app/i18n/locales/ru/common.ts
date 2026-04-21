export default {
  nav: {
    brand: 'KVT framework',
    main: 'Главная',
    reports: 'Отчеты',
    theme: 'Тема',
    language: 'Язык'
  },
  home: {
    eyebrow: 'KVT framework',
    title: 'Clean architecture, собранная как в Android.',
    description:
      'UI отправляет intents во ViewModel. ViewModel работает с use case и отдает immutable state через StateFlow из @kvt/core.',
    stateLabel: 'Immutable UI state',
    action: 'Отправить intent',
    effectTitle: 'SharedFlow эффект',
    effectIdle: 'Ждем milestone-событие.',
    effectDescription: 'Каждый пятый клик отправляет one-off event. State остается в StateFlow, эффекты в SharedFlow.',
    dataTitle: 'Data',
    dataText: 'InMemoryCounterRepository хранит source StateFlow.',
    domainTitle: 'Domain',
    domainText: 'IncrementCounterUseCase резолвится через DI.',
    presentationTitle: 'Presentation',
    presentationText: 'CounterViewModel отдает immutable UI state.',
    count_one: '{{count}} clean architecture intent обработан',
    count_few: '{{count}} clean architecture intent обработано',
    count_many: '{{count}} clean architecture intent обработано',
    count_other: '{{count}} clean architecture intent обработано',
    milestone: 'Milestone достигнут: {{count}}'
  },
  loading: {
    title: 'Загружаем feature chunk...',
    description: 'Главный bundle не содержит эту фичу, она подтягивается при открытии маршрута.'
  }
}
