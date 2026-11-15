import { useEffect, useState } from 'react';
import { CAPTURED_TABS_KEY, type CapturedTabs } from '@/types';
import { readCapturedTabs, sanitizeCapturedTabs } from '@/utils/storage';

/** Reactive view of chrome.storage.session.capturedTabs (written by the SW). */
export function useCapturedTabs(): CapturedTabs {
  const [captured, setCaptured] = useState<CapturedTabs>({});

  useEffect(() => {
    let cancelled = false;
    void readCapturedTabs().then((tabs) => {
      if (!cancelled) setCaptured(tabs);
    });
    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ): void => {
      if (area !== 'session' || !changes[CAPTURED_TABS_KEY]) return;
      setCaptured(sanitizeCapturedTabs(changes[CAPTURED_TABS_KEY].newValue));
    };
    if (chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener(listener);
    }
    return () => {
      cancelled = true;
      chrome.storage?.onChanged?.removeListener(listener);
    };
  }, []);

  return captured;
}
