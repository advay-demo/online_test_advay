import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../../store/useStore';

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({
      sidebarCollapsed: false,
      theme: 'dark',
    });
  });

  it('should have initial user data', () => {
    const state = useStore.getState();

    expect(state.user).toBeDefined();
    expect(state.user.username).toBe('mohitr8998');
  });

  it('should have courses', () => {
    const state = useStore.getState();

    expect(state.courses.length).toBeGreaterThan(0);
  });

  it('should have stats', () => {
    const state = useStore.getState();

    expect(state.stats.coursesEnrolled).toBe(5);
  });

  it('should have activities', () => {
    const state = useStore.getState();

    expect(state.activities.length).toBe(4);
  });

  it('should have badges', () => {
    const state = useStore.getState();

    expect(state.badges.unlocked.length).toBeGreaterThan(0);
    expect(state.badges.inProgress.length).toBeGreaterThan(0);
  });

  it('should toggle sidebar', () => {
    useStore.getState().toggleSidebar();

    expect(
      useStore.getState().sidebarCollapsed
    ).toBe(true);

    useStore.getState().toggleSidebar();

    expect(
      useStore.getState().sidebarCollapsed
    ).toBe(false);
  });

  it('should toggle theme from dark to light', () => {
    useStore.setState({ theme: 'dark' });

    useStore.getState().toggleTheme();

    expect(
      useStore.getState().theme
    ).toBe('light');
  });

  it('should toggle theme from light to dark', () => {
    useStore.setState({ theme: 'light' });

    useStore.getState().toggleTheme();

    expect(
      useStore.getState().theme
    ).toBe('dark');
  });
});