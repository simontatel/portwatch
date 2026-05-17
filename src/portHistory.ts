import { PortSnapshot } from './types';
import { loadState, saveState } from './stateStore';
import { shouldLog, formatMessage } from './logger';

const HISTORY_KEY = 'portHistory';
const MAX_HISTORY_ENTRIES = 100;

export interface PortHistoryEntry {
  timestamp: number;
  event: 'opened' | 'closed';
  port: number;
  protocol: string;
  processName: string;
  pid: number;
}

export function recordPortEvents(
  previousSnapshot: PortSnapshot[],
  currentSnapshot: PortSnapshot[]
): PortHistoryEntry[] {
  const now = Date.now();
  const entries: PortHistoryEntry[] = [];

  const prevPorts = new Set(previousSnapshot.map((s) => `${s.port}/${s.protocol}`));
  const currPorts = new Set(currentSnapshot.map((s) => `${s.port}/${s.protocol}`));

  for (const snap of currentSnapshot) {
    if (!prevPorts.has(`${snap.port}/${snap.protocol}`)) {
      entries.push({
        timestamp: now,
        event: 'opened',
        port: snap.port,
        protocol: snap.protocol,
        processName: snap.processName,
        pid: snap.pid,
      });
    }
  }

  for (const snap of previousSnapshot) {
    if (!currPorts.has(`${snap.port}/${snap.protocol}`)) {
      entries.push({
        timestamp: now,
        event: 'closed',
        port: snap.port,
        protocol: snap.protocol,
        processName: snap.processName,
        pid: snap.pid,
      });
    }
  }

  return entries;
}

export function appendHistory(newEntries: PortHistoryEntry[]): void {
  const existing = loadHistory();
  const combined = [...existing, ...newEntries];
  const trimmed = combined.slice(-MAX_HISTORY_ENTRIES);
  saveState(HISTORY_KEY, trimmed);
  if (shouldLog('debug')) {
    console.debug(formatMessage('debug', `Appended ${newEntries.length} history entries`));
  }
}

export function loadHistory(): PortHistoryEntry[] {
  const data = loadState(HISTORY_KEY);
  if (!Array.isArray(data)) return [];
  return data as PortHistoryEntry[];
}

export function clearHistory(): void {
  saveState(HISTORY_KEY, []);
}

/**
 * Returns history entries filtered by event type and/or port number.
 * Useful for querying specific open/close events or tracking a single port.
 */
export function queryHistory(
  filters: { event?: 'opened' | 'closed'; port?: number }
): PortHistoryEntry[] {
  const history = loadHistory();
  return history.filter((entry) => {
    if (filters.event !== undefined && entry.event !== filters.event) return false;
    if (filters.port !== undefined && entry.port !== filters.port) return false;
    return true;
  });
}
