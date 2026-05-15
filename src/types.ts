/** Represents a single listening port entry captured from lsof/netstat. */
export interface PortEntry {
  port: number;
  process: string;
  proto: 'tcp' | 'udp';
  pid: number;
}

/** A snapshot of all currently listening ports at a point in time. */
export interface PortSnapshot {
  timestamp: number;
  entries: PortEntry[];
}

/** The diff result between two snapshots. */
export interface PortDiff {
  opened: PortEntry[];
  closed: PortEntry[];
}

/** Resolved details about a running process. */
export interface ProcessDetails {
  pid: number;
  command: string;
  args: string;
}

/** Filter configuration used to suppress notifications. */
export interface FilterConfig {
  ignorePorts: number[];
  ignoreProcesses: string[];
}

/** Top-level daemon configuration. */
export interface DaemonConfig {
  intervalMs: number;
  filters: FilterConfig;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  stateFile?: string;
}
