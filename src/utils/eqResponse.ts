/**
 * Analytic magnitude response of a RBJ peaking EQ biquad, summed across bands.
 * Pure math (unit-testable) — used for the live EQ curve in the UI.
 */

function peakingDb(
  bandGainDb: number,
  q: number,
  f0: number,
  freq: number,
  sampleRate: number,
): number {
  const A = Math.pow(10, bandGainDb / 40);
  const w0 = (2 * Math.PI * f0) / sampleRate;
  const cosW0 = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * Math.max(q, 0.01));

  const b0 = 1 + alpha * A;
  const b1 = -2 * cosW0;
  const b2 = 1 - alpha * A;
  const a0 = 1 + alpha / A;
  const a1 = -2 * cosW0;
  const a2 = 1 - alpha / A;

  const w = (2 * Math.PI * freq) / sampleRate;
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  const cos2W = Math.cos(2 * w);
  const sin2W = Math.sin(2 * w);

  const numMag = Math.hypot(b0 + b1 * cosW + b2 * cos2W, -b1 * sinW - b2 * sin2W);
  const denMag = Math.hypot(a0 + a1 * cosW + a2 * cos2W, -a1 * sinW - a2 * sin2W);
  if (denMag === 0 || numMag === 0) return 0;
  return 20 * Math.log10(numMag / denMag);
}

/** Magnitude in dB of all bands at a given frequency. */
export function computeEqDbAt(
  gains: readonly number[],
  q: number,
  freq: number,
  frequencies: readonly number[],
  sampleRate = 48000,
): number {
  let total = 0;
  for (let i = 0; i < gains.length && i < frequencies.length; i++) {
    const gain = gains[i] as number;
    const center = frequencies[i] as number;
    if (gain === 0 || center <= 0) continue;
    total += peakingDb(gain, q, center, freq, sampleRate);
  }
  return total;
}

export interface EqCurve {
  freqs: number[];
  dbs: number[];
}

/** Log-spaced response curve from 20 Hz to 20 kHz for graph rendering. */
export function computeEqCurve(
  gains: readonly number[],
  q: number,
  frequencies: readonly number[],
  points = 160,
  sampleRate = 48000,
): EqCurve {
  const freqs: number[] = [];
  const dbs: number[] = [];
  const min = Math.log(20);
  const max = Math.log(20000);
  for (let i = 0; i < points; i++) {
    const freq = Math.exp(min + ((max - min) * i) / (points - 1));
    freqs.push(freq);
    dbs.push(computeEqDbAt(gains, q, freq, frequencies, sampleRate));
  }
  return { freqs, dbs };
}
