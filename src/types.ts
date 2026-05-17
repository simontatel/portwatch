export interface PortEntry {
  port: number;
  pid: number;
  protocol: 'tcp' | 'udp';
  process: string;
  address?: string;
}

export interface PortSnapshot {
  ports: PortEntry[];
  timestamp: number;
}

export interface PortDiff {
  opened: PortEntry[];
  closed: PortEntry[];
  timestamp: number;
}

export interface PortEvent {
  type: 'opened' | 'closed';
  port: PortEntry;
  timestamp: number;
}

export interface PortHistoryRecord {
  events: PortEvent[];
  savedAt: number;
}

export interface Config {
  interval?: number;
  ignore?: IgnoreRule[];
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  throttleMs?: number;
  stateFile?: string;
  historyFile?: string;
}

export interface IgnoreRule {
  port?: number;
  process?: string;
  protocol?: 'tcp' | 'udp';
}

export interface AlertRecord {
  key: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
}

export interface ReportSummary {
  totalOpen: number;
  byProtocol: Record<string, number>;
  topProcesses: Array<{ process: string; count: number }>;
  generatedAt: number;
}
