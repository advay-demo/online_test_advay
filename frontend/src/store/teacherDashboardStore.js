import { create } from 'zustand';
import { fetchTeacherDashboard, createDemoCourse } from '../api/api';

export const useTeacherDashboardStore = create((set) => ({
  dashboardData: null,
  loading: false,
  error: null,
  message: null,
  loadDashboard: async () => {
    set({ loading: true, error: null, message: null });
    try {
      const data = await fetchTeacherDashboard();
      set({ dashboardData: data, error: null });
    } catch (err) {
      set({ error: 'Failed to load dashboard data' });
    } finally {
      set({ loading: false });
    }
  },
  createDemoCourse: async () => {
    set({ loading: true, error: null, message: null });
    try {
      const result = await createDemoCourse();
      set({ error: null, message: result.message || null }); 
      return result;
    } catch (err) {
      set({ error: 'Failed to create demo course', message: null });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  clearMessage: () => set({ message: null }), 
}));