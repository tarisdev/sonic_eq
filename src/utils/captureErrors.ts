import { t, type I18nKey } from '@/i18n';

/**
 * Maps low-level capture failures to localized user-facing messages. Known
 * Chrome restrictions (and the English strings other extension contexts may
 * send) are matched and rephrased instead of leaking raw errors.
 */
const RULES: Array<[RegExp, I18nKey]> = [
  [/activeTab|Cannot capture|interacted with/i, 'capture.activeTab'],
  [/No tab with id|no longer exists/i, 'capture.noTab'],
  [
    /cannot be scripted|chrome:\/\/|extension pages|Web Store|cannot be processed/i,
    'capture.protectedPage',
  ],
  [/Receiving end does not exist|was not running|did not respond/i, 'capture.noReceiver'],
  [/expired or capture is no longer available/i, 'capture.expired'],
  [/suspended/i, 'capture.suspended'],
  // The phrases below are our own translations coming back from another context
  // (service worker -> popup), so matching them keeps the result idempotent.
  [/denied audio capture/i, 'capture.denied'],
  [/could not be read/i, 'capture.unreadable'],
  [/aborted by the browser/i, 'capture.aborted'],
  [/does not allow audio capture/i, 'capture.security'],
];

export function describeCaptureError(error: unknown): string {
  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? String((error as { name: unknown }).name)
      : '';
  const raw = (
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown error'
  ).replace(/^Audio capture failed: /, '');

  for (const [pattern, key] of RULES) if (pattern.test(raw)) return t(key);

  switch (name) {
    case 'NotFoundError':
      return t('capture.expired');
    case 'NotAllowedError':
      return t('capture.denied');
    case 'NotReadableError':
      return t('capture.unreadable');
    case 'AbortError':
      return t('capture.aborted');
    case 'SecurityError':
      return t('capture.security');
    default:
      return t('capture.unknown', { raw });
  }
}

