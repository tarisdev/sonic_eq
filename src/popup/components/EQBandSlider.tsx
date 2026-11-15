import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { EqRange } from '@/types';
import { t } from '@/i18n';
import { formatDb, formatFreq } from '@/utils/format';

interface EQBandSliderProps {
  frequency: number;
  value: number;
  range: EqRange;
  disabled?: boolean;
  onChange: (value: number) => void;
  onReset: () => void;
}

/**
 * One vertical band: editable dB value, vertical slider (full keyboard support
 * via the native range input) and a per-band reset button.
 */
export function EQBandSlider({
  frequency,
  value,
  range,
  disabled = false,
  onChange,
  onReset,
}: EQBandSliderProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const bandName = t('band.name', { freq: formatFreq(frequency) });

  return (
    <div className="band">
      <input
        className="band-value"
        type="text"
        inputMode="decimal"
        aria-label={t('band.gainDbAria', { band: bandName })}
        value={draft ?? formatDb(value, false)}
        onFocus={() => setDraft(formatDb(value, false))}
        onChange={(event) => {
          setDraft(event.target.value);
          const parsed = Number(event.target.value);
          if (event.target.value.trim() !== '' && Number.isFinite(parsed)) onChange(parsed);
        }}
        onBlur={() => setDraft(null)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
        disabled={disabled}
      />
      <input
        className="band-slider"
        type="range"
        min={-range}
        max={range}
        step={0.5}
        value={value}
        disabled={disabled}
        aria-label={t('band.gainAria', { band: bandName })}
        aria-valuetext={formatDb(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        onDoubleClick={onReset}
        title={t('band.sliderTitle', { band: bandName, value: formatDb(value) })}
      />
      <span className="band-freq">{formatFreq(frequency)}</span>
      <button
        type="button"
        className="band-reset"
        onClick={onReset}
        disabled={disabled}
        aria-label={t('band.resetAria', { band: bandName })}
        title={t('band.resetTitle')}
      >
        <RotateCcw size={9} aria-hidden="true" />
      </button>
    </div>
  );
}
