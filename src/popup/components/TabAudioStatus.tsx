import { Power } from 'lucide-react';
import type { ActiveTabInfo } from '@/hooks/useActiveTab';
import { t } from '@/i18n';
import { hostFromUrl, isWebUrl } from '@/utils/format';

interface TabAudioStatusProps {
  tab: ActiveTabInfo;
  captured: boolean;
  capturedCount: number;
  busy: boolean;
  onEnable: () => void;
  onDisable: () => void;
}

/**
 * "EQ this tab" control. Capture is only ever started from an explicit click
 * (or the opt-in auto-enable setting) — never automatically.
 */
export function TabAudioStatus({
  tab,
  captured,
  capturedCount,
  busy,
  onEnable,
  onDisable,
}: TabAudioStatusProps) {
  const host = hostFromUrl(tab.url);
  const supported = isWebUrl(tab.url);
  const label = host ?? (tab.url ? tab.url : t('tab.currentTab'));

  const statusText = captured
    ? t('tab.processing')
    : capturedCount > 0
      ? t('tab.otherCaptured', { count: capturedCount })
      : t('tab.notCaptured');

  return (
    <section className="panel tab-status" aria-label={t('tab.sectionTitle')}>
      <div className="row between">
        <span className="domain" title={tab.url ?? undefined}>
          {tab.loading ? t('tab.detecting') : label}
        </span>
        <button
          type="button"
          className={`btn ${captured ? '' : 'btn-primary'}`}
          onClick={captured ? onDisable : onEnable}
          disabled={busy || tab.loading || (!supported && !captured)}
        >
          <Power size={13} aria-hidden="true" />
          {busy ? t('tab.working') : captured ? t('tab.stop') : t('tab.enable')}
        </button>
      </div>
      <p className="muted tiny" style={{ margin: '6px 0 0' }}>
        {supported || captured ? statusText : t('tab.unsupported')}
      </p>
    </section>
  );
}
