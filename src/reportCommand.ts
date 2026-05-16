import * as fs from 'fs';
import * as path from 'path';
import { buildPortReport, formatReportSummary } from './portReport';
import { loadState } from './stateStore';
import { shouldLog } from './logger';

export type ReportFormat = 'text' | 'json';

export interface ReportCommandOptions {
  format?: ReportFormat;
  outputFile?: string;
}

export function runReportCommand(options: ReportCommandOptions = {}): void {
  const { format = 'text', outputFile } = options;

  const snapshot = loadState();
  if (!snapshot) {
    console.error('No port snapshot found. Is the portwatch daemon running?');
    process.exit(1);
  }

  const report = buildPortReport(snapshot);

  let output: string;
  if (format === 'json') {
    output = JSON.stringify(report, null, 2);
  } else {
    output = formatReportSummary(report);
  }

  if (outputFile) {
    const resolved = path.resolve(outputFile);
    fs.writeFileSync(resolved, output, 'utf-8');
    if (shouldLog('info')) {
      console.log(`Report written to ${resolved}`);
    }
  } else {
    console.log(output);
  }
}
