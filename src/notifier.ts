import { execSync } from 'child_process';
import { PortChange } from './types';

export interface NotifierOptions {
  title?: string;
  sound?: boolean;
}

const DEFAULT_TITLE = 'portwatch';

export function formatNotificationBody(changes: PortChange[]): string {
  return changes
    .map((c) => {
      if (c.type === 'opened') {
        return `🟢 Port ${c.port} opened (${c.process ?? 'unknown'})`;
      }
      return `🔴 Port ${c.port} closed (${c.process ?? 'unknown'})`;
    })
    .join('\n');
}

export function sendNotification(
  changes: PortChange[],
  options: NotifierOptions = {}
): void {
  if (changes.length === 0) return;

  const title = options.title ?? DEFAULT_TITLE;
  const body = formatNotificationBody(changes);
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      const script = `display notification "${body}" with title "${title}"`;
      execSync(`osascript -e '${script}'`, { stdio: 'ignore' });
    } else if (platform === 'linux') {
      const soundFlag = options.sound ? '' : '-h string:suppress-sound:true';
      execSync(`notify-send ${soundFlag} "${title}" "${body}"`, { stdio: 'ignore' });
    } else {
      console.warn('[portwatch] Desktop notifications not supported on this platform.');
    }
  } catch (err) {
    console.error('[portwatch] Failed to send notification:', err);
  }
}
