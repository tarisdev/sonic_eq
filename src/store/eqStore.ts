/**
 * Single source of truth for the UI (popup + options page).
 *
 * - in-memory snapshot for instant UI updates (useSyncExternalStore friendly)
 * - throttled persistence to chrome.storage.local
 * - live broadcast of applied parameters so the offscreen audio host reacts
 *   immediately without waiting for a storage round-trip
 */
import {
  STORAGE_KEY,
  type AppLanguage,
  type EQPreset,
  type EQSettings,
  type PersistedState,
} from '@/types';
import {
  createCustomPreset,
  deleteCustomPreset,
  duplicatePreset as duplicatePresetEntry,
  findPreset,
  presetToEqState,
  toggleFavoriteId,
  updateCustomPreset,
  type CustomPresetInput,
} from '@/audio/PresetManager';
import { clampGain, clampGainsToRange, clampPreamp, roundTo } from '@/utils/format';
import { broadcastEqLive } from '@/utils/messages';
import { readState, writeState } from '@/utils/storage';
import {
  defaultPersistedState,
  sanitizePersistedState,
  sanitizeSettings,
  toAppliedEqState,
} from '@/utils/validation';
import { resolveLanguage, setLanguage } from '@/i18n';

const PERSIST_DELAY_MS = 250;

type Listener = () => void;

let snapshot: PersistedState = defaultPersistedState();
let loaded = false;
let persistTimer: ReturnType<typeof setTimeout> | null = null;
let lastWritten = '';
let lastLocalEdit = 0;
let storageListenerAttached = false;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

/** Keeps the i18n catalogs in sync with the stored language setting. */
function applyLanguage(setting: AppLanguage): void {
  setLanguage(resolveLanguage(setting));
}

function persistNow(): void {
  if (persistTimer !== null) {
    clearTimeout(persistTimer);
    persistTimer = null;
  }
  lastWritten = JSON.stringify(snapshot);
  void writeState(snapshot);
}

function schedulePersist(immediate: boolean): void {
  if (persistTimer !== null) clearTimeout(persistTimer);
  if (immediate) {
    persistNow();
    return;
  }
  persistTimer = setTimeout(persistNow, PERSIST_DELAY_MS);
}

function commit(next: PersistedState, immediate = false): void {
  applyLanguage(next.settings.language);
  snapshot = next;
  lastLocalEdit = Date.now();
  emit();
  broadcastEqLive({ type: 'EQ_LIVE', ...toAppliedEqState(next) });
  schedulePersist(immediate);
}

function attachStorageListener(): void {
  if (storageListenerAttached || typeof chrome === 'undefined' || !chrome.storage?.onChanged) return;
  storageListenerAttached = true;
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[STORAGE_KEY]) return;
    const incoming = JSON.stringify(changes[STORAGE_KEY].newValue);
    if (incoming === lastWritten) return; // our own write
    if (persistTimer !== null || Date.now() - lastLocalEdit < PERSIST_DELAY_MS * 2) return; // local edits win
    snapshot = sanitizePersistedState(changes[STORAGE_KEY].newValue);
    applyLanguage(snapshot.settings.language);
    emit();
  });
}

