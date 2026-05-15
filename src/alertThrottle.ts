import { PortEvent } from './types';

interface ThrottleEntry {
  lastAlertedAt: number;
  count: number;
}

const throttleMap = new Map<string, ThrottleEntry>();

/**
 * Returns a stable key for a port event used in throttle tracking.
 */
export function getThrottleKey(event: PortEvent): string {
  return `${event.type}:${event.port}:${event.protocol}`;
}

/**
 * Returns true if the event should be suppressed based on throttle rules.
 * @param event       The port event to check.
 * @param cooldownMs  Minimum milliseconds between repeated alerts for the same key.
 */
export function isThrottled(
  event: PortEvent,
  cooldownMs: number,
  nowMs: number = Date.now()
): boolean {
  const key = getThrottleKey(event);
  const entry = throttleMap.get(key);
  if (!entry) return false;
  return nowMs - entry.lastAlertedAt < cooldownMs;
}

/**
 * Records that an alert was sent for the given event.
 */
export function recordAlert(
  event: PortEvent,
  nowMs: number = Date.now()
): void {
  const key = getThrottleKey(event);
  const existing = throttleMap.get(key);
  throttleMap.set(key, {
    lastAlertedAt: nowMs,
    count: existing ? existing.count + 1 : 1,
  });
}

/**
 * Returns how many times an alert has fired for the given event key.
 */
export function getAlertCount(event: PortEvent): number {
  return throttleMap.get(getThrottleKey(event))?.count ?? 0;
}

/**
 * Clears all throttle state (useful for testing or daemon restart).
 */
export function clearThrottleState(): void {
  throttleMap.clear();
}
