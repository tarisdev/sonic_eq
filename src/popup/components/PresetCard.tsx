import type { ReactNode } from 'react';
import type { EQPreset } from '@/types';
import { Check, Star } from 'lucide-react';
import { categoryLabel, presetDescription, presetName, t } from '@/i18n';

interface PresetCardProps {
  preset: EQPreset;
  selected?: boolean;
  favorite?: boolean;
  onSelect?: () => void;
  onToggleFavorite?: () => void;
  children?: ReactNode;
}

/** One row of the preset list: name, short description and quick actions. */
export function PresetCard({
  preset,
  selected = false,
  favorite = false,
  onSelect,
  onToggleFavorite,
  children,
}: PresetCardProps) {
  return (
    <div className={`preset-card${selected ? ' selected' : ''}`}>
      <button type="button" className="meta" onClick={onSelect} aria-pressed={selected}>
        <span className="name">
          {selected && <Check size={13} aria-hidden="true" />}
          {presetName(preset)}
          {!preset.isBuiltIn && <span className="muted tiny">{t('preset.customBadge')}</span>}
        </span>
        <span className="desc">{presetDescription(preset) || categoryLabel(preset.category)}</span>
      </button>
      {onToggleFavorite && (
        <button
          type="button"
          className={`icon-btn${favorite ? ' is-active' : ''}`}
          onClick={onToggleFavorite}
          aria-label={
            favorite
              ? t('preset.removeFavoriteAria', { name: presetName(preset) })
              : t('preset.addFavoriteAria', { name: presetName(preset) })
          }
          aria-pressed={favorite}
        >
          <Star size={13} aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} />
        </button>
      )}
      {children}
    </div>
  );
}
