import { useSharedFlow, useStateFlow, useViewModel } from '@kvt/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge, Button, Card, CardContent, SupportingPaneScaffold } from '@core/design-system'
import { CounterViewModel } from './presentation'

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

        <SupportingPaneScaffold
          compactBehavior="stack"
          mainPane={
            <Card className="h-full rounded-4xl shadow-lg">
              <CardContent className="p-8">
                <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {t('home.stateLabel')}
                    </p>
                    <p className="mt-3 text-7xl font-semibold tracking-tight text-primary">
                      {uiState.count}
                    </p>
                    <p className="mt-3 text-xl text-surface-foreground">
                      {t('home.count', { count: uiState.count })}
                    </p>
                  </div>

                  <Button
                    className="rounded-2xl px-6 py-4 shadow-md"
                    onClick={() => viewModel.onIncrementClicked()}
                    size="lg"
                  >
                    {t('home.action')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          }
          supportingPane={
            <Card className="h-full rounded-[2rem] border-transparent bg-accent text-accent-foreground">
              <CardContent className="p-8">
                <Badge className="uppercase tracking-[0.18em] opacity-70" variant="secondary">
                  {t('home.effectTitle')}
                </Badge>
                <p className="mt-5 text-2xl font-semibold">
                  {effectCount === null
                    ? t('home.effectIdle')
                    : t('home.milestone', { count: effectCount })}
                </p>
                <p className="mt-6 text-sm opacity-75">{t('home.effectDescription')}</p>
              </CardContent>
            </Card>
          }
        />

        <ListDetailBenefits />
      </section>
    </main>
  )
}

function ListDetailBenefits() {
  const { t } = useTranslation('common')

  return (
    <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-3">
      <Card className="rounded-2xl">
        <CardContent className="p-5">
          <strong className="block text-surface-foreground">{t('home.dataTitle')}</strong>
          {t('home.dataText')}
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardContent className="p-5">
          <strong className="block text-surface-foreground">{t('home.domainTitle')}</strong>
          {t('home.domainText')}
        </CardContent>
      </Card>
      <Card className="rounded-2xl">
        <CardContent className="p-5">
          <strong className="block text-surface-foreground">{t('home.presentationTitle')}</strong>
          {t('home.presentationText')}
        </CardContent>
      </Card>
    </div>
  )
}
