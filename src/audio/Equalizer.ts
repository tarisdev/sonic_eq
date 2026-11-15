import { BAND_FREQUENCIES, type AppliedEqState } from '@/types';

/**
 * Structural Web Audio interfaces: real Web Audio nodes satisfy them, and tests
 * can pass plain mocks (no polyfill needed).
 */
export interface ParamLike {
  value: number;
  cancelScheduledValues(startTime: number): unknown;
  setTargetAtTime(target: number, startTime: number, timeConstant: number): unknown;
}

export interface NodeLike {
  connect(destination: never): unknown;
  disconnect(): void;
}

export interface GainLike extends NodeLike {
  gain: ParamLike;
}

export interface BiquadLike extends NodeLike {
  type: BiquadFilterType;
  frequency: ParamLike;
  Q: ParamLike;
  gain: ParamLike;
}

export interface CompressorLike extends NodeLike {
  threshold: ParamLike;
  knee: ParamLike;
  ratio: ParamLike;
  attack: ParamLike;
  release: ParamLike;
}

export interface EqContextLike {
  readonly currentTime: number;
  createGain(): GainLike;
  createBiquadFilter(): BiquadLike;
  createDynamicsCompressor(): CompressorLike;
}

/** Limiter settings: a safety net, not a guarantee against clipping. */
const LIMITER_ON = { threshold: -6, knee: 6, ratio: 12 };
const LIMITER_BYPASS = { threshold: 0, knee: 0, ratio: 1 };

export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

function normalizeSmoothing(smoothing: number): number {
  if (!Number.isFinite(smoothing)) return 0.05;
  return Math.min(Math.max(smoothing, 0.001), 0.5);
}

/** Smooth, click-free parameter update. */
function setSmooth(param: ParamLike, value: number, now: number, timeConstant: number): void {
  if (param.value === value) return;
  param.cancelScheduledValues(now);
  param.setTargetAtTime(value, now, timeConstant);
}

export interface EqualizerOptions {
  frequencies?: readonly number[];
}

/**
 * preamp -> peaking band x10 -> limiter -> output
 * The graph is built once per AudioContext; state changes only move parameters
 * (with setTargetAtTime) so switching presets or toggling bypass never clicks
 * and never drops audio.
 */
export class Equalizer {
  readonly input: GainLike;
  readonly output: GainLike;
  readonly bands: BiquadLike[];
  readonly limiter: CompressorLike;
  private readonly ctx: EqContextLike;

  constructor(ctx: EqContextLike, options: EqualizerOptions = {}) {
    this.ctx = ctx;
    const frequencies = options.frequencies ?? BAND_FREQUENCIES;
    this.input = ctx.createGain();
    this.bands = frequencies.map((freq) => {
      const band = ctx.createBiquadFilter();
      band.type = 'peaking';
      band.frequency.value = freq;
      band.Q.value = 1;
      band.gain.value = 0;
      return band;
    });
    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.attack.value = 0.003;
    this.limiter.release.value = 0.25;
    this.limiter.threshold.value = LIMITER_ON.threshold;
    this.limiter.knee.value = LIMITER_ON.knee;
    this.limiter.ratio.value = LIMITER_ON.ratio;
    this.output = ctx.createGain();

    let previous: NodeLike = this.input;
    for (const band of this.bands) {
      previous.connect(band as never);
      previous = band;
    }
    previous.connect(this.limiter as never);
    this.limiter.connect(this.output as never);
  }

  get bandCount(): number {
    return this.bands.length;
  }

  /**
   * Apply state. When `enabled` is false every band and the preamp are driven
   * back to neutral (0 dB) — a real bypass, without disconnecting the graph.
   */
  applyState(state: AppliedEqState): void {
    const now = this.ctx.currentTime;
    const smoothing = normalizeSmoothing(state.smoothing);
    const q = Math.min(Math.max(state.qFactor, 0.3), 5);

    this.bands.forEach((band, index) => {
      const target = state.enabled ? (state.gains[index] ?? 0) : 0;
      setSmooth(band.gain, target, now, smoothing);
      setSmooth(band.Q, q, now, smoothing);
    });
    setSmooth(this.input.gain, dbToLinear(state.enabled ? state.preamp : 0), now, smoothing);

    const limiter = state.enabled && state.limiter ? LIMITER_ON : LIMITER_BYPASS;
    this.limiter.threshold.value = limiter.threshold;
    this.limiter.knee.value = limiter.knee;
    this.limiter.ratio.value = limiter.ratio;
  }

  dispose(): void {
    for (const node of [this.input, ...this.bands, this.limiter, this.output]) {
      try {
        node.disconnect();
      } catch {
        /* already disconnected */
      }
    }
  }
}
