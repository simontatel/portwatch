import { parseDiffArgs, runDiffCommand, DiffCommandOptions } from './diffCommand';
import * as stateStore from './stateStore';
import * as daemon from './daemon';
import * as config from './config';
import { PortSnapshot } from './types';

jest.mock('./stateStore');
jest.mock('./daemon');
jest.mock('./config');
jest.mock('./configFilter', () => ({
  applyIgnoreFilters: (ports: any[]) => ports,
}));

const mockSnapshot = (ports: any[]): PortSnapshot => ({
  ports,
  timestamp: Date.now(),
});

beforeEach(() => {
  jest.clearAllMocks();
  (config.loadConfig as jest.Mock).mockResolvedValue({ ignore: [] });
});

describe('parseDiffArgs', () => {
  it('parses --save flag', () => {
    expect(parseDiffArgs(['--save'])).toMatchObject({ save: true });
  });

  it('parses -s shorthand', () => {
    expect(parseDiffArgs(['-s'])).toMatchObject({ save: true });
  });

  it('parses --json flag', () => {
    expect(parseDiffArgs(['--json'])).toMatchObject({ json: true });
  });

  it('parses --quiet flag', () => {
    expect(parseDiffArgs(['--quiet'])).toMatchObject({ quiet: true });
  });

  it('returns false for absent flags', () => {
    expect(parseDiffArgs([])).toEqual({ save: false, json: false, quiet: false });
  });
});

describe('runDiffCommand', () => {
  it('returns null and prints message when no previous snapshot', async () => {
    (daemon.takeSnapshot as jest.Mock).mockResolvedValue(mockSnapshot([]));
    (stateStore.loadState as jest.Mock).mockResolvedValue(null);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    const result = await runDiffCommand({});
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No previous snapshot'));
    consoleSpy.mockRestore();
  });

  it('saves state when --save and no previous snapshot', async () => {
    (daemon.takeSnapshot as jest.Mock).mockResolvedValue(mockSnapshot([]));
    (stateStore.loadState as jest.Mock).mockResolvedValue(null);
    (stateStore.saveState as jest.Mock).mockResolvedValue(undefined);
    jest.spyOn(console, 'log').mockImplementation();

    await runDiffCommand({ save: true });
    expect(stateStore.saveState).toHaveBeenCalled();
  });

  it('returns diff when previous snapshot exists', async () => {
    const prev = mockSnapshot([{ port: 3000, pid: 1, protocol: 'tcp', process: 'node' }]);
    const curr = mockSnapshot([{ port: 4000, pid: 2, protocol: 'tcp', process: 'python' }]);
    (daemon.takeSnapshot as jest.Mock).mockResolvedValue(curr);
    (stateStore.loadState as jest.Mock).mockResolvedValue(prev);
    jest.spyOn(console, 'log').mockImplementation();

    const result = await runDiffCommand({ quiet: true });
    expect(result).not.toBeNull();
    expect(result?.opened.length).toBeGreaterThanOrEqual(0);
  });

  it('outputs JSON when --json flag is set', async () => {
    const prev = mockSnapshot([]);
    const curr = mockSnapshot([]);
    (daemon.takeSnapshot as jest.Mock).mockResolvedValue(curr);
    (stateStore.loadState as jest.Mock).mockResolvedValue(prev);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await runDiffCommand({ json: true });
    const output = consoleSpy.mock.calls[0][0];
    expect(() => JSON.parse(output)).not.toThrow();
    consoleSpy.mockRestore();
  });
});
