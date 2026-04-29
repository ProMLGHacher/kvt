export type AudioPluginKind = 'volume' | 'noiseGate' | 'compressor' | 'equalizer10' | 'saturator'

export type VolumePluginConfig = {
  readonly gain: number
}

export type NoiseGatePluginConfig = {
  readonly thresholdDb: number
  readonly attackMs: number
  readonly releaseMs: number
}

export type CompressorPluginConfig = {
  readonly thresholdDb: number
  readonly ratio: number
  readonly attackMs: number
  readonly releaseMs: number
  readonly makeupGain: number
}

export type Equalizer10PluginConfig = {
  readonly gainsDb: readonly number[]
}

export type SaturatorPluginConfig = {
  readonly drive: number
  readonly mix: number
  readonly outputGain: number
}

export type AudioPluginConfig =
  | VolumePluginConfig
  | NoiseGatePluginConfig
  | CompressorPluginConfig
  | Equalizer10PluginConfig
  | SaturatorPluginConfig

export type AudioPluginInstance =
  | {
      readonly id: string
      readonly kind: 'volume'
      readonly enabled: true
      readonly locked: true
      readonly config: VolumePluginConfig
    }
  | {
      readonly id: string
      readonly kind: 'noiseGate'
      readonly enabled: boolean
      readonly locked?: false
      readonly config: NoiseGatePluginConfig
    }
  | {
      readonly id: string
      readonly kind: 'compressor'
      readonly enabled: boolean
      readonly locked?: false
      readonly config: CompressorPluginConfig
    }
  | {
      readonly id: string
      readonly kind: 'equalizer10'
      readonly enabled: boolean
      readonly locked?: false
      readonly config: Equalizer10PluginConfig
    }
  | {
      readonly id: string
      readonly kind: 'saturator'
      readonly enabled: boolean
      readonly locked?: false
      readonly config: SaturatorPluginConfig
    }

export type AudioProcessingSettings = {
  readonly chain: readonly AudioPluginInstance[]
  readonly monitorEnabled: boolean
}

export type AudioProcessingMeter = {
  readonly levelDb: number
  readonly spectrum: readonly number[]
}

export type AudioProcessingState = {
  readonly settings: AudioProcessingSettings
  readonly meter: AudioProcessingMeter
}

export type CreateProcessedMicrophoneStreamParams = {
  readonly owner: string
  readonly rawStream: MediaStream
}

export const equalizer10Bands = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000] as const

export function createDefaultAudioProcessingSettings(): AudioProcessingSettings {
  return {
    chain: [createDefaultAudioPlugin('volume', 'audio-volume')],
    monitorEnabled: false
  }
}

export function createDefaultAudioPlugin(
  kind: AudioPluginKind,
  id = createAudioPluginId(kind)
): AudioPluginInstance {
  switch (kind) {
    case 'volume':
      return {
        id,
        kind,
        enabled: true,
        locked: true,
        config: { gain: 1 }
      }
    case 'noiseGate':
      return {
        id,
        kind,
        enabled: true,
        config: { thresholdDb: -48, attackMs: 12, releaseMs: 120 }
      }
    case 'compressor':
      return {
        id,
        kind,
        enabled: true,
        config: { thresholdDb: -24, ratio: 3, attackMs: 8, releaseMs: 160, makeupGain: 1 }
      }
    case 'equalizer10':
      return {
        id,
        kind,
        enabled: true,
        config: { gainsDb: equalizer10Bands.map(() => 0) }
      }
    case 'saturator':
      return {
        id,
        kind,
        enabled: true,
        config: { drive: 1.8, mix: 0.35, outputGain: 1 }
      }
  }
}

