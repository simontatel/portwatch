import { takeSnapshot } from './daemon';
import { loadHistory } from './portHistory';
import { buildPortReport, formatReportSummary } from './portReport';
import { loadConfig } from './config';
import { shouldLog } from './logger';

export interface SnapshotCommandOptions {
  json?: boolean;
  verbose?: boolean;
  history?: boolean;
}

export async function runSnapshotCommand(options: SnapshotCommandOptions = {}): Promise<void> {
  const config = await loadConfig();

  if (shouldLog('debug')) {
    console.debug('[snapshotCommand] Running snapshot with options:', options);
  }

  const snapshot = await takeSnapshot();

  if (options.history) {
    const history = await loadHistory();
    if (options.json) {
      console.log(JSON.stringify(history, null, 2));
    } else {
      console.log(`Port event history (${history.length} entries):`);
      for (const entry of history) {
        console.log(`  [${entry.timestamp}] ${entry.event} port ${entry.port} (${entry.processName ?? 'unknown'})`);
      }
    }
    return;
  }

  const report = buildPortReport(snapshot, config);

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const summary = formatReportSummary(report);
  console.log(summary);

  if (options.verbose) {
    console.log('\nActive ports:');
    for (const entry of snapshot) {
      console.log(`  ${entry.protocol}:${entry.port}\t${entry.processName ?? '?'} (pid ${entry.pid ?? '-'})`);
    }
  }
}
