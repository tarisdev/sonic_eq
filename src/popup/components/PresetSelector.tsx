import { useMemo } from 'react';
import { Download, Plus, RotateCcw, Star, Upload } from 'lucide-react';
import { findPreset, getAllPresets, presetToEqState } from '@/audio/PresetManager';
import { categoryLabel, presetDescription, presetName, t } from '@/i18n';
import type { PersistedState } from '@/types';
import { arraysEqual } from '@/utils/format';

interface PresetSelectorProps {
  state: PersistedState;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onResetEq: () => void;
  onSaveAs: () => void;
  onExport: () => void;
  onImport: () => void;
}

/** Single preset picker for the popup (the card browser lives on the Options page). */
export function PresetSelector({
  state,
  onSelect,
  onToggleFavorite,
  onResetEq,
  onSaveAs,
  onExport,
  onImport,
}: PresetSelectorProps) {
  const { customPresets, favorites, eq, settings } = state;

  const presets = useMemo(() => getAllPresets(customPresets), [customPresets]);
  const active = findPreset(eq.activePresetId, customPresets);
  const isFavorite = favorites.includes(eq.activePresetId);
  const modified = useMemo(() => {
    if (!active) return false;
    const applied = presetToEqState(active, settings.eqRange);
    return !arraysEqual(applied.gains, eq.gains) || applied.preamp !== eq.preamp;
  }, [active, eq.gains, eq.preamp, settings.eqRange]);

  return (
    <section className="panel" aria-label={t('preset.sectionTitle')}>
      <div className="row between">
        <strong className="small">{t('preset.title')}</strong>
        <div className="row" style={{ gap: 2 }}>
          <button
            type="button"
            className="icon-btn"
            onClick={onExport}
            title={t('preset.exportJson')}
            aria-label={t('preset.exportJson')}
          >
            <Download size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onImport}
            title={t('preset.importJson')}
            aria-label={t('preset.importJson')}
          >
            <Upload size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="row" style={{ marginTop: 6 }}>
        <select
          value={eq.activePresetId}
          onChange={(event) => onSelect(event.target.value)}
          aria-label={t('preset.selectAria')}
        >
          {/* Stored id that no longer matches any preset: don't render a blank select. */}
          {!active && <option value={eq.activePresetId}>{t('preset.customCurve')}</option>}
          {favorites.length > 0 && (
            <optgroup label={t('preset.favorites')}>
              {presets
                .filter((preset) => favorites.includes(preset.id))
                .map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {presetName(preset)}
                  </option>
                ))}
            </optgroup>
          )}
          {[...new Set(presets.map((preset) => preset.category))].map((category) => (
            <optgroup key={category} label={categoryLabel(category)}>
              {presets
                .filter((preset) => preset.category === category)
                .map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {presetName(preset)}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <button
          type="button"
          className={`icon-btn${isFavorite ? ' is-active' : ''}`}
          onClick={() => onToggleFavorite(eq.activePresetId)}
          aria-pressed={isFavorite}
          aria-label={t('preset.favoriteToggleAria')}
          title={t('preset.favoriteTitle')}
        >
          <Star size={15} aria-hidden="true" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <p className="muted tiny" style={{ margin: '6px 0 0' }}>
        {active ? presetDescription(active) : t('preset.customHint')}
        {modified && <span> {t('preset.modified')}</span>}
      </p>

      <div className="row" style={{ marginTop: 8 }}>
        <button type="button" className="btn" onClick={onSaveAs}>
          <Plus size={13} aria-hidden="true" />
          {t('preset.saveCurrent')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onResetEq}>
          <RotateCcw size={13} aria-hidden="true" />
          {t('common.reset')}
        </button>
      </div>
    </section>
  );
}
