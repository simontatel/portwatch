import { execSync } from 'child_process';
import { ProcessDetails } from './types';
import { shouldLog } from './logger';

/**
 * Attempts to resolve additional details about a process by PID.
 */
export function getProcessDetails(pid: number): ProcessDetails | null {
  try {
    const output = execSync(`ps -p ${pid} -o pid=,comm=,args= 2>/dev/null`, {
      encoding: 'utf8',
      timeout: 2000,
    }).trim();

    if (!output) return null;

    const parts = output.trim().split(/\s+/);
    const resolvedPid = parseInt(parts[0], 10);
    const command = parts[1] ?? 'unknown';
    const args = parts.slice(2).join(' ');

    return { pid: resolvedPid, command, args };
  } catch (err) {
    if (shouldLog('debug')) {
      console.debug(`[processInfo] Failed to get details for PID ${pid}:`, err);
    }
    return null;
  }
}

/**
 * Returns a human-readable label for a process, combining command and partial args.
 */
export function formatProcessLabel(details: ProcessDetails | null, fallback: string): string {
  if (!details) return fallback;
  const argSummary = details.args.length > 40 ? details.args.slice(0, 40) + '…' : details.args;
  return argSummary ? `${details.command} (${argSummary})` : details.command;
}
