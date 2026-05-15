import { execSync } from 'child_process';
import { parseLsofOutput, diffPortSnapshots } from './portScanner';
import { sendNotification } from './notifier';
import { DaemonConfig, PortSnapshot } from './types';

const DEFAULT_CONFIG: DaemonConfig = {
  intervalMs: 5000,
  notificationTitle: 'portwatch',
  notificationSound: false,
  ignorePorts: [],
  ignoreProcesses: [],
};

function takeSnapshot(): PortSnapshot {
  const raw = execSync('lsof -iTCP -iUDP -n -P -sTCP:LISTEN', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore'],
  });
  return {
    timestamp: Date.now(),
    entries: parseLsofOutput(raw),
  };
}

export function startDaemon(userConfig: Partial<DaemonConfig> = {}): () => void {
  const config: DaemonConfig = { ...DEFAULT_CONFIG, ...userConfig };
  let previous: PortSnapshot | null = null;

  console.log(`[portwatch] Starting daemon (interval: ${config.intervalMs}ms)`);

  const tick = () => {
    try {
      const current = takeSnapshot();
      if (previous !== null) {
        let changes = diffPortSnapshots(previous.entries, current.entries);

        if (config.ignorePorts && config.ignorePorts.length > 0) {
          changes = changes.filter((c) => !config.ignorePorts!.includes(c.port));
        }
        if (config.ignoreProcesses && config.ignoreProcesses.length > 0) {
          changes = changes.filter(
            (c) => !config.ignoreProcesses!.includes(c.process ?? '')
          );
        }

        if (changes.length > 0) {
          console.log(`[portwatch] ${changes.length} change(s) detected`);
          sendNotification(changes, {
            title: config.notificationTitle,
            sound: config.notificationSound,
          });
        }
      }
      previous = current;
    } catch (err) {
      console.error('[portwatch] Error during scan:', err);
    }
  };

  tick();
  const interval = setInterval(tick, config.intervalMs);

  return () => {
    clearInterval(interval);
    console.log('[portwatch] Daemon stopped.');
  };
}
