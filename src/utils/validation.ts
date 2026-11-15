import {
  BAND_COUNT,
  SCHEMA_VERSION,
  type AppLanguage,
  type EQPreset,
  type EQSettings,
  type EQState,
  type EqRange,
  type PersistedState,
  type ThemeMode,
} from '@/types';
import { DEFAULT_PRESETS } from '@/presets/defaultPresets';
import { clamp, clampGain, clampGainsToRange, clampPreamp } from '@/utils/format';
import type { AppliedEqState } from '@/types';

export const DEFAULT_SETTINGS: EQSettings = {
  defaultPresetId: 'flat',
  defaultEnabled: true,
  eqRange: 12,
  qFactor: 1.0,
  smoothing: 0.05,
  autoEnableNewTabs: false,
  limiter: true,
  visualization: true,
  compact: false,
  theme: 'dark',
  language: 'system',
};

function defaultEQState(): EQState {
  return { enabled: true, activePresetId: 'flat', gains: Array(BAND_COUNT).fill(0), preamp: 0 };
}

export function defaultPersistedState(): PersistedState {
  return {
    version: SCHEMA_VERSION,
    eq: defaultEQState(),
    favorites: [],
    customPresets: [],
    settings: { ...DEFAULT_SETTINGS },
  };
}

function sanitizeGains(raw: unknown, fallback: number[]): number[] {
  if (!Array.isArray(raw) || raw.length !== BAND_COUNT) return [...fallback];
  return raw.map((v, i) =>
    typeof v === 'number' && Number.isFinite(v) ? clampGain(v) : (fallback[i] as number),
  );
}

export function sanitizeSettings(raw: unknown): EQSettings {
  const src = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<EQSettings>;
  const base = DEFAULT_SETTINGS;
  const eqRange: EqRange = src.eqRange === 6 || src.eqRange === 18 ? src.eqRange : src.eqRange === 12 ? 12 : base.eqRange;
  const theme: ThemeMode =
    src.theme === 'light' || src.theme === 'system' ? src.theme : base.theme;
  const language: AppLanguage =
    src.language === 'en' || src.language === 'vi' ? src.language : base.language;
  return {
    defaultPresetId:
      typeof src.defaultPresetId === 'string' && src.defaultPresetId.length > 0
        ? src.defaultPresetId
        : base.defaultPresetId,
    defaultEnabled: typeof src.defaultEnabled === 'boolean' ? src.defaultEnabled : base.defaultEnabled,
    eqRange,
    qFactor: typeof src.qFactor === 'number' && Number.isFinite(src.qFactor) ? clamp(src.qFactor, 0.3, 5) : base.qFactor,
    smoothing: typeof src.smoothing === 'number' && Number.isFinite(src.smoothing) ? clamp(src.smoothing, 0.005, 0.5) : base.smoothing,
    autoEnableNewTabs: typeof src.autoEnableNewTabs === 'boolean' ? src.autoEnableNewTabs : base.autoEnableNewTabs,
    limiter: typeof src.limiter === 'boolean' ? src.limiter : base.limiter,
    visualization: typeof src.visualization === 'boolean' ? src.visualization : base.visualization,
    compact: typeof src.compact === 'boolean' ? src.compact : base.compact,
    theme,
    language,
  };
}

function sanitizeEQState(raw: unknown): EQState {
  const src = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<EQState>;
  const fallback = defaultEQState();
  const gains = sanitizeGains(src.gains, fallback.gains);
  const activePresetId =
    typeof src.activePresetId === 'string' && src.activePresetId.length > 0
      ? src.activePresetId
      : fallback.activePresetId;
  return {
    enabled: typeof src.enabled === 'boolean' ? src.enabled : fallback.enabled,
    activePresetId,
    gains,
    preamp:
      typeof src.preamp === 'number' && Number.isFinite(src.preamp) ? clampPreamp(src.preamp) : fallback.preamp,
  };
}

function isPlainPreset(value: unknown): value is EQPreset {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Partial<EQPreset>;
  return (
    typeof p.id === 'string' &&
    p.id.length > 0 &&
    typeof p.name === 'string' &&
    p.name.trim().length > 0 &&
    Array.isArray(p.gains) &&
    p.gains.length === BAND_COUNT &&
    p.gains.every((g) => typeof g === 'number' && Number.isFinite(g) && Math.abs(g) <= 18) &&
    typeof p.preamp === 'number' &&
    Number.isFinite(p.preamp) &&
    Math.abs(p.preamp) <= 12
  );
}

export function sanitizeCustomPresets(raw: unknown): EQPreset[] {
  if (!Array.isArray(raw)) return [];
  const out: EQPreset[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!isPlainPreset(item)) continue;
    if (item.isBuiltIn) continue; // built-ins are never persisted/overwritten
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push({
      id: item.id,
      name: item.name.trim().slice(0, 40),
      description: typeof item.description === 'string' ? item.description.trim().slice(0, 140) : '',
      category: typeof item.category === 'string' ? item.category.trim().slice(0, 30) || 'Custom' : 'Custom',
      gains: item.gains.map((g) => clampGain(g)),
      preamp: clampPreamp(item.preamp),
      isBuiltIn: false,
    });
    if (out.length >= 200) break; // sanity cap
  }
  return out;
}

export function sanitizeFavorites(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const validIds = new Set([...DEFAULT_PRESETS.map((p) => p.id)]);
  return raw.filter((v): v is string => typeof v === 'string' && validIds.has(v)).slice(0, 64);
}

/**
 * Tolerant entry point: any missing/corrupt/incompatible data falls back to
 * safe defaults instead of throwing — storage may contain data from older
 * versions or partially written state.
 */
export function sanitizePersistedState(raw: unknown): PersistedState {
  const defaults = defaultPersistedState();
  if (typeof raw !== 'object' || raw === null) return defaults;
  const src = raw as Partial<PersistedState>;

  const customPresets = sanitizeCustomPresets(src.customPresets);
  const eq = sanitizeEQState(src.eq);
  // Resolve preset id against known presets; unknown ids fall back to Flat.
  const knownIds = new Set<string>([...DEFAULT_PRESETS.map((p) => p.id), ...customPresets.map((p) => p.id)]);
  if (!knownIds.has(eq.activePresetId)) eq.activePresetId = 'flat';

  const settings = sanitizeSettings(src.settings);
  if (!knownIds.has(settings.defaultPresetId)) settings.defaultPresetId = 'flat';

  return {
    version: SCHEMA_VERSION,
    eq,
    favorites: sanitizeFavorites(src.favorites),
    customPresets,
    settings,
  };
}

/**
 * Derived view for the audio graph: the stored state plus the settings that
 * shape processing. Gains are clamped to the configured ±6/12/18 range.
 */
export function toAppliedEqState(state: PersistedState): AppliedEqState {
  return {
    enabled: state.eq.enabled,
    gains: clampGainsToRange(state.eq.gains, state.settings.eqRange),
    preamp: clampPreamp(state.eq.preamp),
    qFactor: state.settings.qFactor,
    smoothing: state.settings.smoothing,
    limiter: state.settings.limiter,
  };
}
