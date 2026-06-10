import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('fix-imports.cjs', () => {
  let readdirSpy, statSpy, readFileSpy, writeFileSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    readdirSpy = vi.spyOn(fs, 'readdirSync').mockImplementation((dir) => {
      if (dir.endsWith('__tests__')) return ['test1.test.js', 'subdir'];
      if (dir.endsWith('subdir')) return ['test2.test.jsx'];
      return [];
    });
    statSpy = vi.spyOn(fs, 'statSync').mockImplementation((fullPath) => ({
      isDirectory: () => fullPath.endsWith('subdir')
    }));
    readFileSpy = vi.spyOn(fs, 'readFileSync').mockReturnValue(`import { describe } from 'vitest';\nconst x = 1;`);
    writeFileSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should process directories and modify .test.js files', async () => {
    // Import the script (it executes processDir immediately)
    await import('../../../fix-imports.cjs?update=' + Date.now());

    // It should have called readFileSync for test1 and test2
    expect(readFileSpy).toHaveBeenCalledTimes(2);
    expect(writeFileSpy).toHaveBeenCalledTimes(2);

    // The written content should have the vitest import removed
    const writeArgs = writeFileSpy.mock.calls;
    expect(writeArgs[0][1]).not.toContain('import { describe } from \'vitest\'');
    expect(writeArgs[0][1]).toContain('const x = 1;');
  });
});
