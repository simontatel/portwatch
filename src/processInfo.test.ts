import { formatProcessLabel } from './processInfo';
import { ProcessDetails } from './types';

const makeDetails = (command: string, args: string, pid = 42): ProcessDetails => ({
  pid,
  command,
  args,
});

describe('formatProcessLabel', () => {
  it('returns fallback when details are null', () => {
    expect(formatProcessLabel(null, 'unknown')).toBe('unknown');
  });

  it('returns command when args are empty', () => {
    const details = makeDetails('node', '');
    expect(formatProcessLabel(details, 'fallback')).toBe('node');
  });

  it('includes args when present', () => {
    const details = makeDetails('node', 'server.js');
    expect(formatProcessLabel(details, 'fallback')).toBe('node (server.js)');
  });

  it('truncates long args to 40 chars with ellipsis', () => {
    const longArgs = 'a'.repeat(50);
    const details = makeDetails('python', longArgs);
    const label = formatProcessLabel(details, 'fallback');
    expect(label).toContain('…');
    expect(label.length).toBeLessThan(60);
  });

  it('does not truncate args exactly 40 chars', () => {
    const args = 'b'.repeat(40);
    const details = makeDetails('ruby', args);
    const label = formatProcessLabel(details, 'fallback');
    expect(label).toBe(`ruby (${args})`);
    expect(label).not.toContain('…');
  });
});
