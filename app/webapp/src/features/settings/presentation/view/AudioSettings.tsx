import type { DragEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  CardContent,
  Field,
  FieldHint,
  Label,
  Slider,
  Switch,
  cn
} from '@core/design-system'
import {
  equalizer10Bands,
  type AudioPluginConfig,
  type AudioPluginInstance,
  type AudioPluginKind,
  type AudioProcessingMeter,
  type AudioProcessingSettings
} from '@capabilities/audio-processing/domain/model'

const addablePlugins: readonly AudioPluginKind[] = [
  'noiseGate',
  'compressor',
  'equalizer10',
  'saturator'
]

export interface AudioSettingsProps {
  readonly audioProcessing: AudioProcessingSettings
  readonly meter: AudioProcessingMeter
  readonly onMonitorChange: (enabled: boolean) => void
  readonly onPluginAdd: (kind: AudioPluginKind) => void
  readonly onPluginRemove: (pluginId: string) => void
  readonly onPluginMove: (pluginId: string, direction: 'up' | 'down') => void
  readonly onPluginDrop: (pluginId: string, targetPluginId: string) => void
  readonly onPluginEnabledChange: (pluginId: string, enabled: boolean) => void
  readonly onPluginConfigChange: (pluginId: string, config: Partial<AudioPluginConfig>) => void
}

export function AudioSettings({
  audioProcessing,
  meter,
  onMonitorChange,
  onPluginAdd,
  onPluginRemove,
  onPluginMove,
  onPluginDrop,
  onPluginEnabledChange,
  onPluginConfigChange
}: AudioSettingsProps): ReactNode {
  const { t } = useTranslation('common')

  return (
    <div className="grid gap-5">
      <header className="max-w-2xl">
        <h3 className="font-display text-2xl font-bold tracking-tight">
          {t('settings.audio.title')}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t('settings.audio.description')}
        </p>
      </header>

      <Card className="rounded-[1.5rem] bg-surface-overlay">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Label>{t('settings.audio.monitor')}</Label>
            <FieldHint>{t('settings.audio.monitorHint')}</FieldHint>
          </div>
          <Switch checked={audioProcessing.monitorEnabled} onCheckedChange={onMonitorChange} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-semibold text-muted-foreground">
          {t('settings.audio.addPlugin')}
        </span>
        {addablePlugins.map((kind) => (
          <Button key={kind} onClick={() => onPluginAdd(kind)} type="button" variant="secondary">
            {t(`settings.audio.plugins.${kind}`)}
          </Button>
        ))}
      </div>

      <div className="grid gap-3">
        {audioProcessing.chain.map((plugin, index) => (
          <PluginCard
            key={plugin.id}
            canMoveDown={index < audioProcessing.chain.length - 1}
            canMoveUp={index > 1}
            meter={meter}
            plugin={plugin}
            onDrop={onPluginDrop}
            onEnabledChange={onPluginEnabledChange}
            onMove={onPluginMove}
            onRemove={onPluginRemove}
            onUpdate={onPluginConfigChange}
          />
        ))}
      </div>
    </div>
  )
}

