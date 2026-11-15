export const VIZ_BINS = 96;
const FFT_SIZE = 1024;

export interface AnalyserLike {
  fftSize: number;
  readonly frequencyBinCount: number;
  smoothingTimeConstant: number;
  getByteFrequencyData(array: Uint8Array<ArrayBuffer>): void;
  connect(destination: never): unknown;
  disconnect(): void;
}

export interface AnalyserContextLike {
  readonly sampleRate: number;
  createAnalyser(): AnalyserLike;
}

/**
 * Log-spaced downsample of linear FFT bins (20 Hz – 16 kHz), so the spectrum
 * looks the way an EQ graph reads. Pure function for testability.
 */
export function resampleLogBins(
  source: ArrayLike<number>,
  target: Uint8Array | number[],
  sampleRate: number,
): void {
  const nyquist = sampleRate / 2;
  const binHz = nyquist / source.length;
  const minF = 20;
  const maxF = Math.min(16000, nyquist);
  const logMin = Math.log(minF);
  const logMax = Math.log(maxF);
  const out = target as { length: number; [index: number]: number };
  for (let i = 0; i < out.length; i++) {
    const f0 = Math.exp(logMin + ((logMax - logMin) * i) / out.length);
    const f1 = Math.exp(logMin + ((logMax - logMin) * (i + 1)) / out.length);
    const start = Math.max(0, Math.floor(f0 / binHz));
    const end = Math.min(source.length - 1, Math.max(start, Math.ceil(f1 / binHz) - 1));
    let peak = 0;
    for (let b = start; b <= end; b++) peak = Math.max(peak, source[b] as number);
    out[i] = peak;
  }
}

/** Owns the AnalyserNode tapped off the EQ output; no data is ever faked. */
export class AudioVisualizer {
  private analyser: AnalyserLike | null = null;
  private buffer: Uint8Array<ArrayBuffer> | null = null;
  private readonly ctx: AnalyserContextLike;

  constructor(ctx: AnalyserContextLike) {
    this.ctx = ctx;
  }

  /** Taps the given node. Idempotent: repeated calls reuse the same analyser. */
  attach(sourceNode: { connect(destination: never): unknown }): void {
    if (this.analyser) return;
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.7;
    sourceNode.connect(analyser as never);
    this.analyser = analyser;
    this.buffer = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
  }

  get attached(): boolean {
    return this.analyser !== null;
  }

  /** Log-spaced spectrum (0-255 per bin); empty when nothing is attached. */
  read(bins = VIZ_BINS): number[] {
    if (!this.analyser || !this.buffer) return [];
    this.analyser.getByteFrequencyData(this.buffer);
    const out = new Array<number>(bins).fill(0);
    resampleLogBins(this.buffer, out, this.ctx.sampleRate);
    return out;
  }

  detach(): void {
    try {
      this.analyser?.disconnect();
    } catch {
      /* already disconnected */
    }
    this.analyser = null;
    this.buffer = null;
  }
}