export const eqStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot(): PersistedState {
    return snapshot;
  },

  isLoaded(): boolean {
    return loaded;
  },

  /** Loads persisted state once per page; safe to call repeatedly. */
  async init(): Promise<void> {
    attachStorageListener();
    if (loaded) return;
    const state = await readState();
    snapshot = state;
    applyLanguage(state.settings.language);
    loaded = true;
    lastWritten = JSON.stringify(state);
    emit();
  },

  /** Flush pending throttled writes (called when the popup closes). */
  flush(): void {
    if (persistTimer !== null) persistNow();
  },

  // ---- live EQ state ----

  setGain(index: number, value: number): void {
    const gains = [...snapshot.eq.gains];
    gains[index] = clampGain(roundTo(value, 0.1));
    commit({ ...snapshot, eq: { ...snapshot.eq, gains } });
  },

  resetBand(index: number): void {
    eqStore.setGain(index, 0);
  },

  setPreamp(value: number): void {
    commit({ ...snapshot, eq: { ...snapshot.eq, preamp: clampPreamp(roundTo(value, 0.1)) } });
  },

  setEnabled(enabled: boolean): void {
    commit({ ...snapshot, eq: { ...snapshot.eq, enabled } }, true);
  },

  toggleEnabled(): void {
    eqStore.setEnabled(!snapshot.eq.enabled);
  },

  applyPreset(id: string): void {
    const preset = findPreset(id, snapshot.customPresets);
    if (!preset) return;
    const applied = presetToEqState(preset, snapshot.settings.eqRange);
    commit({ ...snapshot, eq: { ...snapshot.eq, activePresetId: preset.id, ...applied } }, true);
  },

  /** Reset button: back to the configured default preset (Flat on install). */
  resetEq(): void {
    eqStore.applyPreset(snapshot.settings.defaultPresetId);
  },

  // ---- settings ----

  updateSettings(patch: Partial<EQSettings>): void {
    const settings = sanitizeSettings({ ...snapshot.settings, ...patch });
    const eq =
      settings.eqRange === snapshot.settings.eqRange
        ? snapshot.eq
        : { ...snapshot.eq, gains: clampGainsToRange(snapshot.eq.gains, settings.eqRange) };
    commit({ ...snapshot, settings, eq }, true);
  },

  // ---- presets ----

  saveCurrentAsPreset(input: Omit<CustomPresetInput, 'gains' | 'preamp'>): EQPreset {
    const preset = createCustomPreset({
      ...input,
      gains: snapshot.eq.gains,
      preamp: snapshot.eq.preamp,
    });
    commit(
      {
        ...snapshot,
        customPresets: [...snapshot.customPresets, preset],
        eq: { ...snapshot.eq, activePresetId: preset.id },
      },
      true,
    );
    return preset;
  },

  updatePreset(id: string, patch: Partial<CustomPresetInput>): void {
    commit({ ...snapshot, customPresets: updateCustomPreset(snapshot.customPresets, id, patch) }, true);
  },

  duplicatePreset(id: string): void {
    const preset = findPreset(id, snapshot.customPresets);
    if (!preset) return;
    const copy = duplicatePresetEntry(preset);
    commit(
      {
        ...snapshot,
        customPresets: [...snapshot.customPresets, copy],
        eq: { ...snapshot.eq, activePresetId: copy.id },
      },
      true,
    );
  },

  deletePreset(id: string): void {
    const customPresets = deleteCustomPreset(snapshot.customPresets, id);
    const favorites = snapshot.favorites.filter((f) => f !== id);
    const settings =
      snapshot.settings.defaultPresetId === id
        ? { ...snapshot.settings, defaultPresetId: 'flat' }
        : snapshot.settings;
    const flat = findPreset('flat', []);
    const eq =
      snapshot.eq.activePresetId === id && flat
        ? { ...snapshot.eq, ...presetToEqState(flat, settings.eqRange), activePresetId: 'flat' }
        : snapshot.eq;
    commit({ ...snapshot, customPresets, favorites, settings, eq }, true);
  },

  toggleFavorite(id: string): void {
    commit({ ...snapshot, favorites: toggleFavoriteId(snapshot.favorites, id) }, true);
  },

  /** Used by the import dialog: validated preset becomes a new custom preset. */
  addImportedPreset(preset: EQPreset): void {
    commit(
      {
        ...snapshot,
        customPresets: [...snapshot.customPresets, preset],
        eq: { ...snapshot.eq, activePresetId: preset.id },
      },
      true,
    );
  },

  // ---- whole-config operations ----

  importConfig(state: PersistedState): void {
    commit(sanitizePersistedState(state), true);
  },

  resetAll(): void {
    // "EQ enabled by default" is what the user gets after wiping their data;
    // the preference itself survives the reset so the two stay consistent.
    const { defaultEnabled } = snapshot.settings;
    const fresh = defaultPersistedState();
    fresh.eq.enabled = defaultEnabled;
    fresh.settings.defaultEnabled = defaultEnabled;
    commit(fresh, true);
  },
};

export type EqStore = typeof eqStore;
