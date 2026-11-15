/**
 * Offscreen document — the audio host. It survives popup close and service
 * worker suspension, keeps every captured tab's stream alive, applies EQ state
 * coming from the store (messages) or from storage (fallback), and answers
 * visualization requests with real analyser data.
 */
import { AudioEngine } from '@/audio/AudioEngine';
import { AudioVisualizer } from '@/audio/AudioVisualizer';
import { STORAGE_KEY, type AnyMessage, type VizFrame } from '@/types';
import { readState } from '@/utils/storage';
import { sanitizePersistedState, toAppliedEqState } from '@/utils/validation';

const engine = new AudioEngine();
let visualizer: AudioVisualizer | null = null;

/** Last known parameters, re-applied whenever a graph is (re)created. */
let engineState = toAppliedEqState(sanitizePersistedState(null));

/** A VIZ_REQUEST answered with no data is the idle state, never fake audio. */
function vizFrame(): VizFrame {
  const bins = visualizer?.read() ?? [];
  const active = engine.captureCount > 0 && bins.some((v) => v > 2);
  return { ok: bins.length > 0, active, bins };
}

function ensureVisualizer(): void {
  if (visualizer) return;
  const ctx = engine.context;
  const output = engine.getEqOutput();
  if (!ctx || !output) return;
  visualizer = new AudioVisualizer(ctx);
  visualizer.attach(output);
}

async function loadState(): Promise<void> {
  const state = await readState();
  engineState = toAppliedEqState(state);
  engine.applyState(engineState);
}

chrome.runtime.onMessage.addListener(
  (message: AnyMessage, _sender, sendResponse: (response: unknown) => void) => {
    if (!message || typeof message !== 'object' || !('type' in message)) return false;
    switch (message.type) {
      case 'OFFSCREEN_START': {
        void (async () => {
          try {
            await engine.startCapture(message.tabId, message.streamId);
            ensureVisualizer();
            // A suspended context would silently swallow the tab's audio.
            const suspended = engine.contextState === 'suspended';
            sendResponse({
              ok: true,
              ...(suspended ? { warning: 'audioContextSuspended' } : {}),
            });
          } catch (error) {
            sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error) });
          }
        })();
        return true;
      }
      case 'OFFSCREEN_STOP':
        sendResponse({ ok: true, stopped: engine.stopCapture(message.tabId) });
        return true;
      case 'OFFSCREEN_SHUTDOWN':
        void engine.dispose().then(() => {
          visualizer?.detach();
          visualizer = null;
          sendResponse({ ok: true });
        });
        return true;
      case 'EQ_LIVE':
        // Immediate, storage-free apply path so dragging a slider feels live.
        engineState = {
          enabled: message.enabled,
          gains: [...message.gains],
          preamp: message.preamp,
          qFactor: message.qFactor,
          smoothing: message.smoothing,
          limiter: message.limiter,
        };
        engine.applyState(engineState);
        return false;
      case 'VIZ_REQUEST':
        ensureVisualizer();
        sendResponse(vizFrame());
        return false;
      default:
        return false;
    }
  },
);

// Fallback/reconciliation path: anything persisted elsewhere (options page,
// imported config, another browser window) is applied here too.
if (chrome.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[STORAGE_KEY]) return;
    const state = sanitizePersistedState(changes[STORAGE_KEY].newValue);
    engineState = toAppliedEqState(state);
    engine.applyState(engineState);
  });
}

void loadState();