function PluginCard({
  plugin,
  meter,
  canMoveUp,
  canMoveDown,
  onUpdate,
  onEnabledChange,
  onMove,
  onDrop,
  onRemove
}: {
  readonly plugin: AudioPluginInstance
  readonly meter: AudioProcessingMeter
  readonly canMoveUp: boolean
  readonly canMoveDown: boolean
  readonly onUpdate: (pluginId: string, config: Partial<AudioPluginConfig>) => void
  readonly onEnabledChange: (pluginId: string, enabled: boolean) => void
  readonly onMove: (pluginId: string, direction: 'up' | 'down') => void
  readonly onDrop: (pluginId: string, targetPluginId: string) => void
  readonly onRemove: (pluginId: string) => void
}): ReactNode {
  const { t } = useTranslation('common')
  const locked = plugin.kind === 'volume'

  function handleDragStart(event: DragEvent<HTMLElement>) {
    if (locked) {
      event.preventDefault()
      return
    }

    event.dataTransfer.setData('text/plain', plugin.id)
    event.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault()
    const sourcePluginId = event.dataTransfer.getData('text/plain')
    if (sourcePluginId) {
      onDrop(sourcePluginId, plugin.id)
    }
  }

  return (
    <Card
      className={cn(
        'rounded-[1.35rem] bg-surface-overlay transition',
        !locked && 'cursor-grab active:cursor-grabbing'
      )}
      draggable={!locked}
      onDragOver={(event) => event.preventDefault()}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
    >
      <CardContent className="grid gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-foreground">
                {t(`settings.audio.plugins.${plugin.kind}`)}
              </h4>
              {locked && (
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                  {t('settings.audio.locked')}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!locked && (
              <Switch
                checked={plugin.enabled}
                aria-label={t('settings.audio.enabled')}
                onCheckedChange={(enabled) => onEnabledChange(plugin.id, enabled)}
              />
            )}
            <Button
              disabled={!canMoveUp}
              onClick={() => onMove(plugin.id, 'up')}
              size="sm"
              type="button"
              variant="ghost"
            >
              {t('settings.audio.moveUp')}
            </Button>
            <Button
              disabled={!canMoveDown || locked}
              onClick={() => onMove(plugin.id, 'down')}
              size="sm"
              type="button"
              variant="ghost"
            >
              {t('settings.audio.moveDown')}
            </Button>
            {!locked && (
              <Button onClick={() => onRemove(plugin.id)} size="sm" type="button" variant="ghost">
                {t('settings.audio.remove')}
              </Button>
            )}
          </div>
        </div>

        <PluginControls plugin={plugin} meter={meter} onUpdate={onUpdate} />
      </CardContent>
    </Card>
  )
}

function PluginControls({
  plugin,
  meter,
  onUpdate
}: {
  readonly plugin: AudioPluginInstance
  readonly meter: AudioProcessingMeter
  readonly onUpdate: (pluginId: string, config: Partial<AudioPluginConfig>) => void
}): ReactNode {
  const { t } = useTranslation('common')

  switch (plugin.kind) {
    case 'volume':
      return (
        <RangeField
          label={t('settings.audio.fields.gain')}
          max={2}
          min={0}
          step={0.01}
          value={plugin.config.gain}
          valueLabel={`${Math.round(plugin.config.gain * 100)}%`}
          onChange={(gain) => onUpdate(plugin.id, { gain })}
        />
      )
    case 'noiseGate':
      return (
        <div className="grid gap-4">
          <NoiseGateMeter meter={meter} thresholdDb={plugin.config.thresholdDb} />
          <RangeField
            label={t('settings.audio.fields.threshold')}
            max={-6}
            min={-90}
            step={1}
            value={plugin.config.thresholdDb}
            valueLabel={`${Math.round(plugin.config.thresholdDb)} dB`}
            onChange={(thresholdDb) => onUpdate(plugin.id, { thresholdDb })}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <RangeField
              label={t('settings.audio.fields.attack')}
              max={120}
              min={1}
              step={1}
              value={plugin.config.attackMs}
              valueLabel={`${Math.round(plugin.config.attackMs)} ms`}
              onChange={(attackMs) => onUpdate(plugin.id, { attackMs })}
            />
            <RangeField
              label={t('settings.audio.fields.release')}
              max={700}
              min={20}
              step={5}
              value={plugin.config.releaseMs}
              valueLabel={`${Math.round(plugin.config.releaseMs)} ms`}
              onChange={(releaseMs) => onUpdate(plugin.id, { releaseMs })}
            />
          </div>
        </div>
      )
    case 'compressor':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <RangeField
            label={t('settings.audio.fields.threshold')}
            max={0}
            min={-60}
            step={1}
            value={plugin.config.thresholdDb}
            valueLabel={`${Math.round(plugin.config.thresholdDb)} dB`}
            onChange={(thresholdDb) => onUpdate(plugin.id, { thresholdDb })}
          />
          <RangeField
            label={t('settings.audio.fields.ratio')}
            max={20}
            min={1}
            step={0.1}
            value={plugin.config.ratio}
            valueLabel={`${plugin.config.ratio.toFixed(1)}:1`}
            onChange={(ratio) => onUpdate(plugin.id, { ratio })}
          />
          <RangeField
            label={t('settings.audio.fields.attack')}
            max={100}
            min={1}
            step={1}
            value={plugin.config.attackMs}
            valueLabel={`${Math.round(plugin.config.attackMs)} ms`}
            onChange={(attackMs) => onUpdate(plugin.id, { attackMs })}
          />
          <RangeField
            label={t('settings.audio.fields.release')}
            max={1000}
            min={20}
            step={5}
            value={plugin.config.releaseMs}
            valueLabel={`${Math.round(plugin.config.releaseMs)} ms`}
            onChange={(releaseMs) => onUpdate(plugin.id, { releaseMs })}
          />
          <RangeField
            label={t('settings.audio.fields.makeup')}
            max={4}
            min={0}
            step={0.01}
            value={plugin.config.makeupGain}
            valueLabel={`${plugin.config.makeupGain.toFixed(2)}x`}
            onChange={(makeupGain) => onUpdate(plugin.id, { makeupGain })}
          />
        </div>
      )
    case 'equalizer10':
      return (
        <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
          {equalizer10Bands.map((band, index) => (
            <div key={band} className="grid justify-items-center gap-2">
              <Slider
                className="h-28 w-8 rotate-180 [writing-mode:vertical-rl]"
                max={12}
                min={-12}
                step={0.5}
                value={plugin.config.gainsDb[index] ?? 0}
                onChange={(event) => {
                  const gainsDb = [...plugin.config.gainsDb]
                  gainsDb[index] = Number(event.currentTarget.value)
                  onUpdate(plugin.id, { gainsDb })
                }}
              />
              <span className="text-xs font-semibold text-muted-foreground">
                {band >= 1000 ? `${band / 1000}k` : band}
              </span>
              <span className="text-[0.7rem] text-muted-foreground">
                {formatSigned(plugin.config.gainsDb[index] ?? 0)}
              </span>
            </div>
          ))}
        </div>
      )
    case 'saturator':
      return (
        <div className="grid gap-3 sm:grid-cols-3">
          <RangeField
            label={t('settings.audio.fields.drive')}
            max={12}
            min={0}
            step={0.1}
            value={plugin.config.drive}
            valueLabel={plugin.config.drive.toFixed(1)}
            onChange={(drive) => onUpdate(plugin.id, { drive })}
          />
          <RangeField
            label={t('settings.audio.fields.mix')}
            max={1}
            min={0}
            step={0.01}
            value={plugin.config.mix}
            valueLabel={`${Math.round(plugin.config.mix * 100)}%`}
            onChange={(mix) => onUpdate(plugin.id, { mix })}
          />
          <RangeField
            label={t('settings.audio.fields.output')}
            max={2}
            min={0}
            step={0.01}
            value={plugin.config.outputGain}
            valueLabel={`${Math.round(plugin.config.outputGain * 100)}%`}
            onChange={(outputGain) => onUpdate(plugin.id, { outputGain })}
          />
        </div>
      )
  }
}

