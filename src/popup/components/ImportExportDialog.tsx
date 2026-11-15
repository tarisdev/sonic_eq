import { useState } from 'react';
import {
  exportConfigJson,
  exportPresetJson,
  findPreset,
  parseConfigJson,
  parsePresetJson,
} from '@/audio/PresetManager';
import { eqStore } from '@/store/eqStore';
import { t } from '@/i18n';
import { pushToast } from '@/hooks/useToast';
import { downloadJson, slugify } from '@/utils/download';

interface ImportExportDialogProps {
  kind: 'preset' | 'config';
  initialTab?: 'export' | 'import';
  onClose: () => void;
}

/**
 * Export/import for a single preset (popup) or the whole configuration
 * (options page). Imported files are validated before anything is applied.
 */
export function ImportExportDialog({ kind, initialTab = 'export', onClose }: ImportExportDialogProps) {
  const [tab, setTab] = useState<'export' | 'import'>(initialTab);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const exportJson = (): string => {
    const state = eqStore.getSnapshot();
    if (kind === 'config') return exportConfigJson(state);
    const preset = findPreset(state.eq.activePresetId, state.customPresets);
    if (!preset) return '';
    return exportPresetJson(preset);
  };

  const json = exportJson();
  const filename = kind === 'config' ? 'soniceq-config.json' : `${slugify(findActiveName())}.json`;

  function findActiveName(): string {
    const state = eqStore.getSnapshot();
    return findPreset(state.eq.activePresetId, state.customPresets)?.name ?? 'preset';
  }

  const applyImport = () => {
    setError(null);
    if (kind === 'preset') {
      const result = parsePresetJson(text);
      if (!result.ok || !result.preset) {
        setError(result.error ?? t('io.invalidPresetFile'));
        return;
      }
      eqStore.addImportedPreset(result.preset);
      pushToast(t('io.presetImported', { name: result.preset.name }), 'success');
    } else {
      const result = parseConfigJson(text);
      if (!result.ok || !result.state) {
        setError(result.error ?? t('io.invalidConfigFile'));
        return;
      }
      eqStore.importConfig(result.state);
      pushToast(t('io.configImported'), 'success');
    }
    onClose();
  };

  const readFile = async (file: File | undefined) => {
    if (!file) return;
    setText(await file.text());
    setError(null);
  };

  return (
    <div className="backdrop" role="dialog" aria-modal="true" aria-label={t('io.dialogAria')}>
      <div className="dialog">
        <div className="dialog-head">
          <h2>
            {kind === 'config' ? t('io.titleConfig') : t('io.titlePreset')}
          </h2>
          <div className="row" style={{ gap: 4 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setTab('export')}
              aria-pressed={tab === 'export'}
            >
              {t('common.export')}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setTab('import')}
              aria-pressed={tab === 'import'}
            >
              {t('common.import')}
            </button>
          </div>
        </div>

        {tab === 'export' ? (
          <>
            <label className="field">
              <span>{t('io.jsonLabel')}</span>
              <textarea rows={9} readOnly value={json} aria-label={t('io.exportedJsonAria')} />
            </label>
            <div className="dialog-actions">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  void navigator.clipboard.writeText(json).then(
                    () => pushToast(t('io.copied'), 'success'),
                    () => pushToast(t('io.clipboardDenied'), 'error'),
                  );
                }}
              >
                {t('io.copy')}
              </button>
              <button type="button" className="btn btn-primary" onClick={() => downloadJson(filename, json)}>
                {t('io.download', { filename })}
              </button>
            </div>
          </>
        ) : (
          <>
            <label className="field">
              <span>{t('io.pasteLabel')}</span>
              <textarea
                rows={9}
                value={text}
                onChange={(event) => setText(event.target.value)}
                aria-label={t('io.jsonToImportAria')}
              />
            </label>
            <input type="file" accept="application/json,.json" onChange={(event) => void readFile(event.target.files?.[0])} />
            {error && <p className="error-text">{error}</p>}
            <div className="dialog-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                {t('common.cancel')}
              </button>
              <button type="button" className="btn btn-primary" onClick={applyImport} disabled={!text.trim()}>
                {t('common.import')}
              </button>
            </div>
          </>
        )}

        {tab === 'export' && (
          <div className="dialog-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t('common.close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
