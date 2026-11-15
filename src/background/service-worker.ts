/**
 * Background service worker — the only writer of the per-tab capture registry.
 *
 * Flow: the popup obtains a tab-capture streamId (user gesture + activeTab) and
 * asks the SW to start processing; the SW makes sure the offscreen document
 * exists and relays the request there. The SW never touches audio, so Chrome is
 * free to suspend or restart it without interrupting playback.
 */
import {
  type AnyMessage,
  type CaptureEntry,
  type CaptureResult,
  type CapturedTabs,
  type OffscreenMessage,
  type StatusResult,
} from '@/types';
import { describeCaptureError } from '@/utils/captureErrors';
import { sendMessage } from '@/utils/messages';
import { readCapturedTabs, readState, writeCapturedTabs } from '@/utils/storage';

const OFFSCREEN_PATH = 'offscreen.html';
const BADGE_COLOR = '#22c55e';

let offscreenCreation: Promise<void> | null = null;

/** Creates the offscreen document once; concurrent calls share one attempt. */
async function ensureOffscreen(): Promise<void> {
  if (offscreenCreation) return offscreenCreation;
  offscreenCreation = (async () => {
    try {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_PATH,
        reasons: ['USER_MEDIA', 'AUDIO_PLAYBACK'],
        justification: 'Capture tab audio, run it through the equalizer and play it back.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      // Chrome throws when a document already exists — that is not a failure.
      if (!/already exists|single offscreen/i.test(message)) throw error;
    } finally {
      offscreenCreation = null;
    }
  })();
  return offscreenCreation;
}

async function closeOffscreen(): Promise<void> {
  try {
    await chrome.offscreen.closeDocument();
  } catch {
    /* nothing to close */
  }
}

type OffscreenReply = { ok: boolean; error?: string; warning?: string };

function relayToOffscreen(message: OffscreenMessage): Promise<OffscreenReply | null> {
  return sendMessage<OffscreenReply>(message);
}

/**
 * The offscreen document is created on demand, and its script may not have
 * registered its listener yet, so a relay can land on nothing. Retry briefly
 * before reporting failure instead of surfacing a transient error.
 */
async function relayWithRetry(
  message: OffscreenMessage,
  attempts = 3,
  delayMs = 120,
): Promise<OffscreenReply | null> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const reply = await relayToOffscreen(message);
    if (reply) return reply;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return null;
}

async function updateBadge(): Promise<void> {
  const tabs = await readCapturedTabs();
  const count = Object.keys(tabs).length;
  try {
    await chrome.action.setBadgeBackgroundColor({ color: BADGE_COLOR });
    await chrome.action.setBadgeText({ text: count > 0 ? String(count) : '' });
    await chrome.action.setTitle({
      title: count > 0 ? `SonicEQ — processing ${count} tab(s)` : 'SonicEQ',
    });
  } catch {
    /* badge is cosmetic */
  }
}

async function startCapture(tabId: number, streamId: string, url: string | null): Promise<CaptureResult> {
  try {
    await ensureOffscreen();
    const reply = await relayWithRetry({ type: 'OFFSCREEN_START', tabId, streamId });
    if (!reply || !reply.ok) {
      return {
        ok: false,
        error: reply?.error ?? 'The audio processor did not respond. Please try again.',
      };
    }
    const tabs = await readCapturedTabs();
    tabs[String(tabId)] = { tabId, url, startedAt: Date.now() } satisfies CaptureEntry;
    await writeCapturedTabs(tabs);
    await injectFullscreenWatcher(tabId); // keep the worker alive for the injection
    await updateBadge();
    return { ok: true, ...(reply.warning ? { warning: reply.warning } : {}) };
  } catch (error) {
    return { ok: false, error: describeCaptureError(error) };
  }
}

async function stopCapture(tabId: number): Promise<CaptureResult> {
  const tabs = await readCapturedTabs();
  const key = String(tabId);
  const entry = tabs[key];
  if (!entry) {
    // Still tell offscreen: a graph can exist without a registry entry.
    await relayToOffscreen({ type: 'OFFSCREEN_STOP', tabId });
    return { ok: true };
  }
  // Give the window back if a fullscreen request was bridged (see below).
  if (entry.savedWindowState) await setWindowState(tabId, entry.savedWindowState);
  delete tabs[key];
  await writeCapturedTabs(tabs);
  await relayToOffscreen({ type: 'OFFSCREEN_STOP', tabId });
  if (Object.keys(tabs).length === 0) {
    await relayToOffscreen({ type: 'OFFSCREEN_SHUTDOWN' });
    await closeOffscreen();
  }
  await updateBadge();
  return { ok: true };
}


/**
 * Drops registry entries whose capture is gone (browser restart, tab closed
 * while the worker was suspended, capture stopped by the user).
 */