function RangeField({
  label,
  value,
  valueLabel,
  min,
  max,
  step,
  onChange
}: {
  readonly label: string
  readonly value: number
  readonly valueLabel: string
  readonly min: number
  readonly max: number
  readonly step: number
  readonly onChange: (value: number) => void
}): ReactNode {
  return (
    <Field>
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="text-xs font-semibold text-muted-foreground">{valueLabel}</span>
      </div>
      <Slider
        max={max}
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </Field>
  )
}

function NoiseGateMeter({
  meter,
  thresholdDb
}: {
  readonly meter: AudioProcessingMeter
  readonly thresholdDb: number
}): ReactNode {
  const thresholdPosition = `${((thresholdDb + 90) / 90) * 100}%`
  const levelPosition = `${Math.max(0, Math.min(100, ((meter.levelDb + 90) / 90) * 100))}%`

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-background/70 p-3">
      <div className="flex h-16 items-end gap-1">
        {meter.spectrum.map((level, index) => (
          <span
            key={index}
            className="min-h-1 flex-1 rounded-full bg-primary/70"
            style={{ height: `${Math.max(0.06, level) * 100}%` }}
          />
        ))}
      </div>
      <span
        className="absolute bottom-2 top-2 w-px bg-destructive shadow-[0_0_12px_rgba(239,68,68,0.65)]"
        style={{ left: thresholdPosition }}
      />
      <span
        className="absolute bottom-1 h-1.5 rounded-full bg-foreground/70"
        style={{ left: 12, width: `calc(${levelPosition} - 0.75rem)` }}
      />
    </div>
  )
}

function formatSigned(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(value % 1 === 0 ? 0 : 1)}`
}
