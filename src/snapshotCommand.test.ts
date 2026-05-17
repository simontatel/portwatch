import { runSnapshotCommand } from './snapshotCommand';
import * as daemon from './daemon';
import * as portHistory from './portHistory';
import * as portReport from './portReport';
import * as config from './config';

jest.mock('./daemon');
jest.mock('./portHistory');
jest.mock('./portReport');
jest.mock('./config');

const mockSnapshot = [
  { port: 3000, protocol: 'TCP', pid: 1234, processName: 'node' },
  { port: 5432, protocol: 'TCP', pid: 5678, processName: 'postgres' },
];

const mockConfig = { pollInterval: 5000, ignorePatterns: [], logLevel: 'info' };

const mockReport = {
  totalPorts: 2,
  byProtocol: { TCP: 2 },
  entries: mockSnapshot,
};

beforeEach(() => {
  jest.clearAllMocks();
  (daemon.takeSnapshot as jest.Mock).mockResolvedValue(mockSnapshot);
  (config.loadConfig as jest.Mock).mockResolvedValue(mockConfig);
  (portReport.buildPortReport as jest.Mock).mockReturnValue(mockReport);
  (portReport.formatReportSummary as jest.Mock).mockReturnValue('2 ports active');
  (portHistory.loadHistory as jest.Mock).mockResolvedValue([
    { timestamp: '2024-01-01T00:00:00Z', event: 'opened', port: 3000, processName: 'node' },
  ]);
});

describe('runSnapshotCommand', () => {
  it('prints formatted summary by default', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runSnapshotCommand();
    expect(portReport.buildPortReport).toHaveBeenCalledWith(mockSnapshot, mockConfig);
    expect(portReport.formatReportSummary).toHaveBeenCalledWith(mockReport);
    expect(spy).toHaveBeenCalledWith('2 ports active');
    spy.mockRestore();
  });

  it('prints JSON output when json option is set', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runSnapshotCommand({ json: true });
    const call = spy.mock.calls[0][0];
    const parsed = JSON.parse(call);
    expect(parsed.totalPorts).toBe(2);
    spy.mockRestore();
  });

  it('prints verbose port list when verbose option is set', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runSnapshotCommand({ verbose: true });
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('TCP:3000');
    expect(output).toContain('postgres');
    spy.mockRestore();
  });

  it('prints history when history option is set', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runSnapshotCommand({ history: true });
    const output = spy.mock.calls.map(c => c[0]).join('\n');
    expect(output).toContain('opened');
    expect(output).toContain('3000');
    spy.mockRestore();
  });

  it('prints history as JSON when history + json options are set', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await runSnapshotCommand({ history: true, json: true });
    const call = spy.mock.calls[0][0];
    const parsed = JSON.parse(call);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].event).toBe('opened');
    spy.mockRestore();
  });
});
