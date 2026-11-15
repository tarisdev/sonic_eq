import { HARD_GAIN_LIMIT, PREAMP_LIMIT, type EqRange } from '@/types';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Clamp to the hard storage cap (±18 dB). */
export function clampGain(value: number): number {
  return clamp(value, -HARD_GAIN_LIMIT, HARD_GAIN_LIMIT);
}

export function clampPreamp(value: number): number {
  return clamp(value, -PREAMP_LIMIT, PREAMP_LIMIT);
}

/** Applies the ±6 / ±12 / ±18 UI range on top of the stored values. */
export function clampGainsToRange(gains: readonly number[], range: EqRange): number[] {
  return gains.map((g) => roundTo(clamp(g, -range, range), 0.1));
}

/** Round to a step (e.g. 0.1 or 0.5), normalize -0 and avoid float noise. */
export function roundTo(value: number, step: number): number {
  const snapped = Math.round(value / step) * step;
  const decimals = Math.min(6, Math.max(0, Math.ceil(-Math.log10(step))));
  const clean = Number(snapped.toFixed(decimals));
  return Object.is(clean, -0) ? 0 : clean;
}

export function formatDb(value: number, withUnit = true): string {
  const rounded = roundTo(value, 0.1);
  const text = Math.abs(rounded) < 0.05 ? '0' : rounded.toFixed(1).replace(/\.0$/, '');
  return withUnit ? `${text} dB` : text;
}

export function formatFreq(hz: number): string {
  if (hz >= 1000) {
    const kHz = hz / 1000;
    return `${Number.isInteger(kHz) ? kHz : kHz.toFixed(1)} kHz`;
  }
  return `${hz} Hz`;
}

export function hostFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).host || null;
  } catch {
    return null;
  }
}

export function isWebUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}

export function arraysEqual(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => Math.abs(v - (b[i] as number)) < 1e-9);
}
