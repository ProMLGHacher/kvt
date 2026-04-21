import { useStateFlow, useViewModel } from '@kvt/react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ReportsViewModel } from './presentation'

export default function ReportsPage() {
  const { t } = useTranslation('reports')
  const viewModel = useViewModel(ReportsViewModel)
  const state = useStateFlow(viewModel.uiState)

  useEffect(() => {
    viewModel.load()
  }, [viewModel])

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="rounded-[2rem] border border-border bg-surface p-8 shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">{t('eyebrow')}</p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-surface-foreground">
          {state.summary ? t('title') : t('preparing')}
        </h2>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {t('description')}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background p-5">
            <span className="block text-sm text-muted-foreground">{t('generatedAt')}</span>
            <strong className="mt-2 block text-2xl text-foreground">{state.summary?.generatedAt ?? '...'}</strong>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <span className="block text-sm text-muted-foreground">{t('score')}</span>
            <strong className="mt-2 block text-2xl text-foreground">{state.summary?.score ?? 0}%</strong>
          </div>
        </div>

        <button
          className="mt-8 rounded-2xl bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-md transition hover:bg-primary-hover active:bg-primary-active"
          onClick={() => viewModel.load()}
        >
          {t('refresh')}
        </button>
      </div>
    </section>
  )
}
