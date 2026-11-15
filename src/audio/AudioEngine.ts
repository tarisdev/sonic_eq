import { BAND_FREQUENCIES, type AppliedEqState } from '@/types';
import { describeCaptureError } from '@/utils/captureErrors';
import { Equalizer, type EqContextLike } from '@/audio/Equalizer';
import type { AnalyserLike } from '@/audio/AudioVisualizer';

export interface MediaTrackLike {
  stop(): void;
  onended: (() => void) | null;
}

export interface MediaStreamLike {
  getAudioTracks(): MediaTrackLike[];
}

export interface SourceNodeLike {
  connect(destination: never): unknown;
  disconnect(): void;
}

/** Everything the engine needs from an AudioContext (mockable in tests). */
export interface EngineContextLike extends EqContextLike {
  state: AudioContextState;
  readonly sampleRate: number;
  readonly destination: unknown;
  createMediaStreamSource(stream: MediaStreamLike): SourceNodeLike;
  createAnalyser(): AnalyserLike;
  resume(): Promise<void>;
  close(): Promise<void>;
}

export interface EngineOptions {
  createContext?: () => EngineContextLike;
  getUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStreamLike>;
  frequencies?: readonly number[];
}

export function tabCaptureConstraints(streamId: string): MediaStreamConstraints {
  return {
    video: false,
    audio: {
      mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId },
    },
  } as unknown as MediaStreamConstraints;
}

const DEFAULT_STATE: AppliedEqState = {
  enabled: true,
  gains: [],
  preamp: 0,
  qFactor: 1,
  smoothing: 0.05,
  limiter: true,
};

/**
 * Owns the AudioContext and one source per captured tab:
 *
 *   MediaStreamSource(tab) ┐
 *   MediaStreamSource(tab) ┼─> Equalizer (preamp, 10 bands, limiter) ─> destination
 *                          ┘
 *
 * The EQ graph is created once and reused for every tab; stopping a capture
 * only disconnects that tab's source, so other tabs keep playing. The output is
 * always wired to `destination` — otherwise the captured tab would go silent.
 */
export class AudioEngine {
  private ctx: EngineContextLike | null = null;
  private eq: Equalizer | null = null;
  private readonly sources = new Map<number, { stream: MediaStreamLike; node: SourceNodeLike }>();
  private state: AppliedEqState = DEFAULT_STATE;
  private readonly options: EngineOptions;
  private readonly createContext: () => EngineContextLike;
  private readonly getUserMedia: (constraints: MediaStreamConstraints) => Promise<MediaStreamLike>;

  constructor(options: EngineOptions = {}) {
    this.options = options;
    this.createContext = options.createContext ?? (() => new AudioContext() as unknown as EngineContextLike);
    this.getUserMedia =
      options.getUserMedia ??
      ((constraints) => navigator.mediaDevices.getUserMedia(constraints) as Promise<MediaStreamLike>);
  }

  get context(): EngineContextLike | null {
    return this.ctx;
  }

  get captureCount(): number {
    return this.sources.size;
  }

  capturedTabIds(): number[] {
    return [...this.sources.keys()];
  }

  isCaptured(tabId: number): boolean {
    return this.sources.has(tabId);
  }

  getEqOutput(): SourceNodeLike | null {
    return this.eq ? this.eq.output : null;
  }

  /** 'running' means processed audio is actually reaching the speakers. */
  get contextState(): AudioContextState | null {
    return this.ctx ? this.ctx.state : null;
  }

  /** Creates the graph on first use and applies the last known state. */
  private ensureGraph(): { ctx: EngineContextLike; eq: Equalizer } {
    if (!this.ctx || !this.eq) {
      const ctx = this.createContext();
      const eq = new Equalizer(ctx, { frequencies: this.options.frequencies ?? BAND_FREQUENCIES });
      eq.output.connect(ctx.destination as never);
      this.ctx = ctx;
      this.eq = eq;
      eq.applyState(this.state);
    }
    return { ctx: this.ctx, eq: this.eq };
  }

  /** Starts (or restarts) capture for one tab. Throws a user-facing Error. */
  async startCapture(tabId: number, streamId: string): Promise<void> {
    if (this.sources.has(tabId)) this.stopCapture(tabId); // never two graphs per tab
    let stream: MediaStreamLike;
    try {
      stream = await this.getUserMedia(tabCaptureConstraints(streamId));
    } catch (error) {
      throw new Error(describeCaptureError(error));
    }
    const { ctx, eq } = this.ensureGraph();
    const node = ctx.createMediaStreamSource(stream);
    node.connect(eq.input as never);
    const track = stream.getAudioTracks()[0];
    if (track) {
      // Tab closed / capture revoked -> clean up this source only.
      track.onended = () => {
        this.stopCapture(tabId);
      };
    }
    this.sources.set(tabId, { stream, node });
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        /* reported as "no audio yet" by the silence watchdog upstream */
      }
    }
  }

  applyState(state: AppliedEqState): void {
    this.state = state;
    this.eq?.applyState(state);
  }

  stopCapture(tabId: number): boolean {
    const entry = this.sources.get(tabId);
    if (!entry) return false;
    this.sources.delete(tabId);
    try {
      entry.node.disconnect();
    } catch {
      /* already disconnected */
    }
    for (const track of entry.stream.getAudioTracks()) {
      track.onended = null;
      try {
        track.stop();
      } catch {
        /* already stopped */
      }
    }
    return true;
  }

  async dispose(): Promise<void> {
    for (const tabId of this.capturedTabIds()) this.stopCapture(tabId);
    this.eq?.dispose();
    this.eq = null;
    const ctx = this.ctx;
    this.ctx = null;
    if (ctx) {
      try {
        await ctx.close();
      } catch {
        /* already closed */
      }
    }
  }
}
