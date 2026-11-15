import type { AppLanguage, Lang } from '@/types';
import { en } from '@/i18n/en';
import { vi } from '@/i18n/vi';
import { CATEGORY_TEXT, PRESET_TEXT } from '@/i18n/presets';

export type I18nKey = keyof typeof en;
export type TParams = Record<string, string | number>;

const catalogs: Record<Lang, Record<I18nKey, string>> = { en, vi };

// The store keeps this in sync with settings.language (see eqStore.init).
let current: Lang = 'en';

export function setLanguage(lang: Lang): void {
  current = lang;
  // Keep <html lang> in sync so assistive tech and font fallbacks follow the UI language.
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
}

export function getLanguage(): Lang {
  return current;
}

/** Maps the stored setting to a concrete catalog ('system' -> browser UI language). */
export function resolveLanguage(setting: AppLanguage): Lang {
  if (setting === 'en' || setting === 'vi') return setting;
  const ui =
    typeof chrome !== 'undefined' && typeof chrome.i18n?.getUILanguage === 'function'
      ? chrome.i18n.getUILanguage()
      : '';
  return ui.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

/** Language the quick switch targets: 'system' resolves first, then EN <-> VI. */
export function nextLanguage(): Lang {
  return current === 'vi' ? 'en' : 'vi';
}

function interpolate(raw: string, params: TParams): string {
  return raw.replace(/\{(\w+)\}/g, (match, name) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

/** Translate. Unknown/missing keys can only come from a catalog bug; they fall back to English. */
export function t(key: I18nKey, params?: TParams): string {
  const raw = catalogs[current][key] || en[key];
  return params ? interpolate(raw, params) : raw;
}

interface PresetLike {
  id: string;
  name: string;
  description: string;
  isBuiltIn: boolean;
}

/** Built-in preset names are translated; custom presets keep the user's own text. */
export function presetName(preset: PresetLike): string {
  return (preset.isBuiltIn ? PRESET_TEXT[current][preset.id]?.name : undefined) || preset.name;
}

export function presetDescription(preset: PresetLike): string {
  return (
    (preset.isBuiltIn ? PRESET_TEXT[current][preset.id]?.description : undefined) ||
    preset.description
  );
}

/** Built-in categories get a translated label; custom categories stay as typed. */
export function categoryLabel(category: string): string {
  return CATEGORY_TEXT[current][category] || category;
}
