import { useEffect } from 'react';
import type { ThemeMode } from '@/types';

/** Applies the theme to <html data-theme>; follows the OS for 'system'. */
function applyTheme(mode: ThemeMode): () => void {
  const query = window.matchMedia('(prefers-color-scheme: light)');
  const set = (): void => {
    const resolved = mode === 'system' ? (query.matches ? 'light' : 'dark') : mode;
    document.documentElement.dataset.theme = resolved;
  };
  set();
  if (mode !== 'system') return () => undefined;
  query.addEventListener('change', set);
  return () => query.removeEventListener('change', set);
}

export function useTheme(mode: ThemeMode): void {
  useEffect(() => applyTheme(mode), [mode]);
}
