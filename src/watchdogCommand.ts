import { startDaemon } from './daemon';
import { loadConfig, mergeConfig } from './config';
import { loadState, saveState } from './stateStore';
import { setLogLevel } from './logger';
import { clearThrottleState } from './alertThrottle';
import { clearHistory } from './portHistory';

export interface WatchdogOptions {
  interval?: number;
  reset?: boolean;
  verbose?: boolean;
  configPath?: string;
}

export async function runWatchdogCommand(options: WatchdogOptions = {}): Promise<void> {
  if (options.verbose) {
    setLogLevel('debug');
  }

  const baseConfig = await loadConfig(options.configPath);
  const config = mergeConfig(baseConfig, {
    ...(options.interval !== undefined && { pollIntervalMs: options.interval * 1000 }),
  });

  if (options.reset) {
    console.log('[portwatch] Resetting state, throttle, and history...');
    const state = await loadState();
    if (state) {
      await saveState({});
    }
    await clearThrottleState();
    await clearHistory();
    console.log('[portwatch] Reset complete.');
  }

  console.log(
    `[portwatch] Starting daemon with poll interval ${
      config.pollIntervalMs ?? 5000
    }ms...`
  );

  await startDaemon(config);
}

export function parseWatchdogArgs(argv: string[]): WatchdogOptions {
  const options: WatchdogOptions = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--interval' || arg === '-i') {
      const val = Number(argv[i + 1]);
      if (!isNaN(val) && val > 0) {
        options.interval = val;
        i++;
      }
    } else if (arg === '--reset') {
      options.reset = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--config' || arg === '-c') {
      options.configPath = argv[i + 1];
      i++;
    }
  }

  return options;
}
