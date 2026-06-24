import React from 'react';
import { render } from '@testing-library/react';
import ThemeController from '../../../components/layout/ThemeController';
import { useStore } from '../../../store/useStore';

vi.mock('../../../store/useStore');

describe('ThemeController Component', () => {
  it('sets the data-theme attribute on document body', () => {
    useStore.mockImplementation((selector) => {
      const state = { theme: 'dark' };
      return selector(state);
    });
    render(<ThemeController />);
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    useStore.mockImplementation((selector) => {
      const state = { theme: 'light' };
      return selector(state);
    });
    render(<ThemeController />);
    expect(document.body.getAttribute('data-theme')).toBe('light');
  });
});