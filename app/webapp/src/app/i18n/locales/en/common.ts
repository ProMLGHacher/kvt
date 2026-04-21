export default {
  nav: {
    brand: 'KVT framework',
    main: 'Main',
    reports: 'Reports',
    theme: 'Theme',
    language: 'Language'
  },
  home: {
    eyebrow: 'KVT framework',
    title: 'Clean architecture, wired like Android.',
    description:
      'UI sends intents to a ViewModel. The ViewModel talks to a use case and exposes immutable state through StateFlow from @kvt/core.',
    stateLabel: 'Immutable UI state',
    action: 'Send intent',
    effectTitle: 'SharedFlow effect',
    effectIdle: 'Waiting for a milestone event.',
    effectDescription: 'Every fifth click emits a one-off event. State stays in StateFlow, effects stay in SharedFlow.',
    dataTitle: 'Data',
    dataText: 'InMemoryCounterRepository owns the source StateFlow.',
    domainTitle: 'Domain',
    domainText: 'IncrementCounterUseCase is resolved through DI.',
    presentationTitle: 'Presentation',
    presentationText: 'CounterViewModel exposes immutable UI state.',
    count_one: '{{count}} clean architecture intent handled',
    count_other: '{{count}} clean architecture intents handled',
    milestone: 'Milestone reached: {{count}}'
  },
  loading: {
    title: 'Downloading feature chunk...',
    description: 'The main bundle does not include this feature. It loads when the route opens.'
  }
}
