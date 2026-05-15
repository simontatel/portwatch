import {
  isThrottled,
  recordAlert,
  getAlertCount,
  clearThrottleState,
  getThrottleKey,
} from './alertThrottle';
import { PortEvent } from './types';

const makeEvent = (port: number, type: 'opened' | 'closed' = 'opened'): PortEvent => ({
  type,
  port,
  protocol: 'tcp',
  pid: 1234,
  process: 'node',
  timestamp: Date.now(),
});

beforeEach(() => {
  clearThrottleState();
});

describe('getThrottleKey', () => {
  it('produces a stable key from event fields', () => {
    const event = makeEvent(3000);
    expect(getThrottleKey(event)).toBe('opened:3000:tcp');
  });

  it('differentiates opened vs closed events on the same port', () => {
    expect(getThrottleKey(makeEvent(3000, 'opened'))).not.toBe(
      getThrottleKey(makeEvent(3000, 'closed'))
    );
  });
});

describe('isThrottled', () => {
  it('returns false when no alert has been recorded', () => {
    expect(isThrottled(makeEvent(3000), 60_000)).toBe(false);
  });

  it('returns true when within cooldown window', () => {
    const now = Date.now();
    const event = makeEvent(3000);
    recordAlert(event, now);
    expect(isThrottled(event, 60_000, now + 30_000)).toBe(true);
  });

  it('returns false when cooldown window has passed', () => {
    const now = Date.now();
    const event = makeEvent(3000);
    recordAlert(event, now);
    expect(isThrottled(event, 60_000, now + 61_000)).toBe(false);
  });
});

describe('recordAlert', () => {
  it('increments count on repeated alerts', () => {
    const event = makeEvent(8080);
    recordAlert(event);
    recordAlert(event);
    recordAlert(event);
    expect(getAlertCount(event)).toBe(3);
  });

  it('tracks separate counts for different events', () => {
    recordAlert(makeEvent(3000, 'opened'));
    recordAlert(makeEvent(3000, 'closed'));
    recordAlert(makeEvent(3000, 'closed'));
    expect(getAlertCount(makeEvent(3000, 'opened'))).toBe(1);
    expect(getAlertCount(makeEvent(3000, 'closed'))).toBe(2);
  });
});

describe('clearThrottleState', () => {
  it('resets all throttle entries', () => {
    const event = makeEvent(5000);
    recordAlert(event);
    clearThrottleState();
    expect(isThrottled(event, 60_000)).toBe(false);
    expect(getAlertCount(event)).toBe(0);
  });
});
