import { useCallback, useEffect, useState } from 'react';
import { Power, RotateCcw, Settings as SettingsIcon } from 'lucide-react';
import { BAND_FREQUENCIES, type CaptureResult } from '@/types';
import { eqStore } from '@/store/eqStore';
import { useEqState } from '@/hooks/useEqState';
import { useActiveTab } from '@/hooks/useActiveTab';
import { useCapturedTabs } from '@/hooks/useCapturedTabs';
import { useTheme } from '@/hooks/useTheme';
import { pushToast } from '@/hooks/useToast';
import { t } from '@/i18n';
import { sendMessage } from '@/utils/messages';
import { describeCaptureError } from '@/utils/captureErrors';
import { Header, type EngineStatus } from '@/popup/components/Header';
import { TabAudioStatus } from '@/popup/components/TabAudioStatus';
import { PresetSelector } from '@/popup/components/PresetSelector';
import { EqualizerGraph } from '@/popup/components/EqualizerGraph';
import { EQBandSlider } from '@/popup/components/EQBandSlider';
import { PreampControl } from '@/popup/components/PreampControl';
import { AudioVisualizer } from '@/popup/components/AudioVisualizer';
import { CustomPresetDialog } from '@/popup/components/CustomPresetDialog';
import { ImportExportDialog } from '@/popup/components/ImportExportDialog';
import { ToastNotification } from '@/popup/components/ToastNotification';

type DialogState = 'save' | 'import' | 'export' | null;

export function App() {
  const { state } = useEqState();
  const tab = useActiveTab();
  const captured = useCapturedTabs();
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  useTheme(state.settings.theme);

  useEffect(() => {
    void eqStore.init();
  }, []);

  // Popups are destroyed without a reliable unmount hook: flush pending writes.
  useEffect(() => {
    const flush = () => eqStore.flush();
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);

  const capturedCount = Object.keys(captured).length;
  const isCaptured = tab.tabId !== null && Boolean(captured[String(tab.tabId)]);

  const enable = useCallback(async () => {
    if (tab.tabId === null) {
      pushToast(t('app.noActiveTab'), 'error');
      return;
    }
    setBusy(true);
    try {
      // Requires the user gesture from opening the popup (activeTab).
      const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.tabId });
      const result = await sendMessage<CaptureResult>({
        type: 'START_CAPTURE',
        tabId: tab.tabId,
        streamId,
        url: tab.url,
      });
      if (result?.ok) {
        pushToast(t('app.enabledToast'), 'success');
        // Warning codes and error text come from other contexts: re-map them so
        // they are shown in the UI language.
        if (result.warning) pushToast(describeCaptureError(result.warning), 'error');
      } else {
        pushToast(result?.error ? describeCaptureError(result.error) : t('app.startFailed'), 'error');
      }
    } catch (error) {
      pushToast(describeCaptureError(error), 'error');
    } finally {
      setBusy(false);
    }
  }, [tab.tabId, tab.url]);

  const disable = useCallback(async () => {
    if (tab.tabId === null) return;
    setBusy(true);
    try {
      const result = await sendMessage<CaptureResult>({ type: 'STOP_CAPTURE', tabId: tab.tabId });
      if (result?.ok) pushToast(t('app.stoppedToast'), 'success');
      else {
        pushToast(result?.error ? describeCaptureError(result.error) : t('app.stopFailed'), 'error');
      }
    } finally {
      setBusy(false);
    }
  }, [tab.tabId]);

  const status: EngineStatus = !state.eq.enabled
    ? 'off'
    : capturedCount > 0
      ? 'processing'
      : 'waiting';

  const openSettings = () => {
    void chrome.runtime.openOptionsPage();
  };


  return (
    <div className={state.settings.compact ? 'compact' : undefined}>
      <Header
        enabled={state.eq.enabled}
        status={status}
        onToggle={() => eqStore.toggleEnabled()}
        onOpenSettings={openSettings}
      />
      <div className="app-body">
        <TabAudioStatus
          tab={tab}
          captured={isCaptured}
          capturedCount={capturedCount}
          busy={busy}
          onEnable={() => void enable()}
          onDisable={() => void disable()}
        />

        <PresetSelector
          state={state}
          onSelect={(id) => eqStore.applyPreset(id)}
          onToggleFavorite={(id) => eqStore.toggleFavorite(id)}
          onResetEq={() => {
            eqStore.resetEq();
            pushToast(t('app.eqResetToast'), 'info');
          }}
          onSaveAs={() => setDialog('save')}
          onExport={() => setDialog('export')}
          onImport={() => setDialog('import')}
        />

        <EqualizerGraph
          gains={state.eq.gains}
          qFactor={state.settings.qFactor}
          range={state.settings.eqRange}
          enabled={state.eq.enabled}
        />

        <section className="panel" aria-label={t('band.sectionTitle')}>
          <div className="bands">
            {BAND_FREQUENCIES.map((frequency, index) => (
              <EQBandSlider
                key={frequency}
                frequency={frequency}
                value={state.eq.gains[index] ?? 0}
                range={state.settings.eqRange}
                disabled={!state.eq.enabled}
                onChange={(value) => eqStore.setGain(index, value)}
                onReset={() => eqStore.resetBand(index)}
              />
            ))}
          </div>
        </section>

        <PreampControl
          preamp={state.eq.preamp}
          disabled={!state.eq.enabled}
          onChange={(value) => eqStore.setPreamp(value)}
        />

        <AudioVisualizer enabled={state.settings.visualization} activeCaptures={capturedCount} />
      </div>

      <footer className="footer">
        <button type="button" className="btn" onClick={() => eqStore.toggleEnabled()}>
          <Power size={13} aria-hidden="true" />
          {state.eq.enabled ? t('app.footerOn') : t('app.footerOff')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => eqStore.resetEq()}>
          <RotateCcw size={13} aria-hidden="true" />
          {t('common.reset')}
        </button>
        <span className="muted tiny footer-meta">
          {capturedCount === 0
            ? t('app.footerNoCapture')
            : t('app.footerCaptured', { count: capturedCount })}
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={openSettings}
          aria-label={t('header.openSettings')}
        >
          <SettingsIcon size={15} aria-hidden="true" />
        </button>
      </footer>

      {dialog === 'save' && <CustomPresetDialog mode="save" onClose={() => setDialog(null)} />}
      {dialog === 'export' && (
        <ImportExportDialog kind="preset" initialTab="export" onClose={() => setDialog(null)} />
      )}
      {dialog === 'import' && (
        <ImportExportDialog kind="preset" initialTab="import" onClose={() => setDialog(null)} />
      )}

      <ToastNotification />
    </div>
  );
}
