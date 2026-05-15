import fs from 'fs';
import path from 'path';
import { PortSnapshot } from './types';

const DEFAULT_STATE_DIR = process.env.XDG_STATE_HOME
  ? path.join(process.env.XDG_STATE_HOME, 'portwatch')
  : path.join(process.env.HOME || '~', '.local', 'state', 'portwatch');

export interface PersistedState {
  lastSnapshot: PortSnapshot;
  updatedAt: string;
}

export function getStateFilePath(stateDir: string = DEFAULT_STATE_DIR): string {
  return path.join(stateDir, 'state.json');
}

export function saveState(
  snapshot: PortSnapshot,
  stateDir: string = DEFAULT_STATE_DIR
): void {
  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
  }
  const state: PersistedState = {
    lastSnapshot: snapshot,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(getStateFilePath(stateDir), JSON.stringify(state, null, 2), 'utf-8');
}

export function loadState(stateDir: string = DEFAULT_STATE_DIR): PersistedState | null {
  const filePath = getStateFilePath(stateDir);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function clearState(stateDir: string = DEFAULT_STATE_DIR): void {
  const filePath = getStateFilePath(stateDir);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
