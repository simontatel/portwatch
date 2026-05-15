export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLevel: LogLevel = (process.env.PORTWATCH_LOG_LEVEL as LogLevel) || 'info';

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function getLogLevel(): LogLevel {
  return currentLevel;
}

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, message: string): string {
  const ts = new Date().toISOString();
  return `[${ts}] [${level.toUpperCase()}] ${message}`;
}

export const logger = {
  debug(message: string): void {
    if (shouldLog('debug')) console.debug(formatMessage('debug', message));
  },
  info(message: string): void {
    if (shouldLog('info')) console.info(formatMessage('info', message));
  },
  warn(message: string): void {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message));
  },
  error(message: string, err?: unknown): void {
    if (shouldLog('error')) {
      const detail = err instanceof Error ? ` — ${err.message}` : '';
      console.error(formatMessage('error', `${message}${detail}`));
    }
  },
};