async function reconcile(): Promise<void> {
  const stored = await readCapturedTabs();
  let live: Set<number>;
  try {
    const infos = await chrome.tabCapture.getCapturedTabs();
    live = new Set(
      infos.filter((i) => i.status !== 'stopped' && i.status !== 'error').map((i) => i.tabId),
    );
  } catch {
    return; // tabCapture unavailable: keep the registry as-is
  }
  const kept: CapturedTabs = {};
  for (const [key, entry] of Object.entries(stored)) {
    if (live.has(entry.tabId)) kept[key] = entry;
  }
  if (Object.keys(kept).length !== Object.keys(stored).length) {
    await writeCapturedTabs(kept);
    if (Object.keys(kept).length === 0) await closeOffscreen();
  }
  await updateBadge();
}

/**
 * Best-effort auto-enable. Chrome only issues a stream id for tabs on which the
 * extension already has activeTab, so plain new tabs fail silently and the user
 * keeps using the popup button. Never throws.
 */
async function maybeAutoEnable(tabId: number, url: string | null): Promise<void> {
  try {
    const state = await readState();
    if (!state.settings.autoEnableNewTabs) return;
    const captured = await readCapturedTabs();
    if (captured[String(tabId)]) return;
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tabId });
    await startCapture(tabId, streamId, url);
  } catch {
    /* expected for tabs without activeTab */
  }
}

chrome.runtime.onMessage.addListener(
  (message: AnyMessage, sender, sendResponse: (response: unknown) => void) => {
    if (!message || typeof message !== 'object' || !('type' in message)) return false;
    switch (message.type) {
      case 'START_CAPTURE':
        void startCapture(message.tabId, message.streamId, message.url).then(sendResponse);
        return true;
      case 'STOP_CAPTURE':
        void stopCapture(message.tabId).then(sendResponse);
        return true;
      case 'GET_STATUS':
        void readCapturedTabs().then((captured) =>
          sendResponse({ ok: true, captured } satisfies StatusResult),
        );
        return true;
      case 'PAGE_FULLSCREEN': {
        // Content script injected into a captured tab (see injectFullscreenWatcher).
        const tabId = sender.tab?.id;
        if (tabId !== undefined) {
          void (async () => {
            const tabs = await readCapturedTabs();
            if (tabs[String(tabId)]) {
              queueFullscreenSync(tabId, message.fullscreen);
            } else {
              console.warn('[soniceq] PAGE_FULLSCREEN from non-captured tab', tabId);
            }
          })();
        } else {
          console.warn('[soniceq] PAGE_FULLSCREEN without sender.tab');
        }
        sendResponse({ ok: true });
        return false;
      }
      default:
        // OFFSCREEN_* / VIZ_REQUEST belong to the offscreen document and
        // EQ_LIVE is fire-and-forget, so the SW stays out of those channels.
        return false;
    }
  },
);

chrome.tabs.onRemoved.addListener((tabId) => {
  void readCapturedTabs().then((tabs) => {
    if (tabs[String(tabId)]) void stopCapture(tabId);
  });
});

/**
 * Injected into the top frame of a captured tab (isolated world). While a tab is
 * being captured Chrome downgrades `requestFullscreen()` to "fullscreen within
 * the tab" (`FullscreenController::MaybeToggleFullscreenWithinTab`), so the video
 * only fills the tab viewport and the window never follows — F11 still works
 * because that is browser-level fullscreen. The page's own DOM state is the one
 * signal Chrome does not downgrade, hence this watcher.
 */
function watchPageFullscreen(): void {
  const scope = globalThis as { soniceqFullscreenWatched?: boolean };
  if (scope.soniceqFullscreenWatched) return; // re-injection is idempotent
  scope.soniceqFullscreenWatched = true;
  const report = (): void => {
    const fullscreen = document.fullscreenElement !== null;
    console.warn('[soniceq] page fullscreen ->', fullscreen);
    void chrome.runtime.sendMessage({ type: 'PAGE_FULLSCREEN', fullscreen }).catch(() => {
      /* worker asleep/restarting: the next transition reports again */
    });
  };
  document.addEventListener('fullscreenchange', report);
  document.addEventListener('fullscreenerror', () =>
    console.warn('[soniceq] the page refused to enter fullscreen'),
  );
  report();
}

/** Best effort: throws when the tab lost its activeTab grant (cross-origin navigation). */
async function injectFullscreenWatcher(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, func: watchPageFullscreen });
  } catch (error) {
    // Most often: the extension was not reloaded after gaining the 'scripting'
    // permission, or the tab lost its activeTab grant (cross-origin navigation).
    console.warn('[soniceq] fullscreen watcher not injected', error);
  }
}

