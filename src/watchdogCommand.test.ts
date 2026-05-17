import { parseWatchdogArgs, WatchdogOptions } from './watchdogCommand';

describe('parseWatchdogArgs', () => {
  it('returns empty options for empty args', () => {
    const result = parseWatchdogArgs([]);
    expect(result).toEqual({});
  });

  it('parses --interval flag', () => {
    const result = parseWatchdogArgs(['--interval', '10']);
    expect(result.interval).toBe(10);
  });

  it('parses -i shorthand for interval', () => {
    const result = parseWatchdogArgs(['-i', '30']);
    expect(result.interval).toBe(30);
  });

  it('ignores invalid interval value', () => {
    const result = parseWatchdogArgs(['--interval', 'abc']);
    expect(result.interval).toBeUndefined();
  });

  it('ignores non-positive interval value', () => {
    const result = parseWatchdogArgs(['--interval', '0']);
    expect(result.interval).toBeUndefined();
  });

  it('parses --reset flag', () => {
    const result = parseWatchdogArgs(['--reset']);
    expect(result.reset).toBe(true);
  });

  it('parses --verbose flag', () => {
    const result = parseWatchdogArgs(['--verbose']);
    expect(result.verbose).toBe(true);
  });

  it('parses -v shorthand for verbose', () => {
    const result = parseWatchdogArgs(['-v']);
    expect(result.verbose).toBe(true);
  });

  it('parses --config flag', () => {
    const result = parseWatchdogArgs(['--config', '/path/to/config.json']);
    expect(result.configPath).toBe('/path/to/config.json');
  });

  it('parses -c shorthand for config', () => {
    const result = parseWatchdogArgs(['-c', './my-config.json']);
    expect(result.configPath).toBe('./my-config.json');
  });

  it('parses multiple flags together', () => {
    const result = parseWatchdogArgs(['--reset', '--verbose', '--interval', '15', '--config', 'cfg.json']);
    expect(result).toEqual<WatchdogOptions>({
      reset: true,
      verbose: true,
      interval: 15,
      configPath: 'cfg.json',
    });
  });
});
