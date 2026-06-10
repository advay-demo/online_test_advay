import tailwindConfig from '../../../tailwind.config.js';

describe('tailwind.config.js', () => {
  it('should export a valid tailwind configuration', () => {
    expect(tailwindConfig).toBeDefined();
    expect(tailwindConfig.darkMode).toEqual(['selector', '[data-theme="dark"]']);
    expect(tailwindConfig.content).toContain('./index.html');
    expect(tailwindConfig.theme).toBeDefined();
    expect(tailwindConfig.theme.extend.colors['dark-bg']).toBe('#0b0b11');
    expect(tailwindConfig.plugins).toEqual([]);
  });
});
