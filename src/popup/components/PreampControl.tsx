import { PREAMP_LIMIT } from '@/types';
import { t } from '@/i18n';
import { formatDb } from '@/utils/format';
import { Tooltip } from '@/popup/components/Tooltip';

interface PreampControlProps {
  preamp: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

/**
 * Preamp sits before the bands: lower it when boosting several bands to keep
 * headroom, raise it for quiet sources.
 */
export function PreampControl({ preamp, disabled = false, onChange }: PreampControlProps) {
  return (
    <section className="panel preamp" aria-label={t('preamp.sectionTitle')}>
      <div className="row between">
        <span className="row" style={{ gap: 6 }}>
          <strong className="small">{t('preamp.title')}</strong>
          <Tooltip text={t('preamp.tooltip')} />
        </span>
        <span className="small muted" aria-hidden="true">
          {formatDb(preamp)}
        </span>
      </div>
      <div className="row" style={{ marginTop: 6 }}>
        <input
          type="range"
          min={-PREAMP_LIMIT}
          max={PREAMP_LIMIT}
          step={0.5}
          value={preamp}
          disabled={disabled}
          aria-label={t('preamp.sliderAria')}
          aria-valuetext={formatDb(preamp)}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <input
          type="number"
          min={-PREAMP_LIMIT}
          max={PREAMP_LIMIT}
          step={0.5}
          value={preamp}
          disabled={disabled}
          aria-label={t('preamp.numberAria')}
          className="num-input"
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
    </section>
  );
}
