import type { TFunction } from 'i18next'
import { Alert, AlertDescription, Button, cn } from '@core/design-system'
import type { ConferenceDiagnostics } from '../model/RoomDiagnostics'

type VoiceT = TFunction<'voice'>

export interface TechnicalPanelProps {
  readonly className?: string
  readonly diagnostics: ConferenceDiagnostics | null
  readonly onExportLogs: () => void
  readonly onClearLogs: () => void
  readonly t: VoiceT
}

export function TechnicalPanel({
  className,
  diagnostics,
  onExportLogs,
  onClearLogs,
  t
}: TechnicalPanelProps) {
  return (
    <div className={cn('min-h-0 rounded-[1.75rem]', className)}>
      <div className="grid h-full gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">{t('room.tech.title')}</h3>
        </div>

        {diagnostics ? (
          <div className="grid gap-3">
            <DiagnosticGroup title={t('room.tech.room')} values={diagnostics.room} />
            <DiagnosticGroup title={t('room.tech.publisher')} values={diagnostics.publisher} />
            <DiagnosticGroup title={t('room.tech.subscriber')} values={diagnostics.subscriber} />
            <DiagnosticGroup title={t('room.tech.signaling')} values={diagnostics.signaling} />
          </div>
        ) : (
          <Alert>
            <AlertDescription>{t('room.tech.noDiagnostics')}</AlertDescription>
          </Alert>
        )}

        <div className="mt-auto grid gap-2 sm:grid-cols-2">
          <Button className="rounded-full" onClick={onExportLogs} type="button" variant="outline">
            {t('room.tech.export')}
          </Button>
          <Button className="rounded-full" onClick={onClearLogs} type="button" variant="ghost">
            {t('room.tech.clear')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function DiagnosticGroup({
  title,
  values
}: {
  readonly title: string
  readonly values: readonly string[]
}) {
  return (
    <div className="rounded-2xl bg-white/8 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{title}</p>
      <ul className="mt-2 grid gap-1 text-xs text-slate-300">
        {values.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
    </div>
  )
}
