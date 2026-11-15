import { useMemo } from 'react';
import { getAllPresets } from '@/audio/PresetManager';
import { eqStore } from '@/store/eqStore';
import { useEqState } from '@/hooks/useEqState';
import { presetName, t } from '@/i18n';
import { BAND_FREQUENCIES } from '@/types';
import type { AppLanguage, EqRange, ThemeMode } from '@/types';
import { formatDb } from '@/utils/format';
import { PreampControl } from '@/popup/components/PreampControl';
import { Tooltip } from '@/popup/components/Tooltip';
import { EQToggle } from '@/popup/components/EQToggle';
import { EqualizerGraph } from '@/popup/components/EqualizerGraph';
import { EQBandSlider } from '@/popup/components/EQBandSlider';

const RANGES: EqRange[] = [6, 12, 18];

/** All user-facing audio and behaviour settings (options page). */
export function SettingsPanel() {
  const { state } = useEqState();
  const { settings, eq, customPresets } = state;
  const presets = useMemo(() => getAllPresets(customPresets), [customPresets]);

  return (
    <div className="settings-grid">
      <section className="panel" aria-label={t('settings.defaults')}>
        <h2 className="section-title">{t('settings.defaults')}</h2>

        <label className="field">
          <span>{t('settings.defaultPreset')}</span>
          <select
            value={settings.defaultPresetId}
            onChange={(event) => eqStore.updateSettings({ defaultPresetId: event.target.value })}
          >
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {presetName(preset)}
              </option>
            ))}
          </select>
        </label>

        <div className="row between" style={{ marginBottom: 6 }}>
          <span className="field-label">{t('settings.defaultEnabled')}</span>
          <EQToggle
            enabled={settings.defaultEnabled}
            onToggle={() => eqStore.updateSettings({ defaultEnabled: !settings.defaultEnabled })}
            label={t('settings.defaultEnabledAria')}
          />
        </div>
        <p className="muted tiny" style={{ marginTop: 0 }}>
          {t('settings.defaultEnabledHint')}
        </p>

        <label className="field">
          <span>{t('settings.theme')}</span>
          <select
            value={settings.theme}
            onChange={(event) => eqStore.updateSettings({ theme: event.target.value as ThemeMode })}
          >
            <option value="dark">{t('theme.dark')}</option>
            <option value="light">{t('theme.light')}</option>
            <option value="system">{t('theme.system')}</option>
          </select>
        </label>

        <label className="field">
          <span>{t('settings.language')}</span>
          <select
            value={settings.language}
            onChange={(event) =>
              eqStore.updateSettings({ language: event.target.value as AppLanguage })
            }
          >
            <option value="system">{t('lang.system')}</option>
            <option value="en">{t('lang.en')}</option>
            <option value="vi">{t('lang.vi')}</option>
          </select>
        </label>

        <div className="row between">
          <span className="field-label">{t('settings.compact')}</span>
          <EQToggle
            enabled={settings.compact}
            onToggle={() => eqStore.updateSettings({ compact: !settings.compact })}
            label={t('settings.compactAria')}
          />
        </div>
      </section>

      <section className="panel" aria-label={t('settings.audio')}>
        <h2 className="section-title">{t('settings.audio')}</h2>

        <label className="field">
          <span>{t('settings.bandRange')}</span>
          <select
            value={settings.eqRange}
            onChange={(event) =>
              eqStore.updateSettings({ eqRange: Number(event.target.value) as EqRange })
            }
          >
            {RANGES.map((range) => (
              <option key={range} value={range}>
                ±{range} dB
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="row between">
            <span className="row" style={{ gap: 6 }}>
              <span>{t('settings.qFactor')}</span>
              <Tooltip text={t('settings.qFactorTip')} />
            </span>
            <span className="muted">{settings.qFactor.toFixed(2)}</span>
          </span>
          <input
            type="range"
            min={0.3}
            max={5}
            step={0.1}
            value={settings.qFactor}
            aria-label={t('settings.qFactor')}
            onChange={(event) => eqStore.updateSettings({ qFactor: Number(event.target.value) })}
          />
        </label>

        <label className="field">
          <span className="row between">
            <span className="row" style={{ gap: 6 }}>
              <span>{t('settings.smoothing')}</span>
              <Tooltip text={t('settings.smoothingTip')} />
            </span>
            <span className="muted">{Math.round(settings.smoothing * 1000)} ms</span>
          </span>
          <input
            type="range"
            min={5}
            max={500}
            step={5}
            value={Math.round(settings.smoothing * 1000)}
            aria-label={t('settings.smoothing')}
            onChange={(event) =>
              eqStore.updateSettings({ smoothing: Number(event.target.value) / 1000 })
            }
          />
        </label>

        <div className="row between" style={{ marginBottom: 10 }}>
          <span className="row" style={{ gap: 6 }}>
            <span className="field-label">{t('settings.limiter')}</span>
            <Tooltip text={t('settings.limiterTip')} />
          </span>
          <EQToggle
            enabled={settings.limiter}
            onToggle={() => eqStore.updateSettings({ limiter: !settings.limiter })}
            label={t('settings.limiter')}
          />
        </div>

        <PreampControl
          preamp={eq.preamp}
          disabled={!eq.enabled}
          onChange={(value) => eqStore.setPreamp(value)}
        />

        <div className="row between">
          <span className="field-label">{t('settings.viz')}</span>
          <EQToggle
            enabled={settings.visualization}
            onToggle={() => eqStore.updateSettings({ visualization: !settings.visualization })}
            label={t('viz.title')}
          />
        </div>

        <p className="muted tiny" style={{ marginBottom: 0 }}>
          {t('settings.clipHint', { preamp: formatDb(eq.preamp) })}
        </p>
      </section>

      <section className="panel" aria-label={t('settings.behaviour')}>
        <h2 className="section-title">{t('settings.behaviour')}</h2>

        <div className="row between" style={{ marginBottom: 6 }}>
          <span className="row" style={{ gap: 6 }}>
            <span className="field-label">{t('settings.autoEnable')}</span>
            <Tooltip text={t('settings.autoEnableTip')} />
          </span>
          <EQToggle
            enabled={settings.autoEnableNewTabs}
            onToggle={() =>
              eqStore.updateSettings({ autoEnableNewTabs: !settings.autoEnableNewTabs })
            }
            label={t('settings.autoEnableAria')}
          />
        </div>
        <p className="muted tiny" style={{ margin: 0 }}>
          {t('settings.autoEnableHint')}
        </p>
      </section>

      <section className="panel panel-wide" aria-label={t('band.sectionTitle')}>
        <h2 className="section-title">{t('band.sectionTitle')}</h2>
        <p className="muted tiny" style={{ marginTop: 0 }}>
          {eq.enabled ? t('preset.customHint') : t('settings.curveBypassedHint')}
        </p>
        <EqualizerGraph gains={eq.gains} qFactor={settings.qFactor} range={settings.eqRange} enabled />
        <div className="bands">
          {BAND_FREQUENCIES.map((frequency, index) => (
            <EQBandSlider
              key={frequency}
              frequency={frequency}
              value={eq.gains[index] ?? 0}
              range={settings.eqRange}
              onChange={(value) => eqStore.setGain(index, value)}
              onReset={() => eqStore.resetBand(index)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
