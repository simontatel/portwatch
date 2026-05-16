import { buildPortReport, formatReportSummary, PortReport } from './portReport';
import { PortSnapshot } from './types';
import * as portHistory from './portHistory';
import * as alertThrottle from './alertThrottle';
import * as processInfo from './processInfo';

jest.mock('./portHistory');
jest.mock('./alertThrottle');
jest.mock('./processInfo');

const mockSnapshot: PortSnapshot = {
  timestamp: Date.now(),
  ports: [
    { port: 3000, protocol: 'tcp', pid: 1234, processName: 'node', timestamp: Date.now() },
    { port: 5432, protocol: 'tcp', pid: 5678, processName: 'postgres', timestamp: Date.now() },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  (portHistory.loadHistory as jest.Mock).mockReturnValue([
    { type: 'opened', port: 3000, protocol: 'tcp', processName: 'node', timestamp: Date.now() - 1000 },
    { type: 'closed', port: 8080, protocol: 'tcp', processName: 'python', timestamp: Date.now() - 500 },
  ]);
  (alertThrottle.getAlertCount as jest.Mock).mockReturnValue(2);
  (processInfo.formatProcessLabel as jest.Mock).mockImplementation(
    (p: any) => `${p.processName}(${p.pid})`
  );
});

describe('buildPortReport', () => {
  it('returns a report with activePorts matching snapshot', () => {
    const report = buildPortReport(mockSnapshot);
    expect(report.activePorts).toHaveLength(2);
    expect(report.activePorts[0].port).toBe(3000);
    expect(report.activePorts[1].port).toBe(5432);
  });

  it('sets processLabel via formatProcessLabel', () => {
    const report = buildPortReport(mockSnapshot);
    expect(report.activePorts[0].processLabel).toBe('node(1234)');
  });

  it('aggregates totalAlerts from alertThrottle', () => {
    const report = buildPortReport(mockSnapshot);
    expect(report.totalAlerts).toBe(4); // 2 ports × 2 alerts each
  });

  it('includes recentEvents from history (max 50)', () => {
    const report = buildPortReport(mockSnapshot);
    expect(report.recentEvents).toHaveLength(2);
  });

  it('sets generatedAt to a recent timestamp', () => {
    const before = Date.now();
    const report = buildPortReport(mockSnapshot);
    expect(report.generatedAt).toBeGreaterThanOrEqual(before);
  });
});

describe('formatReportSummary', () => {
  it('includes active port count', () => {
    const report = buildPortReport(mockSnapshot);
    const summary = formatReportSummary(report);
    expect(summary).toContain('Active ports: 2');
  });

  it('includes total alerts', () => {
    const report = buildPortReport(mockSnapshot);
    const summary = formatReportSummary(report);
    expect(summary).toContain('Total alerts fired: 4');
  });

  it('includes event type labels', () => {
    const report = buildPortReport(mockSnapshot);
    const summary = formatReportSummary(report);
    expect(summary).toContain('OPENED');
    expect(summary).toContain('CLOSED');
  });
});
