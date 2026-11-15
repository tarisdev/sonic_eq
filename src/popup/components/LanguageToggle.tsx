import type { CSSProperties } from 'react';
import { eqStore } from '@/store/eqStore';
import { nextLanguage, t } from '@/i18n';

interface LanguageToggleProps {
  style?: CSSProperties;
}

/** Quick switch: shows the language it switches TO — "EN" while the UI is Vietnamese. */
export function LanguageToggle({ style }: LanguageToggleProps) {
  const target = nextLanguage();
  const label = t('lang.switchTo', {
    language: t(target === 'vi' ? 'lang.vi' : 'lang.en'),
  });
  return (
    <button
      type="button"
      className="icon-btn lang-btn"
      style={style}
      title={label}
      aria-label={label}
      onClick={() => eqStore.updateSettings({ language: target })}
    >
      {target.toUpperCase()}
    </button>
  );
}