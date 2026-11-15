import { useSyncExternalStore } from 'react';
import { eqStore } from '@/store/eqStore';

/** Live view of persisted EQ state + settings. */
export function useEqState() {
  const state = useSyncExternalStore(eqStore.subscribe, eqStore.getSnapshot);
  return { state, loaded: eqStore.isLoaded() };
}
