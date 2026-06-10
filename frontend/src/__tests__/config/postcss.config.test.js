import postcssConfig from '../../../postcss.config.js';

describe('postcss.config.js', () => {
  it('should export a valid postcss configuration', () => {
    expect(postcssConfig).toBeDefined();
    expect(postcssConfig.plugins).toBeDefined();
    expect(postcssConfig.plugins.tailwindcss).toBeDefined();
    expect(postcssConfig.plugins.autoprefixer).toBeDefined();
  });
});
