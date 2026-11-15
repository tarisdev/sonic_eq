import { Monitor, Moon, Sun } from 'lucide-react';
import { eqStore } from '@/store/eqStore';
import { useEqState } from '@/hooks/useEqState';
import { t } from '@/i18n';
import type { ThemeMode } from '@/types';

const NEXT: Record<ThemeMode, ThemeMode> = {
  system: 'dark',
  dark: 'light',
  light: 'system',
};

const ICON: Record<ThemeMode, typeof Moon> = { system: Monitor, dark: Moon, light: Sun };

const NAME_KEY = { system: 'theme.system', dark: 'theme.dark', light: 'theme.light' } as const;

/** Quick switch: icon shows the CURRENT theme, one click cycles system → dark → light. */
export function ThemeToggle() {
  const { state } = useEqState();
  const theme = state.settings.theme;
  const Icon = ICON[theme];
  const label = t('theme.switchTo', { theme: t(NAME_KEY[NEXT[theme]]) });
  return (
    <button
      type="button"
      className="icon-btn"
      title={label}
      aria-label={label}
      onClick={() => eqStore.updateSettings({ theme: NEXT[theme] })}
    >
      <Icon size={15} aria-hidden="true" />
    </button>
  );
}