export function normalizeAudioProcessingSettings(value: unknown): AudioProcessingSettings {
  const defaults = createDefaultAudioProcessingSettings()

  if (!isRecord(value)) {
    return defaults
  }

  const chainValue = Array.isArray(value.chain) ? value.chain : defaults.chain
  const normalizedChain = normalizePluginChain(chainValue)

  return {
    chain: normalizedChain,
    monitorEnabled: typeof value.monitorEnabled === 'boolean' ? value.monitorEnabled : false
  }
}

export function normalizePluginChain(chain: readonly unknown[]): readonly AudioPluginInstance[] {
  const normalized = chain
    .map((plugin) => normalizePlugin(plugin))
    .filter((plugin): plugin is AudioPluginInstance => Boolean(plugin))
  const withoutVolume = normalized.filter((plugin) => plugin.kind !== 'volume')
  const volume =
    normalized.find((plugin) => plugin.kind === 'volume') ?? createDefaultAudioPlugin('volume')
  const lockedVolume: AudioPluginInstance = {
    id: 'audio-volume',
    kind: 'volume',
    enabled: true,
    locked: true,
    config: volume.kind === 'volume' ? volume.config : { gain: 1 }
  }

  return [lockedVolume, ...withoutVolume]
}

function normalizePlugin(value: unknown): AudioPluginInstance | null {
  if (!isRecord(value) || typeof value.kind !== 'string' || typeof value.id !== 'string') {
    return null
  }

  const enabled = typeof value.enabled === 'boolean' ? value.enabled : true

  switch (value.kind) {
    case 'volume':
      return {
        id: value.id,
        kind: 'volume',
        enabled: true,
        locked: true,
        config: { gain: clampNumber(readNumber(value.config, 'gain', 1), 0, 2) }
      }
    case 'noiseGate':
      return {
        id: value.id,
        kind: 'noiseGate',
        enabled,
        config: {
          thresholdDb: clampNumber(readNumber(value.config, 'thresholdDb', -48), -90, -6),
          attackMs: clampNumber(readNumber(value.config, 'attackMs', 12), 1, 120),
          releaseMs: clampNumber(readNumber(value.config, 'releaseMs', 120), 20, 700)
        }
      }
    case 'compressor':
      return {
        id: value.id,
        kind: 'compressor',
        enabled,
        config: {
          thresholdDb: clampNumber(readNumber(value.config, 'thresholdDb', -24), -60, 0),
          ratio: clampNumber(readNumber(value.config, 'ratio', 3), 1, 20),
          attackMs: clampNumber(readNumber(value.config, 'attackMs', 8), 1, 100),
          releaseMs: clampNumber(readNumber(value.config, 'releaseMs', 160), 20, 1000),
          makeupGain: clampNumber(readNumber(value.config, 'makeupGain', 1), 0, 4)
        }
      }
    case 'equalizer10': {
      const config = isRecord(value.config) ? value.config : {}
      const gainsValue = Array.isArray(config.gainsDb) ? config.gainsDb : []
      return {
        id: value.id,
        kind: 'equalizer10',
        enabled,
        config: {
          gainsDb: equalizer10Bands.map((_, index) =>
            clampNumber(typeof gainsValue[index] === 'number' ? gainsValue[index] : 0, -12, 12)
          )
        }
      }
    }
    case 'saturator':
      return {
        id: value.id,
        kind: 'saturator',
        enabled,
        config: {
          drive: clampNumber(readNumber(value.config, 'drive', 1.8), 0, 12),
          mix: clampNumber(readNumber(value.config, 'mix', 0.35), 0, 1),
          outputGain: clampNumber(readNumber(value.config, 'outputGain', 1), 0, 2)
        }
      }
    default:
      return null
  }
}

function readNumber(value: unknown, key: string, fallback: number): number {
  if (!isRecord(value)) {
    return fallback
  }

  return typeof value[key] === 'number' ? value[key] : fallback
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min
  }

  return Math.min(max, Math.max(min, value))
}

function createAudioPluginId(kind: AudioPluginKind): string {
  const randomId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${kind}:${randomId}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
