import { logger, setLogLevel, getLogLevel } from './logger';

describe('logger', () => {
  let debugSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
    infoSpy  = jest.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy  = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    setLogLevel('debug');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setLogLevel('info');
  });

  test('getLogLevel returns current level', () => {
    setLogLevel('warn');
    expect(getLogLevel()).toBe('warn');
  });

  test('debug logs when level is debug', () => {
    logger.debug('hello debug');
    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy.mock.calls[0][0]).toContain('hello debug');
  });

  test('debug is suppressed when level is info', () => {
    setLogLevel('info');
    logger.debug('suppressed');
    expect(debugSpy).not.toHaveBeenCalled();
  });

  test('info logs message with timestamp', () => {
    logger.info('port opened');
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0][0]).toMatch(/\[INFO\].*port opened/);
  });

  test('warn logs at warn level', () => {
    setLogLevel('warn');
    logger.warn('something odd');
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  test('error includes error message when Error is passed', () => {
    logger.error('failed', new Error('boom'));
    expect(errorSpy.mock.calls[0][0]).toContain('boom');
  });

  test('error works without an Error argument', () => {
    logger.error('plain error');
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  test('lower-priority messages suppressed at error level', () => {
    setLogLevel('error');
    logger.debug('no');
    logger.info('no');
    logger.warn('no');
    expect(debugSpy).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
