import { diffPortSnapshots, PortEntry } from './portScanner';

describe('diffPortSnapshots', () => {
  const makeEntry = (port: number, protocol: 'tcp' | 'udp' = 'tcp', process = 'node'): PortEntry => ({
    port,
    pid: 1000 + port,
    protocol,
    process,
  });

  it('returns empty arrays when snapshots are identical', () => {
    const snapshot = [makeEntry(3000), makeEntry(8080)];
    const { opened, closed } = diffPortSnapshots(snapshot, snapshot);
    expect(opened).toHaveLength(0);
    expect(closed).toHaveLength(0);
  });

  it('detects newly opened ports', () => {
    const previous = [makeEntry(3000)];
    const current = [makeEntry(3000), makeEntry(8080)];
    const { opened, closed } = diffPortSnapshots(previous, current);
    expect(opened).toHaveLength(1);
    expect(opened[0].port).toBe(8080);
    expect(closed).toHaveLength(0);
  });

  it('detects closed ports', () => {
    const previous = [makeEntry(3000), makeEntry(8080)];
    const current = [makeEntry(3000)];
    const { opened, closed } = diffPortSnapshots(previous, current);
    expect(closed).toHaveLength(1);
    expect(closed[0].port).toBe(8080);
    expect(opened).toHaveLength(0);
  });

  it('handles both opened and closed ports simultaneously', () => {
    const previous = [makeEntry(3000), makeEntry(5000)];
    const current = [makeEntry(3000), makeEntry(9000)];
    const { opened, closed } = diffPortSnapshots(previous, current);
    expect(opened).toHaveLength(1);
    expect(opened[0].port).toBe(9000);
    expect(closed).toHaveLength(1);
    expect(closed[0].port).toBe(5000);
  });

  it('distinguishes tcp and udp on the same port number', () => {
    const previous = [makeEntry(53, 'tcp')];
    const current = [makeEntry(53, 'tcp'), makeEntry(53, 'udp')];
    const { opened, closed } = diffPortSnapshots(previous, current);
    expect(opened).toHaveLength(1);
    expect(opened[0].protocol).toBe('udp');
    expect(closed).toHaveLength(0);
  });

  it('returns empty arrays when both snapshots are empty', () => {
    const { opened, closed } = diffPortSnapshots([], []);
    expect(opened).toHaveLength(0);
    expect(closed).toHaveLength(0);
  });
});