/**
 * Fullscreen bridge. The window state we replace is remembered per tab so leaving
 * fullscreen restores it; a window the user fullscreened themselves is never
 * touched (a window already in fullscreen is not driven at all).
 */
async function syncWindowFullscreen(tabId: number, fullscreen: boolean): Promise<void> {
  const tabs = await readCapturedTabs();
  const entry = tabs[String(tabId)];
  if (!entry) return; // a capture started by something else
  if (!fullscreen) {
    const previous = entry.savedWindowState;
    if (!previous) return; // we never drove this window
    tabs[String(tabId)] = { ...entry, savedWindowState: null };
    await writeCapturedTabs(tabs);
    // Only give the window back if our drive is still in effect; if the user left
    // fullscreen by other means (F11), their window state is theirs to keep.
    if (await isWindowFullscreen(tabId)) await setWindowState(tabId, previous);
    return;
  }
  let windowId: number;
  try {
    const tab = await chrome.tabs.get(tabId);
    const win = await chrome.windows.get(tab.windowId);
    if (win.state === 'fullscreen') {
      // Already fullscreen (user's F11, or Chrome). Logged because a silent return
      // here is indistinguishable from the message never arriving when debugging.
      console.log('[soniceq] window already fullscreen, not driving it', 'tab=', tabId, 'window=', tab.windowId);
      return;
    }
    windowId = tab.windowId;
    tabs[String(tabId)] = { ...entry, savedWindowState: win.state ?? 'normal' };
    await writeCapturedTabs(tabs);
  } catch {
    return; // the tab or its window disappeared mid-flight
  }
  try {
    await chrome.windows.update(windowId, { state: 'fullscreen' });
    // The transition can lag or be declined while the tab is in "fullscreen
    // within tab", so verify instead of assuming it worked.
    await new Promise((resolve) => setTimeout(resolve, 150));
    const after = await chrome.windows.get(windowId);
    console.log('[soniceq] drove window to fullscreen ->', after.state, 'tab=', tabId, 'window=', windowId);
    if (after.state !== 'fullscreen') {
      console.warn('[soniceq] browser did not keep fullscreen (state =', after.state, ')', 'tab=', tabId, 'window=', windowId);
    }
  } catch (error) {
    console.warn('[soniceq] windows.update(fullscreen) failed', error);
  }
}

/** Applies a window state to the window owning `tabId`; a gone window is not an error. */
async function setWindowState(tabId: number, state: string): Promise<void> {
  try {
    const { windowId } = await chrome.tabs.get(tabId);
    await chrome.windows.update(windowId, { state: state as chrome.windows.WindowState });
  } catch {
    /* the tab or its window disappeared mid-flight */
  }
}

/** Whether the window owning `tabId` is fullscreen right now; a gone window is not one. */
async function isWindowFullscreen(tabId: number): Promise<boolean> {
  try {
    const { windowId } = await chrome.tabs.get(tabId);
    return (await chrome.windows.get(windowId)).state === 'fullscreen';
  } catch {
    return false;
  }
}

/** Window state changes are not idempotent, so fullscreen transitions are serialized. */
let windowQueue: Promise<void> = Promise.resolve();

function queueFullscreenSync(tabId: number, fullscreen: boolean): void {
  windowQueue = windowQueue
    .then(() => syncWindowFullscreen(tabId, fullscreen))
    .catch((error) => {
      console.warn('[soniceq] fullscreen sync failed', error);
    });
}

// Fallback signal. `CaptureInfo.fullscreen` tracks the WebContents, which stays
// false in "fullscreen within tab", so it is only trusted to *enter* fullscreen:
// the DOM watcher above is what reports leaving it.
chrome.tabCapture.onStatusChanged.addListener((info) => {
  if (info.status === 'stopped' || info.status === 'error') {
    void stopCapture(info.tabId);
    return;
  }
  if (info.fullscreen) queueFullscreenSync(info.tabId, true);
});

chrome.runtime.onStartup.addListener(() => void reconcile());
chrome.runtime.onInstalled.addListener(() => void reconcile());

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const { status } = changeInfo;
  if (status === 'loading' || status === 'complete') {
    void readCapturedTabs().then((tabs) => {
      if (!tabs[String(tabId)]) return;
      // A navigation ends any page fullscreen; a freshly loaded document needs
      // its fullscreen watcher back (same-origin navigations keep activeTab).
      if (status === 'loading') queueFullscreenSync(tabId, false);
      else void injectFullscreenWatcher(tabId);
    });
  }
  if (status !== 'complete') return;
  const url = tab.url ?? null;
  if (!url || !/^https?:/i.test(url)) return;
  void maybeAutoEnable(tabId, url);
});

// Keep the registry honest after a worker restart.
void reconcile();
