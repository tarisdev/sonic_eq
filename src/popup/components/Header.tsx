import { Settings } from 'lucide-react';
import { t } from '@/i18n';
import { EQToggle } from '@/popup/components/EQToggle';
import { LanguageToggle } from '@/popup/components/LanguageToggle';
import { ThemeToggle } from '@/popup/components/ThemeToggle';

export type EngineStatus = 'off' | 'processing' | 'waiting';

interface HeaderProps {
  enabled: boolean;
  status: EngineStatus;
  onToggle: () => void;
  onOpenSettings: () => void;
}

const STATUS_KEY = {
  off: 'header.statusOff',
  processing: 'header.statusProcessing',
  waiting: 'header.statusWaiting',
} as const;

export function Header({ enabled, status, onToggle, onOpenSettings }: HeaderProps) {
  const statusClass = status === 'off' ? '' : status === 'processing' ? ' on' : ' warn';
  const statusLabel = t(STATUS_KEY[status]);
  return (
    <header className="header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>
          <h1 className="brand-name">SonicEQ</h1>
          <span className="brand-sub">{t('header.tagline')}</span>
        </span>
      </div>
      <div className="header-actions">
        <span className={`status-pill${statusClass}`} title={statusLabel}>
          <span className="dot" aria-hidden="true" />
          {statusLabel}
        </span>
        <EQToggle enabled={enabled} onToggle={onToggle} label={t('header.equalizer')} />
        <LanguageToggle />
        <ThemeToggle />
        <button
          type="button"
          className="icon-btn"
          onClick={onOpenSettings}
          aria-label={t('header.openSettings')}
          title={t('header.settingsTitle')}
        >
          <Settings size={15} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

