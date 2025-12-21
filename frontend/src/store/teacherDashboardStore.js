import { create } from 'zustand';
import { fetchTeacherDashboard } from '../api/api';

export const useTeacherDashboardStore = create((set) => ({
  dashboardData: null,
  loading: false,
  error: null,
  loadDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchTeacherDashboard();
      set({ dashboardData: data, error: null });
    } catch (err) {
      set({ error: 'Failed to load dashboard data' });
      // Optionally log error
      // console.error('Failed to load dashboard:', err);
    } finally {
      set({ loading: false });
    }
  },
}));