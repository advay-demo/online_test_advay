import { describe } from 'vitest';

try {
  describe('test', () => {});
} catch (e) {
  console.error(e.stack);
}
