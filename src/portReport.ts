import { PortSnapshot, PortEvent } from './types';
import { loadHistory } from './portHistory';
import { formatProcessLabel } from './processInfo';
import { getAlertCount } from './alertThrottle';

export interface PortReportEntry {
  port: number;
  protocol: string;
  processLabel: string;
  firstSeen: number;
  lastSeen: number;
  alertCount: number;
}

export interface PortReport {
  generatedAt: number;
  activePorts: PortReportEntry[];
  recentEvents: PortEvent[];
  totalAlerts: number;
}

export function buildPortReport(snapshot: PortSnapshot): PortReport {
  const history = loadHistory();
  const recentEvents = history.slice(-50);

  const activePorts: PortReportEntry[] = snapshot.ports.map((p) => {
    const throttleKey = `${p.port}:${p.protocol}`;
    return {
      port: p.port,
      protocol: p.protocol,
      processLabel: formatProcessLabel(p),
      firstSeen: p.timestamp ?? Date.now(),
      lastSeen: p.timestamp ?? Date.now(),
      alertCount: getAlertCount(throttleKey),
    };
  });

  const totalAlerts = activePorts.reduce((sum, e) => sum + e.alertCount, 0);

  return {
    generatedAt: Date.now(),
    activePorts,
    recentEvents,
    totalAlerts,
  };
}

export function formatReportSummary(report: PortReport): string {
  const lines: string[] = [
    `Port Report — ${new Date(report.generatedAt).toISOString()}`,
    `Active ports: ${report.activePorts.length}`,
    `Total alerts fired: ${report.totalAlerts}`,
    `Recent events (last ${report.recentEvents.length}):`,
  ];

  for (const event of report.recentEvents.slice(-10)) {
    const ts = new Date(event.timestamp).toLocaleTimeString();
    lines.push(`  [${ts}] ${event.type.toUpperCase()} port ${event.port}/${event.protocol} — ${event.processName ?? 'unknown'}`);
  }

  return lines.join('\n');
}
