import { startDaemon } from './daemon';
import * as portScanner from './portScanner';
import * as notifier from './notifier';

jest.mock('child_process', () => ({
  execSync: jest.fn(() => ''),
}));
jest.mock('./portScanner');
jest.mock('./notifier');

const mockParseLsof = portScanner.parseLsofOutput as jest.Mock;
const mockDiff = portScanner.diffPortSnapshots as jest.Mock;
const mockSendNotification = notifier.sendNotification as jest.Mock;

describe('startDaemon', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockParseLsof.mockReturnValue([]);
    mockDiff.mockReturnValue([]);
    mockSendNotification.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns a stop function', () => {
    const stop = startDaemon({ intervalMs: 1000 });
    expect(typeof stop).toBe('function');
    stop();
  });

  it('does not notify when no changes are detected', () => {
    mockDiff.mockReturnValue([]);
    const stop = startDaemon({ intervalMs: 1000 });
    jest.advanceTimersByTime(2000);
    expect(mockSendNotification).not.toHaveBeenCalled();
    stop();
  });

  it('sends notification when changes are detected', () => {
    mockDiff.mockReturnValue([
      { type: 'opened', port: 3000, process: 'node' },
    ]);
    const stop = startDaemon({ intervalMs: 1000 });
    jest.advanceTimersByTime(1000);
    expect(mockSendNotification).toHaveBeenCalledTimes(1);
    stop();
  });

  it('filters ignored ports', () => {
    mockDiff.mockReturnValue([
      { type: 'opened', port: 8080, process: 'nginx' },
    ]);
    const stop = startDaemon({ intervalMs: 1000, ignorePorts: [8080] });
    jest.advanceTimersByTime(1000);
    expect(mockSendNotification).not.toHaveBeenCalled();
    stop();
  });
});
