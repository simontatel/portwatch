import { formatNotificationBody } from './notifier';
import { PortChange } from './types';

describe('formatNotificationBody', () => {
  it('formats an opened port change', () => {
    const changes: PortChange[] = [
      { type: 'opened', port: 3000, process: 'node' },
    ];
    const result = formatNotificationBody(changes);
    expect(result).toBe('🟢 Port 3000 opened (node)');
  });

  it('formats a closed port change', () => {
    const changes: PortChange[] = [
      { type: 'closed', port: 8080, process: 'nginx' },
    ];
    const result = formatNotificationBody(changes);
    expect(result).toBe('🔴 Port 8080 closed (nginx)');
  });

  it('formats multiple changes', () => {
    const changes: PortChange[] = [
      { type: 'opened', port: 5432, process: 'postgres' },
      { type: 'closed', port: 6379, process: 'redis' },
    ];
    const result = formatNotificationBody(changes);
    expect(result).toContain('🟢 Port 5432 opened (postgres)');
    expect(result).toContain('🔴 Port 6379 closed (redis)');
  });

  it('handles unknown process name', () => {
    const changes: PortChange[] = [
      { type: 'opened', port: 9000, process: undefined },
    ];
    const result = formatNotificationBody(changes);
    expect(result).toBe('🟢 Port 9000 opened (unknown)');
  });

  it('returns empty string for empty changes array', () => {
    const result = formatNotificationBody([]);
    expect(result).toBe('');
  });
});
