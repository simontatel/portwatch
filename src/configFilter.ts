import { PortwatchConfig } from './config';
import { PortEntry } from './types';

/**
 * Filters a list of port entries based on the current config,
 * removing any ports or processes the user has chosen to ignore.
 */
export function applyIgnoreFilters(
  entries: PortEntry[],
  config: PortwatchConfig
): PortEntry[] {
  return entries.filter((entry) => {
    if (config.ignoredPorts.includes(entry.port)) {
      return false;
    }
    if (
      entry.process &&
      config.ignoredProcesses.some(
        (ignored) =>
          entry.process!.toLowerCase() === ignored.toLowerCase()
      )
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Determines whether a notification should be sent for a given event
 * type based on the config flags.
 */
export function shouldNotify(
  event: 'open' | 'close',
  config: PortwatchConfig
): boolean {
  if (event === 'open') return config.notifyOnOpen;
  if (event === 'close') return config.notifyOnClose;
  return false;
}
