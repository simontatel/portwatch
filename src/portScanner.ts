import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface PortEntry {
  port: number;
  pid: number;
  protocol: 'tcp' | 'udp';
  process?: string;
}

function parseLsofOutput(output: string): PortEntry[] {
  const entries: PortEntry[] = [];
  const lines = output.trim().split('\n').slice(1); // skip header

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 9) continue;

    const processName = parts[0];
    const pid = parseInt(parts[1], 10);
    const type = parts[7]?.toLowerCase();
    const name = parts[8];

    if (!name || !type) continue;

    const portMatch = name.match(/:([\d]+)$/);
    if (!portMatch) continue;

    const port = parseInt(portMatch[1], 10);
    if (isNaN(port) || isNaN(pid)) continue;

    const protocol = type.startsWith('udp') ? 'udp' : 'tcp';

    entries.push({ port, pid, protocol, process: processName });
  }

  return entries;
}

export async function scanPorts(): Promise<PortEntry[]> {
  try {
    const { stdout } = await execAsync('lsof -iTCP -iUDP -n -P -sTCP:LISTEN');
    return parseLsofOutput(stdout);
  } catch (err: any) {
    // lsof exits with code 1 when no results found
    if (err.code === 1 && !err.stderr) {
      return [];
    }
    throw new Error(`Failed to scan ports: ${err.message}`);
  }
}

export function diffPortSnapshots(
  previous: PortEntry[],
  current: PortEntry[]
): { opened: PortEntry[]; closed: PortEntry[] } {
  const prevSet = new Set(previous.map((e) => `${e.protocol}:${e.port}`));
  const currSet = new Set(current.map((e) => `${e.protocol}:${e.port}`));

  const opened = current.filter((e) => !prevSet.has(`${e.protocol}:${e.port}`));
  const closed = previous.filter((e) => !currSet.has(`${e.protocol}:${e.port}`));

  return { opened, closed };
}
