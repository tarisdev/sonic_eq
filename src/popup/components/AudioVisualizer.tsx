import { useEffect, useRef, useState } from 'react';
import { Activity } from 'lucide-react';
import { t } from '@/i18n';
import { broadcastVizRequest } from '@/utils/messages';
import type { VizFrame } from '@/types';
import { Tooltip } from '@/popup/components/Tooltip';

const POLL_MS = 100;
const SILENT_FRAMES = 20; // ~2 s of near-zero signal
const IDLE_BINS = 96;

interface AudioVisualizerProps {
  enabled: boolean;
  activeCaptures: number;
}

/**
 * Live spectrum of the processed output. Frames are pulled from the offscreen
 * audio host (real analyser data); with no capture running the panel shows an
 * idle state instead of invented motion.
 */
export function AudioVisualizer({ enabled, activeCaptures }: AudioVisualizerProps) {
  const [bins, setBins] = useState<number[]>([]);
  const [silent, setSilent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const silentFrames = useRef(0);

  useEffect(() => {
    if (!enabled || activeCaptures === 0) {
      setBins([]);
      setSilent(false);
      silentFrames.current = 0;
      return;
    }
    let cancelled = false;
    const timer = window.setInterval(() => {
      void broadcastVizRequest({ type: 'VIZ_REQUEST' }).then((frame: VizFrame | null) => {
        if (cancelled || !frame || !frame.ok) return;
        setBins(frame.bins);
        silentFrames.current = frame.active ? 0 : silentFrames.current + 1;
        setSilent(silentFrames.current >= SILENT_FRAMES);
      });
    }, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled, activeCaptures]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    const count = IDLE_BINS;
    const barWidth = width / count;
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#22d3ee');
    gradient.addColorStop(1, '#a855f7');
    ctx.fillStyle = gradient;
    for (let i = 0; i < count; i++) {
      const value = (bins[i] ?? 0) / 255;
      const barHeight = Math.max(1, value * (height - 4));
      ctx.fillRect(i * barWidth, height - barHeight, Math.max(1, barWidth - 1), barHeight);
    }
  }, [bins]);

  const idle = !enabled || activeCaptures === 0;

  return (
    <section className="panel" aria-label={t('viz.sectionTitle')}>
      <div className="row between">
        <span className="row" style={{ gap: 6 }}>
          <Activity size={13} aria-hidden="true" />
          <strong className="small">{t('viz.title')}</strong>
          <Tooltip text={t('viz.tooltip')} />
        </span>
        <span className="muted tiny">
          {idle ? t('viz.idle') : silent ? t('viz.silent') : t('viz.live')}
        </span>
      </div>
      {enabled && activeCaptures > 0 ? (
        <canvas ref={canvasRef} className="viz-canvas" width={IDLE_BINS * 4} height={78} />
      ) : (
        <p className="viz-idle">
          {enabled ? t('viz.idleNoCapture') : t('viz.idleBypassed')}
        </p>
      )}
    </section>
  );
}
