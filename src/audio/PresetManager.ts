import {
  BAND_COUNT,
  HARD_GAIN_LIMIT,
  PREAMP_LIMIT,
  SCHEMA_VERSION,
  type EQPreset,
  type EqRange,
  type PersistedState,
} from '@/types';
import { BUILT_IN_PRESET_IDS, DEFAULT_PRESETS } from '@/presets/defaultPresets';
import { clampGain, clampGainsToRange, clampPreamp, roundTo } from '@/utils/format';
import { sanitizePersistedState } from '@/utils/validation';
import { t } from '@/i18n';

const PRESET_FILE_KIND = 'soniceq.preset';
const CONFIG_FILE_KIND = 'soniceq.config';

export function getAllPresets(customPresets: readonly EQPreset[]): EQPreset[] {
  return [...DEFAULT_PRESETS, ...customPresets];
}

export function findPreset(id: string, customPresets: readonly EQPreset[]): EQPreset | undefined {
  return getAllPresets(customPresets).find((p) => p.id === id);
}

function isBuiltInPreset(id: string): boolean {
  return BUILT_IN_PRESET_IDS.has(id);
}

export function presetToEqState(
  preset: EQPreset,
  range: EqRange,
): { gains: number[]; preamp: number } {
  return { gains: clampGainsToRange(preset.gains, range), preamp: clampPreamp(preset.preamp) };
}

export { clampGainsToRange };

export interface CustomPresetInput {
  name: string;
  description?: string;
  category?: string;
  gains: readonly number[];
  preamp: number;
}

let idCounter = 0;

function normalizeGains(gains: readonly number[]): number[] {
  const out = Array(BAND_COUNT).fill(0) as number[];
  for (let i = 0; i < BAND_COUNT; i++) {
    const v = gains[i];
    out[i] = typeof v === 'number' && Number.isFinite(v) ? clampGain(roundTo(v, 0.1)) : 0;
  }
  return out;
}

export function createCustomPreset(input: CustomPresetInput): EQPreset {
  idCounter += 1;
  return {
    id: `custom-${Date.now().toString(36)}-${idCounter.toString(36)}`,
    name: input.name.trim().slice(0, 40) || 'Custom Preset',
    description: (input.description ?? '').trim().slice(0, 140),
    category: (input.category ?? 'Custom').trim().slice(0, 30) || 'Custom',
    gains: normalizeGains(input.gains),
    preamp: clampPreamp(roundTo(input.preamp, 0.1)),
    isBuiltIn: false,
  };
}

/** Built-in presets can never be modified or deleted. */
export function updateCustomPreset(
  list: readonly EQPreset[],
  id: string,
  patch: Partial<CustomPresetInput>,
): EQPreset[] {
  if (isBuiltInPreset(id)) throw new Error(t('error.presetReadOnly'));
  if (!list.some((p) => p.id === id)) throw new Error(t('error.presetNotFound'));
  return list.map((p) =>
    p.id === id
      ? {
          ...p,
          name: patch.name !== undefined ? patch.name.trim().slice(0, 40) || p.name : p.name,
          description:
            patch.description !== undefined ? patch.description.trim().slice(0, 140) : p.description,
          category:
            patch.category !== undefined ? patch.category.trim().slice(0, 30) || p.category : p.category,
          gains: patch.gains !== undefined ? normalizeGains(patch.gains) : p.gains,
          preamp: patch.preamp !== undefined ? clampPreamp(roundTo(patch.preamp, 0.1)) : p.preamp,
        }
      : p,
  );
}

export function deleteCustomPreset(list: readonly EQPreset[], id: string): EQPreset[] {
  if (isBuiltInPreset(id)) throw new Error(t('error.presetNotDeletable'));
  return list.filter((p) => p.id !== id);
}

export function duplicatePreset(preset: EQPreset): EQPreset {
  return createCustomPreset({
    name: `${preset.name} Copy`.slice(0, 40),
    description: preset.description,
    category: preset.category,
    gains: preset.gains,
    preamp: preset.preamp,
  });
}

export function toggleFavoriteId(favorites: readonly string[], id: string): string[] {
  return favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
}


// ---- import / export ----

export interface PresetImportResult {
  ok: boolean;
  preset?: EQPreset;
  error?: string;
}

export function exportPresetJson(preset: EQPreset): string {
  return JSON.stringify(
    { kind: PRESET_FILE_KIND, version: SCHEMA_VERSION, preset: { ...preset, isBuiltIn: false } },
    null,
    2,
  );
}

/** Validates an imported preset payload (file content is never trusted). */
function parsePresetPayload(raw: unknown): PresetImportResult {
  const candidate =
    typeof raw === 'object' && raw !== null && 'preset' in raw
      ? (raw as { preset: unknown }).preset
      : raw;
  if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
    return { ok: false, error: t('error.invalidPresetObject') };
  }
  const p = candidate as Partial<EQPreset>;
  if (typeof p.name !== 'string' || p.name.trim().length === 0) {
    return { ok: false, error: t('error.invalidPresetName') };
  }
  if (!Array.isArray(p.gains) || p.gains.length !== BAND_COUNT) {
    return { ok: false, error: t('error.invalidPresetBands', { count: BAND_COUNT }) };
  }
  if (!p.gains.every((g) => typeof g === 'number' && Number.isFinite(g) && Math.abs(g) <= HARD_GAIN_LIMIT)) {
    return { ok: false, error: t('error.invalidPresetGains', { limit: HARD_GAIN_LIMIT }) };
  }
  const preamp = typeof p.preamp === 'number' && Number.isFinite(p.preamp) ? p.preamp : 0;
  if (Math.abs(preamp) > PREAMP_LIMIT) {
    return { ok: false, error: t('error.invalidPresetPreamp', { limit: PREAMP_LIMIT }) };
  }
  return {
    ok: true,
    preset: createCustomPreset({
      name: p.name,
      description: typeof p.description === 'string' ? p.description : '',
      category: typeof p.category === 'string' ? p.category : 'Imported',
      gains: p.gains,
      preamp,
    }),
  };
}

export function parsePresetJson(text: string): PresetImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: t('error.invalidJson') };
  }
  return parsePresetPayload(raw);
}

export interface ConfigImportResult {
  ok: boolean;
  state?: PersistedState;
  error?: string;
}

export function exportConfigJson(state: PersistedState): string {
  return JSON.stringify({ kind: CONFIG_FILE_KIND, ...state }, null, 2);
}

/** Config import runs through the same tolerant sanitizer used for storage. */
export function parseConfigJson(text: string): ConfigImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: t('error.invalidJson') };
  }
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, error: t('error.invalidConfigFile') };
  }
  const body =
    'state' in raw && typeof (raw as { state: unknown }).state === 'object'
      ? (raw as { state: unknown }).state
      : raw;
  return { ok: true, state: sanitizePersistedState(body) };
}
