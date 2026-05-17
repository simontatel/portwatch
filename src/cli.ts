#!/usr/bin/env node
import { startDaemon } from './daemon';
import { runReportCommand } from './reportCommand';
import { runSnapshotCommand } from './snapshotCommand';
import { parseWatchdogArgs } from './watchdogCommand';
import { loadConfig, mergeConfig, saveConfig } from './config';
import { setLogLevel } from './logger';

const [, , command, ...args] = process.argv;

function hasFlag(flag: string): boolean {
  return args.includes(flag);
}

async function main(): Promise<void> {
  const config = await loadConfig();

  if (hasFlag('--verbose') || hasFlag('-v')) {
    setLogLevel('debug');
  }

  switch (command) {
    case 'start':
      console.log('Starting portwatch daemon...');
      await startDaemon(config);
      break;

    case 'snapshot':
      await runSnapshotCommand({
        json: hasFlag('--json'),
        verbose: hasFlag('--verbose') || hasFlag('-v'),
        history: hasFlag('--history'),
      });
      break;

    case 'report':
      await runReportCommand();
      break;

    case 'watchdog': {
      const watchdogConfig = parseWatchdogArgs(args);
      const merged = mergeConfig(config, watchdogConfig);
      await saveConfig(merged);
      console.log('Watchdog configuration updated.');
      break;
    }

    case 'config': {
      if (hasFlag('--json')) {
        console.log(JSON.stringify(config, null, 2));
      } else {
        console.log('Current portwatch configuration:');
        for (const [key, value] of Object.entries(config)) {
          console.log(`  ${key}: ${JSON.stringify(value)}`);
        }
      }
      break;
    }

    default:
      console.log('portwatch — lightweight port monitoring daemon');
      console.log('');
      console.log('Usage: portwatch <command> [options]');
      console.log('');
      console.log('Commands:');
      console.log('  start              Start the monitoring daemon');
      console.log('  snapshot           Show current open ports');
      console.log('  report             Show port change report');
      console.log('  watchdog           Configure watchdog rules');
      console.log('  config             Show current configuration');
      console.log('');
      console.log('Options:');
      console.log('  --json             Output as JSON');
      console.log('  --verbose, -v      Enable verbose logging');
      console.log('  --history          Show port event history (snapshot command)');
      process.exit(command ? 1 : 0);
  }
}

main().catch(err => {
  console.error('portwatch error:', err.message);
  process.exit(1);
});
