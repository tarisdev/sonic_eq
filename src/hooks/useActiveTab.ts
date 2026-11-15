import { useEffect, useState } from 'react';

export interface ActiveTabInfo {
  tabId: number | null;
  url: string | null;
  title: string | null;
  loading: boolean;
}

/**
 * The tab the popup was opened on. Opening the popup grants activeTab, which is
 * what lets us read its url and ask tabCapture for a stream id.
 */
export function useActiveTab(): ActiveTabInfo {
  const [tab, setTab] = useState<ActiveTabInfo>({
    tabId: null,
    url: null,
    title: null,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (cancelled) return;
        setTab({
          tabId: active?.id ?? null,
          url: active?.url ?? null,
          title: active?.title ?? null,
          loading: false,
        });
      } catch {
        if (!cancelled) setTab({ tabId: null, url: null, title: null, loading: false });
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return tab;
}
