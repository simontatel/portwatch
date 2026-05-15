import { recordPortEvents, appendHistory, loadHistory, clearHistory, PortHistoryEntry } from './portHistory';
import { PortSnapshot } from './types';
import * as stateStore from './stateStore';

jest.mock('./stateStore');
jest.mock('./logger', () => ({
  shouldLog: () => false,
  formatMessage: (level: string, msg: string) => `[${level}] ${msg}`,
}));

const mockSaveState = stateStore.saveState as jest.Mock;
const mockLoadState = stateStore.loadState as jest.Mock;

const snap = (port: number, protocol = 'tcp', processName = 'node', pid = 1234): PortSnapshot => ({
  port,
  protocol,
  processName,
  pid,
  state: 'LISTEN',
});

describe('recordPortEvents', () => {
  it('detects newly opened ports', () => {
    const entries = recordPortEvents([snap(3000)], [snap(3000), snap(4000)]);
    expect(entries).toHaveLength(1);
    expect(entries[0].event).toBe('opened');
    expect(entries[0].port).toBe(4000);
  });

  it('detects closed ports', () => {
    const entries = recordPortEvents([snap(3000), snap(5000)], [snap(3000)]);
    expect(entries).toHaveLength(1);
    expect(entries[0].event).toBe('closed');
    expect(entries[0].port).toBe(5000);
  });

  it('returns empty array when no changes', () => {
    const entries = recordPortEvents([snap(3000)], [snap(3000)]);
    expect(entries).toHaveLength(0);
  });

  it('sets a timestamp on each entry', () => {
    const before = Date.now();
    const entries = recordPortEvents([], [snap(8080)]);
    expect(entries[0].timestamp).toBeGreaterThanOrEqual(before);
  });
});

describe('appendHistory', () => {
  beforeEach(() => {
    mockLoadState.mockReturnValue([]);
    mockSaveState.mockClear();
  });

  it('saves combined entries to state', () => {
    const entry: PortHistoryEntry = { timestamp: Date.now(), event: 'opened', port: 3000, protocol: 'tcp', processName: 'node', pid: 1 };
    appendHistory([entry]);
    expect(mockSaveState).toHaveBeenCalledWith('portHistory', [entry]);
  });

  it('trims history to 100 entries', () => {
    const existing = Array.from({ length: 99 }, (_, i) => ({
      timestamp: i, event: 'opened' as const, port: i, protocol: 'tcp', processName: 'x', pid: i,
    }));
    mockLoadState.mockReturnValue(existing);
    const newEntry: PortHistoryEntry = { timestamp: 999, event: 'opened', port: 9999, protocol: 'tcp', processName: 'y', pid: 2 };
    appendHistory([newEntry]);
    const saved = mockSaveState.mock.calls[0][1] as PortHistoryEntry[];
    expect(saved).toHaveLength(100);
  });
});

describe('loadHistory', () => {
  it('returns empty array when state is not an array', () => {
    mockLoadState.mockReturnValue(null);
    expect(loadHistory()).toEqual([]);
  });

  it('returns stored entries', () => {
    const data = [{ timestamp: 1, event: 'closed', port: 80, protocol: 'tcp', processName: 'nginx', pid: 5 }];
    mockLoadState.mockReturnValue(data);
    expect(loadHistory()).toEqual(data);
  });
});
