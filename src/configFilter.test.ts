import { applyIgnoreFilters, shouldNotify } from './configFilter';
import { PortEntry } from './types';

const makeEntry = (port: number, process: string, proto: 'tcp' | 'udp' = 'tcp'): PortEntry => ({
  port,
  process,
  proto,
  pid: 1234,
});

describe('applyIgnoreFilters', () => {
  it('filters out entries matching ignored ports', () => {
    const entries = [makeEntry(3000, 'node'), makeEntry(5432, 'postgres')];
    const result = applyIgnoreFilters(entries, { ignorePorts: [5432], ignoreProcesses: [] });
    expect(result).toHaveLength(1);
    expect(result[0].port).toBe(3000);
  });

  it('filters out entries matching ignored processes', () => {
    const entries = [makeEntry(3000, 'node'), makeEntry(5432, 'postgres')];
    const result = applyIgnoreFilters(entries, { ignorePorts: [], ignoreProcesses: ['postgres'] });
    expect(result).toHaveLength(1);
    expect(result[0].process).toBe('node');
  });

  it('returns all entries when no filters match', () => {
    const entries = [makeEntry(3000, 'node'), makeEntry(8080, 'nginx')];
    const result = applyIgnoreFilters(entries, { ignorePorts: [], ignoreProcesses: [] });
    expect(result).toHaveLength(2);
  });

  it('handles empty entry list', () => {
    const result = applyIgnoreFilters([], { ignorePorts: [80], ignoreProcesses: ['apache'] });
    expect(result).toHaveLength(0);
  });
});

describe('shouldNotify', () => {
  it('returns true for port not in ignored list', () => {
    expect(shouldNotify(makeEntry(3000, 'node'), { ignorePorts: [80], ignoreProcesses: [] })).toBe(true);
  });

  it('returns false for port in ignored list', () => {
    expect(shouldNotify(makeEntry(80, 'nginx'), { ignorePorts: [80], ignoreProcesses: [] })).toBe(false);
  });

  it('returns false for process in ignored list', () => {
    expect(shouldNotify(makeEntry(5432, 'postgres'), { ignorePorts: [], ignoreProcesses: ['postgres'] })).toBe(false);
  });

  it('returns true when neither port nor process is ignored', () => {
    expect(shouldNotify(makeEntry(4000, 'myapp'), { ignorePorts: [80], ignoreProcesses: ['nginx'] })).toBe(true);
  });
});
