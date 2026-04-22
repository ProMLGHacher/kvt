import { useStateFlow, useViewModel } from '@kvt/react'
import { useTranslation } from 'react-i18next'
import { Badge, Button, Card, CardContent, SupportingPaneScaffold } from '@core/design-system'
import { ReportsViewModel } from './presentation'

export default function ReportsPage() {
  const { t } = useTranslation('reports')
  const viewModel = useViewModel(ReportsViewModel)
  const state = useStateFlow(viewModel.uiState)

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <Card className="rounded-4xl shadow-lg">
        <SupportingPaneScaffold
          compactBehavior="stack"
          className="p-8"
          mainPane={
            <div>
              <Badge className="uppercase tracking-[0.22em]" variant="secondary">
                {t('eyebrow')}
              </Badge>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-surface-foreground">
                {state.summary ? t('title') : t('preparing')}
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground">{t('description')}</p>

              <Button
                className="mt-8 rounded-2xl px-6 py-4 shadow-md"
                onClick={() => viewModel.load()}
              >
                {t('refresh')}
              </Button>
            </div>
          }
          supportingPane={
            <div className="grid gap-4">
              <Card className="rounded-2xl bg-background shadow-none">
                <CardContent className="p-5">
                  <span className="block text-sm text-muted-foreground">{t('generatedAt')}</span>
                  <strong className="mt-2 block text-2xl text-foreground">
                    {state.summary?.generatedAt ?? '...'}
                  </strong>
                </CardContent>
              </Card>
              <Card className="rounded-2xl bg-background shadow-none">
                <CardContent className="p-5">
                  <span className="block text-sm text-muted-foreground">{t('score')}</span>
                  <strong className="mt-2 block text-2xl text-foreground">
                    {state.summary?.score ?? 0}%
                  </strong>
                </CardContent>
              </Card>
            </div>
          }
        />
      </Card>
    </section>
  )
}
