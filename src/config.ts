import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface PortwatchConfig {
  intervalMs: number;
  ignoredPorts: number[];
  ignoredProcesses: string[];
  notifyOnOpen: boolean;
  notifyOnClose: boolean;
  logFile: string | null;
}

const DEFAULT_CONFIG: PortwatchConfig = {
  intervalMs: 5000,
  ignoredPorts: [],
  ignoredProcesses: [],
  notifyOnOpen: true,
  notifyOnClose: true,
  logFile: null,
};

const CONFIG_SEARCH_PATHS = [
  path.join(process.cwd(), '.portwatchrc.json'),
  path.join(os.homedir(), '.portwatchrc.json'),
  path.join(os.homedir(), '.config', 'portwatch', 'config.json'),
];

export function loadConfig(overridePath?: string): PortwatchConfig {
  const searchPaths = overridePath
    ? [overridePath, ...CONFIG_SEARCH_PATHS]
    : CONFIG_SEARCH_PATHS;

  for (const configPath of searchPaths) {
    if (fs.existsSync(configPath)) {
      try {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<PortwatchConfig>;
        return mergeConfig(DEFAULT_CONFIG, parsed);
      } catch (err) {
        console.warn(`[portwatch] Failed to parse config at ${configPath}:`, err);
      }
    }
  }

  return { ...DEFAULT_CONFIG };
}

export function mergeConfig(
  base: PortwatchConfig,
  overrides: Partial<PortwatchConfig>
): PortwatchConfig {
  return {
    intervalMs:
      typeof overrides.intervalMs === 'number' && overrides.intervalMs > 0
        ? overrides.intervalMs
        : base.intervalMs,
    ignoredPorts: Array.isArray(overrides.ignoredPorts)
      ? overrides.ignoredPorts
      : base.ignoredPorts,
    ignoredProcesses: Array.isArray(overrides.ignoredProcesses)
      ? overrides.ignoredProcesses
      : base.ignoredProcesses,
    notifyOnOpen:
      typeof overrides.notifyOnOpen === 'boolean'
        ? overrides.notifyOnOpen
        : base.notifyOnOpen,
    notifyOnClose:
      typeof overrides.notifyOnClose === 'boolean'
        ? overrides.notifyOnClose
        : base.notifyOnClose,
    logFile:
      overrides.logFile !== undefined ? overrides.logFile : base.logFile,
  };
}

/**
 * Writes the given config object to the specified file path as formatted JSON.
 * Throws if the directory does not exist or the file cannot be written.
 */
export function saveConfig(config: PortwatchConfig, filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}
