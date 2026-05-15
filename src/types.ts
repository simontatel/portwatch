export interface PortEntry {
  port: number;
  protocol: 'tcp' | 'udp';
  process?: string;
  pid?: number;
}

export type ChangeType = 'opened' | 'closed';

export interface PortChange {
  type: ChangeType;
  port: number;
  protocol?: 'tcp' | 'udp';
  process?: string;
  pid?: number;
}

export interface PortSnapshot {
  timestamp: number;
  entries: PortEntry[];
}

export interface DaemonConfig {
  intervalMs: number;
  notificationTitle?: string;
  notificationSound?: boolean;
  ignorePorts?: number[];
  ignoreProcesses?: string[];
}
