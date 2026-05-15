import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadConfig, mergeConfig, PortwatchConfig } from './config';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

const DEFAULT_EXPECTED: PortwatchConfig = {
  intervalMs: 5000,
  ignoredPorts: [],
  ignoredProcesses: [],
  notifyOnOpen: true,
  notifyOnClose: true,
  logFile: null,
};

describe('mergeConfig', () => {
  it('returns defaults when overrides is empty', () => {
    expect(mergeConfig(DEFAULT_EXPECTED, {})).toEqual(DEFAULT_EXPECTED);
  });

  it('overrides intervalMs with valid positive number', () => {
    const result = mergeConfig(DEFAULT_EXPECTED, { intervalMs: 10000 });
    expect(result.intervalMs).toBe(10000);
  });

  it('ignores intervalMs if non-positive', () => {
    const result = mergeConfig(DEFAULT_EXPECTED, { intervalMs: -1 });
    expect(result.intervalMs).toBe(5000);
  });

  it('overrides ignoredPorts', () => {
    const result = mergeConfig(DEFAULT_EXPECTED, { ignoredPorts: [22, 80] });
    expect(result.ignoredPorts).toEqual([22, 80]);
  });

  it('overrides notifyOnOpen and notifyOnClose', () => {
    const result = mergeConfig(DEFAULT_EXPECTED, {
      notifyOnOpen: false,
      notifyOnClose: false,
    });
    expect(result.notifyOnOpen).toBe(false);
    expect(result.notifyOnClose).toBe(false);
  });

  it('overrides logFile with a string path', () => {
    const result = mergeConfig(DEFAULT_EXPECTED, { logFile: '/tmp/portwatch.log' });
    expect(result.logFile).toBe('/tmp/portwatch.log');
  });
});

describe('loadConfig', () => {
  beforeEach(() => {
    mockedFs.existsSync.mockReturnValue(false);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns defaults when no config file exists', () => {
    expect(loadConfig()).toEqual(DEFAULT_EXPECTED);
  });

  it('loads and merges config from override path', () => {
    const customConfig = { intervalMs: 3000, ignoredPorts: [443] };
    mockedFs.existsSync.mockImplementation((p) => p === '/custom/path.json');
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(customConfig) as any);

    const result = loadConfig('/custom/path.json');
    expect(result.intervalMs).toBe(3000);
    expect(result.ignoredPorts).toEqual([443]);
    expect(result.notifyOnOpen).toBe(true);
  });

  it('falls back to defaults on JSON parse error', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('not-valid-json' as any);
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const result = loadConfig();
    expect(result).toEqual(DEFAULT_EXPECTED);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
