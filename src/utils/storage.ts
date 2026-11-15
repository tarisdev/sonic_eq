import {
  CAPTURED_TABS_KEY,
  STORAGE_KEY,
  type CapturedTabs,
  type PersistedState,
} from '@/types';
import { sanitizePersistedState } from '@/utils/validation';

const local = () => chrome.storage.local;
const session = () => chrome.storage.session;

/** Read persisted state; always returns a valid object, never throws. */
export async function readState(): Promise<PersistedState> {
  try {
    const data = await local().get(STORAGE_KEY);
    return sanitizePersistedState(data[STORAGE_KEY]);
  } catch {
    return sanitizePersistedState(null);
  }
}

export async function writeState(state: PersistedState): Promise<void> {
  await local().set({ [STORAGE_KEY]: state });
}

// ---- per-tab capture bookkeeping (survives service-worker restarts) ----

export function sanitizeCapturedTabs(raw: unknown): CapturedTabs {
  if (typeof raw !== 'object' || raw === null) return {};
  const out: CapturedTabs = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value !== 'object' || value === null) continue;
    const entry = value as {
      tabId?: unknown;
      url?: unknown;
      startedAt?: unknown;
      savedWindowState?: unknown;
    };
    if (typeof entry.tabId !== 'number') continue;
    out[key] = {
      tabId: entry.tabId,
      url: typeof entry.url === 'string' ? entry.url : null,
      startedAt: typeof entry.startedAt === 'number' ? entry.startedAt : Date.now(),
      savedWindowState: typeof entry.savedWindowState === 'string' ? entry.savedWindowState : null,
    };
  }
  return out;
}

export async function readCapturedTabs(): Promise<CapturedTabs> {
  try {
    const data = await session().get(CAPTURED_TABS_KEY);
    return sanitizeCapturedTabs(data[CAPTURED_TABS_KEY]);
  } catch {
    return {};
  }
}

export async function writeCapturedTabs(tabs: CapturedTabs): Promise<void> {
  await session().set({ [CAPTURED_TABS_KEY]: tabs });
}
