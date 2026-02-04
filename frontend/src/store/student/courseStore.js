import { create } from 'zustand';
import { fetchCoursesList, searchNewCourses } from '../../api/api';

const useCourseStore = create((set) => ({
  courses: [],
  newCourses: [],
  loading: false,
  error: null,

  // Fetch all courses (enrolled + available)
  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchCoursesList();
      set({ courses: data.courses || [], loading: false });
    } catch (err) {
      set({ error: err.message || 'Failed to fetch courses', loading: false });
    }
  },

  // Search for new courses by code
  searchCourses: async (courseCode) => {
    set({ loading: true, error: null });
    try {
      const data = await searchNewCourses(courseCode);
      set({ newCourses: data.courses || [], loading: false });
    } catch (err) {
      set({ error: err.message || 'Failed to search courses', loading: false });
    }
  },

  // Optionally, clear search results
  clearSearch: () => set({ newCourses: [] }),
}));

export default useCourseStore;