import fs from 'fs';
import path from 'path';
import os from 'os';
import { saveState, loadState, clearState, getStateFilePath } from './stateStore';
import { PortSnapshot } from './types';

const makeSnapshot = (): PortSnapshot => ({
  timestamp: new Date().toISOString(),
  ports: [
    { port: 3000, protocol: 'tcp', pid: 1234, process: 'node' },
  ],
});

describe('stateStore', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portwatch-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('getStateFilePath returns correct path', () => {
    expect(getStateFilePath('/tmp/pw')).toBe('/tmp/pw/state.json');
  });

  test('loadState returns null when no state file exists', () => {
    expect(loadState(tmpDir)).toBeNull();
  });

  test('saveState writes state and loadState reads it back', () => {
    const snapshot = makeSnapshot();
    saveState(snapshot, tmpDir);
    const loaded = loadState(tmpDir);
    expect(loaded).not.toBeNull();
    expect(loaded!.lastSnapshot).toEqual(snapshot);
    expect(loaded!.updatedAt).toBeDefined();
  });

  test('saveState creates directory if missing', () => {
    const nested = path.join(tmpDir, 'deep', 'nested');
    const snapshot = makeSnapshot();
    saveState(snapshot, nested);
    expect(fs.existsSync(nested)).toBe(true);
  });

  test('clearState removes state file', () => {
    saveState(makeSnapshot(), tmpDir);
    clearState(tmpDir);
    expect(fs.existsSync(getStateFilePath(tmpDir))).toBe(false);
  });

  test('clearState is a no-op when file does not exist', () => {
    expect(() => clearState(tmpDir)).not.toThrow();
  });

  test('loadState returns null for malformed JSON', () => {
    const filePath = getStateFilePath(tmpDir);
    fs.writeFileSync(filePath, '{not valid json', 'utf-8');
    expect(loadState(tmpDir)).toBeNull();
  });
});
