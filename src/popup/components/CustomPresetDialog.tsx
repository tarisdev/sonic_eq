import { useState } from 'react';
import type { EQPreset } from '@/types';
import { t } from '@/i18n';
import { eqStore } from '@/store/eqStore';
import { pushToast } from '@/hooks/useToast';

interface CustomPresetDialogProps {
  mode: 'save' | 'edit';
  preset?: EQPreset;
  onClose: () => void;
}

/** Create a preset from the current curve, or rename/re-describe a custom one. */
export function CustomPresetDialog({ mode, preset, onClose }: CustomPresetDialogProps) {
  const [name, setName] = useState(mode === 'edit' ? (preset?.name ?? '') : '');
  const [description, setDescription] = useState(mode === 'edit' ? (preset?.description ?? '') : '');
  const [category, setCategory] = useState(mode === 'edit' ? (preset?.category ?? 'Custom') : 'Custom');
  const [useCurrentCurve, setUseCurrentCurve] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('dialog.nameRequired'));
      return;
    }
    try {
      if (mode === 'save') {
        eqStore.saveCurrentAsPreset({
          name: trimmed,
          description: description.trim(),
          category: category.trim() || 'Custom',
        });
        pushToast(t('dialog.savedToast', { name: trimmed }), 'success');
      } else if (preset) {
        const snapshot = eqStore.getSnapshot();
        eqStore.updatePreset(preset.id, {
          name: trimmed,
          description: description.trim(),
          category: category.trim() || 'Custom',
          ...(useCurrentCurve ? { gains: snapshot.eq.gains, preamp: snapshot.eq.preamp } : {}),
        });
        pushToast(t('dialog.updatedToast'), 'success');
      }
      onClose();
    } catch (thrown) {
      setError(thrown instanceof Error ? thrown.message : t('dialog.failedToast'));
    }
  };

  return (
    <div className="backdrop" role="dialog" aria-modal="true" aria-label={t('dialog.presetDetails')}>
      <div className="dialog">
        <h2>
          {mode === 'save' ? t('dialog.saveTitle') : t('dialog.editTitle', { name: preset?.name ?? '' })}
        </h2>

        <label className="field">
          <span>{t('dialog.nameLabel')}</span>
          <input
            type="text"
            value={name}
            maxLength={40}
            onChange={(event) => setName(event.target.value)}
            autoFocus
          />
        </label>

        <label className="field">
          <span>{t('dialog.descriptionLabel')}</span>
          <input
            type="text"
            value={description}
            maxLength={140}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <label className="field">
          <span>{t('dialog.categoryLabel')}</span>
          <input type="text" value={category} maxLength={30} onChange={(event) => setCategory(event.target.value)} />
        </label>

        {mode === 'edit' && (
          <label className="check-field">
            <input
              type="checkbox"
              checked={useCurrentCurve}
              onChange={(event) => setUseCurrentCurve(event.target.checked)}
            />
            <span>{t('dialog.useCurrentCurve')}</span>
          </label>
        )}

        {error && <p className="error-text">{error}</p>}

        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="button" className="btn btn-primary" onClick={submit}>
            {mode === 'save' ? t('dialog.savePreset') : t('dialog.applyChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}
