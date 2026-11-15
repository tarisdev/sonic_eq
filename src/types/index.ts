/** Shared types and constants for SonicEQ. */

export const BAND_FREQUENCIES = [
  31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000,
] as const;
export const BAND_COUNT = 10;
/** Hard cap for stored values; UI range (±6/12/18) is clamped on top of this. */
export const HARD_GAIN_LIMIT = 18;
export const PREAMP_LIMIT = 12;
export const STORAGE_KEY = 'soniceq';
export const SCHEMA_VERSION = 1;
export const CAPTURED_TABS_KEY = 'capturedTabs';

export interface EQPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  /** 10 values, one per band, dB within [-HARD_GAIN_LIMIT, HARD_GAIN_LIMIT]. */
  gains: number[];
  preamp: number;
  isBuiltIn: boolean;
}

export type EqRange = 6 | 12 | 18;
export type ThemeMode = 'dark' | 'light' | 'system';
/** UI language setting; 'system' follows the browser UI language. */
export type AppLanguage = 'system' | 'en' | 'vi';
/** Concrete languages the catalogs are written in. */
export type Lang = Exclude<AppLanguage, 'system'>;

export interface EQSettings {
  /** Preset applied by "Reset" and on a fresh install. */
  defaultPresetId: string;
  /** EQ processing state used when the engine (re)starts. */
  defaultEnabled: boolean;
  eqRange: EqRange;
  /** Shared Q factor for all bands (0.3 – 5). */
  qFactor: number;
  /** setTargetAtTime time constant in seconds (5 – 500 ms). */
  smoothing: number;
  /** Best-effort: only works for tabs where activeTab was granted (see README). */
  autoEnableNewTabs: boolean;
  limiter: boolean;
  visualization: boolean;
  compact: boolean;
  theme: ThemeMode;
  language: AppLanguage;
}

export interface EQState {
  enabled: boolean;
  activePresetId: string;
  gains: number[];
  preamp: number;
}

/** Complete parameter set the audio graph needs to render the EQ. */
export interface AppliedEqState {
  enabled: boolean;
  gains: number[];
  preamp: number;
  qFactor: number;
  smoothing: number;
  limiter: boolean;
}

export interface PersistedState {
  version: number;
  eq: EQState;
  favorites: string[];
  customPresets: EQPreset[];
  settings: EQSettings;
}

export interface CaptureEntry {
  tabId: number;
  url: string | null;
  startedAt: number;
  /**
   * Window state to restore when the captured tab leaves fullscreen. Set only
   * when the extension had to drive fullscreen itself (see service worker).
   */
  savedWindowState?: string | null;
}

export type CapturedTabs = Record<string, CaptureEntry>;

/** Messages popup/options -> background (background is the single responder). */
export type ControlMessage =
  | { type: 'START_CAPTURE'; tabId: number; streamId: string; url: string | null }
  | { type: 'STOP_CAPTURE'; tabId: number }
  | { type: 'GET_STATUS' };

/** Messages broadcast by the store; offscreen applies them to the audio graph. */
export interface EqLiveMessage extends AppliedEqState {
  type: 'EQ_LIVE';
}

/** Messages popup -> offscreen (offscreen is the single responder). */
export interface VizRequestMessage {
  type: 'VIZ_REQUEST';
}

/** Messages injected fullscreen watcher -> background (see service worker). */
export interface PageFullscreenMessage {
  type: 'PAGE_FULLSCREEN';
  fullscreen: boolean;
}

/** Internal background <-> offscreen messages. */
export type OffscreenMessage =
  | { type: 'OFFSCREEN_START'; tabId: number; streamId: string }
  | { type: 'OFFSCREEN_STOP'; tabId: number }
  | { type: 'OFFSCREEN_SHUTDOWN' };

export type AnyMessage =
  | ControlMessage
  | EqLiveMessage
  | VizRequestMessage
  | OffscreenMessage
  | PageFullscreenMessage;

export interface CaptureResult {
  ok: boolean;
  error?: string;
  /** Non-fatal note: a code the UI translates (e.g. 'audioContextSuspended'). */
  warning?: string;
}

export interface StatusResult {
  ok: boolean;
  captured: CapturedTabs;
}

export interface VizFrame {
  ok: boolean;
  active: boolean;
  bins: number[];
}
