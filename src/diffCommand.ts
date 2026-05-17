import { takeSnapshot } from './daemon';
import { loadState, saveState } from './stateStore';
import { diffPortSnapshots } from './portScanner';
import { formatNotificationBody } from './notifier';
import { applyIgnoreFilters } from './configFilter';
import { loadConfig } from './config';
import { PortSnapshot, PortDiff } from './types';

export interface DiffCommandOptions {
  save?: boolean;
  json?: boolean;
  quiet?: boolean;
}

export async function runDiffCommand(options: DiffCommandOptions = {}): Promise<PortDiff | null> {
  const config = await loadConfig();
  const current = await takeSnapshot();
  const previous = await loadState();

  if (!previous) {
    if (!options.quiet) {
      console.log('No previous snapshot found. Use --save to record the current state.');
    }
    if (options.save) {
      await saveState(current);
      if (!options.quiet) {
        console.log(`Saved snapshot with ${current.ports.length} ports.`);
      }
    }
    return null;
  }

  const rawDiff = diffPortSnapshots(previous, current);
  const diff: PortDiff = {
    opened: applyIgnoreFilters(rawDiff.opened, config),
    closed: applyIgnoreFilters(rawDiff.closed, config),
    timestamp: Date.now(),
  };

  if (options.json) {
    console.log(JSON.stringify(diff, null, 2));
  } else if (!options.quiet) {
    if (diff.opened.length === 0 && diff.closed.length === 0) {
      console.log('No port changes detected.');
    } else {
      console.log(formatNotificationBody(diff));
    }
  }

  if (options.save) {
    await saveState(current);
  }

  return diff;
}

export function parseDiffArgs(args: string[]): DiffCommandOptions {
  return {
    save: args.includes('--save') || args.includes('-s'),
    json: args.includes('--json') || args.includes('-j'),
    quiet: args.includes('--quiet') || args.includes('-q'),
  };
}
