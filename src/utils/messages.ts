import type { AnyMessage, EqLiveMessage, VizFrame, VizRequestMessage } from '@/types';

/**
 * Fire a runtime message and resolve `null` when there is no receiver or the
 * call fails. Callers decide whether null is fatal (e.g. the offscreen document
 * is missing while a capture should start) or harmless (e.g. viz polling).
 */
export async function sendMessage<T>(message: AnyMessage): Promise<T | null> {
  try {
    const response = (await chrome.runtime.sendMessage(message)) as T | undefined;
    return response ?? null;
  } catch {
    return null;
  }
}

/** Best-effort broadcast; failures are irrelevant (offscreen applies storage as fallback). */
export function broadcastEqLive(message: EqLiveMessage): void {
  void sendMessage(message);
}

export function broadcastVizRequest(message: VizRequestMessage): Promise<VizFrame | null> {
  return sendMessage<VizFrame>(message);
}

export type { AnyMessage };
