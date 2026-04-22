import { useSharedFlow, useStateFlow, useViewModel } from '@kvt/react'
import { useState } from 'react'
import { CounterViewModel } from './presentation'
import { useTranslation } from 'react-i18next'

export function CounterScreen() {
  const { t } = useTranslation('common')
  const viewModel = useViewModel(CounterViewModel)
  const uiState = useStateFlow(viewModel.uiState)
  const [effectCount, setEffectCount] = useState<number | null>(null)

  useSharedFlow(viewModel.effects, setEffectCount)

  return (
    <main className="min-h-full overflow-hidden bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-10 px-6 py-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            {t('home.eyebrow')}
          </p>
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-7xl">
            {t('home.title')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{t('home.description')}</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[2rem] border border-border bg-surface p-8 shadow-lg">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('home.stateLabel')}</p>
                <p className="mt-3 text-7xl font-semibold tracking-tight text-primary">
                  {uiState.count}
                </p>
                <p className="mt-3 text-xl text-surface-foreground">
                  {t('home.count', { count: uiState.count })}
                </p>
              </div>

              <button
                className="rounded-2xl bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-md transition hover:bg-primary-hover active:bg-primary-active"
                onClick={() => viewModel.onIncrementClicked()}
              >
                {t('home.action')}
              </button>
            </div>
          </article>

          <aside className="rounded-[2rem] border border-border bg-accent p-8 text-accent-foreground">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] opacity-70">
              {t('home.effectTitle')}
            </p>
            <p className="mt-5 text-2xl font-semibold">
              {effectCount === null
                ? t('home.effectIdle')
                : t('home.milestone', { count: effectCount })}
            </p>
            <p className="mt-6 text-sm opacity-75">{t('home.effectDescription')}</p>
          </aside>
        </div>

        <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <strong className="block text-surface-foreground">{t('home.dataTitle')}</strong>
            {t('home.dataText')}
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <strong className="block text-surface-foreground">{t('home.domainTitle')}</strong>
            {t('home.domainText')}
          </div>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <strong className="block text-surface-foreground">{t('home.presentationTitle')}</strong>
            {t('home.presentationText')}
          </div>
        </div>
      </section>
    </main>
  )
}
