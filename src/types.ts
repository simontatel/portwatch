export interface PortEntry {
  port: number;
  protocol: 'tcp' | 'udp';
  pid: number | null;
  process: string | null;
}

export interface PortSnapshot {
  timestamp: string;
  ports: PortEntry[];
}

export interface PortDiff {
  opened: PortEntry[];
  closed: PortEntry[];
}

export interface PortwatchConfig {
  interval: number;          // polling interval in ms
  ignoreProcesses: string[]; // process names to ignore
  ignorePorts: number[];     // specific ports to ignore
  ignoreProtocols: ('tcp' | 'udp')[];
  notificationTitle: string;
  persistState: boolean;
  stateDir?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  urgency?: 'low' | 'normal' | 'critical';
}
