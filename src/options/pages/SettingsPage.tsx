import { Fragment, useEffect, useMemo, useState } from 'react';
import { FileCog, FileUp, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { eqStore } from '@/store/eqStore';
import { useEqState } from '@/hooks/useEqState';
import { useTheme } from '@/hooks/useTheme';
import { pushToast } from '@/hooks/useToast';
import { getAllPresets } from '@/audio/PresetManager';
import { categoryLabel, presetName, t } from '@/i18n';
import type { EQPreset } from '@/types';
import { PresetCard } from '@/popup/components/PresetCard';
import { CustomPresetDialog } from '@/popup/components/CustomPresetDialog';
import { LanguageToggle } from '@/popup/components/LanguageToggle';
import { ThemeToggle } from '@/popup/components/ThemeToggle';
import { ImportExportDialog } from '@/popup/components/ImportExportDialog';
import { ToastNotification } from '@/popup/components/ToastNotification';
import { SettingsPanel } from '@/options/components/SettingsPanel';

type DialogState =
  | { kind: 'save' }
  | { kind: 'edit'; preset: EQPreset }
  | { kind: 'config'; tab: 'export' | 'import' }
  | null;

export function SettingsPage() {
  const { state } = useEqState();
  const [dialog, setDialog] = useState<DialogState>(null);

  useTheme(state.settings.theme);

  useEffect(() => {
    void eqStore.init();
  }, []);

  const presets = useMemo(() => getAllPresets(state.customPresets), [state.customPresets]);

  // User presets first, then built-ins grouped by category (first-appearance order).
  const library = useMemo(() => {
    const custom: EQPreset[] = [];
    const groups = new Map<string, EQPreset[]>();
    for (const preset of presets) {
      if (!preset.isBuiltIn) {
        custom.push(preset);
        continue;
      }
      const items = groups.get(preset.category);
      if (items) items.push(preset);
      else groups.set(preset.category, [preset]);
    }
    return { custom, groups: [...groups] };
  }, [presets]);

  const removePreset = (preset: EQPreset) => {
    const name = presetName(preset);
    if (!window.confirm(t('options.confirmDelete', { name }))) return;
    try {
      eqStore.deletePreset(preset.id);
      pushToast(t('options.deletedToast', { name }), 'success');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : t('options.deleteFailed'), 'error');
    }
  };

  const renderPreset = (preset: EQPreset) => {
    const selected = preset.id === state.eq.activePresetId;
    const favorite = state.favorites.includes(preset.id);
    return (
      <PresetCard
        key={preset.id}
        preset={preset}
        selected={selected}
        favorite={favorite}
        onSelect={() => eqStore.applyPreset(preset.id)}
        onToggleFavorite={() => eqStore.toggleFavorite(preset.id)}
      >
        <button
          type="button"
          className="icon-btn"
          title={t('options.duplicateTitle')}
          aria-label={t('options.duplicateAria', { name: presetName(preset) })}
          onClick={() => eqStore.duplicatePreset(preset.id)}
        >
          <Plus size={14} aria-hidden="true" />
        </button>
        {!preset.isBuiltIn && (
          <>
            <button
              type="button"
              className="icon-btn"
              title={t('options.editTitle')}
              aria-label={t('options.editAria', { name: presetName(preset) })}
              onClick={() => setDialog({ kind: 'edit', preset })}
            >
              <Pencil size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-btn"
              title={t('options.deleteTitle')}
              aria-label={t('options.deleteAria', { name: presetName(preset) })}
              onClick={() => removePreset(preset)}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </>
        )}
        {preset.isBuiltIn && <span className="badge">{t('preset.builtInBadge')}</span>}
      </PresetCard>
    );
  };

  return (
    <div className="page">
      <header className="page-header">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <div>
          <h1 className="page-title">{t('options.title')}</h1>
          <p className="muted small" style={{ margin: 0 }}>
            {t('options.subtitle')}
          </p>
        </div>
        <div className="row" style={{ marginLeft: 'auto', gap: 4 }}>
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      <SettingsPanel />

      <section className="section panel" aria-label={t('options.libraryTitle', { count: presets.length })}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            {t('options.libraryTitle', { count: presets.length })}
          </h2>
          <button type="button" className="btn" onClick={() => setDialog({ kind: 'save' })}>
            <Plus size={14} aria-hidden="true" />
            {t('options.saveCurrentCurve')}
          </button>
        </div>

        <div className="preset-table">
          {library.custom.length > 0 && (
            <>
              <h3 className="lib-group">
                {t('options.groupCustoms')}
                <span className="count">({library.custom.length})</span>
              </h3>
              {library.custom.map(renderPreset)}
            </>
          )}
          {library.groups.map(([category, items]) => (
            <Fragment key={category}>
              <h3 className="lib-group">
                {categoryLabel(category)}
                <span className="count">({items.length})</span>
              </h3>
              {items.map(renderPreset)}
            </Fragment>
          ))}
        </div>
      </section>

      <section className="section panel" aria-label={t('options.dataTitle')}>
        <h2 className="section-title">{t('options.dataTitle')}</h2>
        <p className="muted small" style={{ marginTop: 0 }}>
          {t('options.dataHint', { storage: 'chrome.storage.local' })}
        </p>
        <div className="actions-row">
          <button type="button" className="btn" onClick={() => setDialog({ kind: 'config', tab: 'export' })}>
            <FileCog size={14} aria-hidden="true" />
            {t('options.exportConfig')}
          </button>
          <button type="button" className="btn" onClick={() => setDialog({ kind: 'config', tab: 'import' })}>
            <FileUp size={14} aria-hidden="true" />
            {t('options.importConfig')}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (!window.confirm(t('options.confirmReset'))) return;
              eqStore.resetAll();
              pushToast(t('options.resetDoneToast'), 'success');
            }}
          >
            <RotateCcw size={14} aria-hidden="true" />
            {t('options.resetAll')}
          </button>
        </div>
      </section>

      {dialog?.kind === 'save' && (
        <CustomPresetDialog mode="save" onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'edit' && (
        <CustomPresetDialog mode="edit" preset={dialog.preset} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'config' && (
        <ImportExportDialog kind="config" initialTab={dialog.tab} onClose={() => setDialog(null)} />
      )}

      <ToastNotification />
    </div>
  );
}
