import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BAND_FREQUENCIES, type EqRange } from '@/types';
import { t } from '@/i18n';
import { computeEqCurve } from '@/utils/eqResponse';
import { formatFreq } from '@/utils/format';

const W = 376; // design width, fallback until the container width is measured
const H = 132;
const PAD = 12;
const LOG_MIN = Math.log(20);
const LOG_MAX = Math.log(20000);

const xOf = (freq: number, width = W): number =>
  ((Math.log(freq) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * width;

interface EqualizerGraphProps {
  gains: number[];
  qFactor: number;
  range: EqRange;
  enabled: boolean;
}

/** Live magnitude response of the current curve (analytic, no fake data). */
export function EqualizerGraph({ gains, qFactor, range, enabled }: EqualizerGraphProps) {
  const curve = useMemo(() => {
    const effective = enabled ? gains : gains.map(() => 0);
    return computeEqCurve(effective, qFactor, BAND_FREQUENCIES, 180);
  }, [gains, qFactor, enabled]);

  // Fill the container instead of letterboxing the fixed 376-unit design: the
  // viewBox width tracks the rendered pixel width (popup ~352 px, options full row).
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [viewW, setViewW] = useState(W);

  useLayoutEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const measure = () => {
      const width = Math.round(el.getBoundingClientRect().width);
      if (width > 0) setViewW(width);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const yOf = (db: number): number => H / 2 - (db / range) * (H / 2 - PAD);

  const points = curve.freqs.map(
    (freq, index) => [xOf(freq, viewW), yOf(curve.dbs[index] ?? 0)] as const,
  );
  const line = points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
  const first = points[0];
  const last = points[points.length - 1];
  const area =
    first && last
      ? `M${first[0].toFixed(1)} ${H / 2} ${points
          .map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`)
          .join(' ')} L${last[0].toFixed(1)} ${H / 2} Z`
      : '';

  const gridLevels = [range, range / 2, 0, -range / 2, -range];

  return (
    <div className="graph-wrap">
      <svg
        className="graph"
        ref={svgRef}
        viewBox={`0 0 ${viewW} ${H}`}
        role="img"
        aria-label={enabled ? t('graph.ariaOn') : t('graph.ariaOff')}
      >
        <defs>
          <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.42" />
            <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="eqStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>

        {gridLevels.map((db) => (
          <g key={db}>
            <line
              x1="0"
              x2={viewW}
              y1={yOf(db)}
              y2={yOf(db)}
              stroke="var(--border)"
              strokeWidth={db === 0 ? 1.2 : 0.6}
              strokeDasharray={db === 0 ? undefined : '3 4'}
            />
            <text x="4" y={yOf(db) - 3} fill="var(--muted)" fontSize="8">
              {formatDbTick(db)}
            </text>
          </g>
        ))}

        {BAND_FREQUENCIES.map((freq) => (
          <line
            key={freq}
            x1={xOf(freq, viewW)}
            x2={xOf(freq, viewW)}
            y1={PAD}
            y2={H - PAD - 6}
            stroke="var(--border)"
            strokeWidth="0.5"
          />
        ))}

        {area && <path d={area} fill="url(#eqFill)" />}
        <path d={line} fill="none" stroke="url(#eqStroke)" strokeWidth="1.8" strokeLinejoin="round" />

        {[31, 250, 1000, 4000, 16000].map((freq) => (
          <text
            key={freq}
            x={xOf(freq, viewW)}
            y={H - 3}
            fill="var(--muted)"
            fontSize="8"
            textAnchor="middle"
          >
            {formatFreq(freq)}
          </text>
        ))}
      </svg>
      <span className="graph-legend tiny">
        <span>Q {qFactor.toFixed(2)}</span>
        <span>±{range} dB</span>
        {!enabled && <span>{t('graph.bypassed')}</span>}
      </span>
    </div>
  );
}

function formatDbTick(db: number): string {
  if (db === 0) return '0';
  return `${db > 0 ? '+' : ''}${db}`;
}
