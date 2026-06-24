import { create } from "zustand";
import {
  monitorQuizProgress,
  getQuizStatistics,
  downloadQuizCSV,
  uploadMarksCSV,
  getUserData,
  extendAnswerPaperTime,
  allowSpecialAttempt,
  startSpecialAttempt,
  revokeSpecialAttempt,
} from "../api/api";

// Always returns a plain string so React can render it safely
const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (!data) return error?.message || "An unexpected error occurred.";
  if (typeof data === "string") return data;
  // Django / DRF typically returns {error: "..."} or {detail: "..."}
  if (data.error) return data.error;
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  return JSON.stringify(data);
};

const useMonitorStore = create((set) => ({
  loading: false,
  error: null,
  result: null,

  // Monitor quiz progress
  monitorQuiz: async (quizId, courseId, attemptNumber = null) => {
    set({ loading: true, error: null, result: null });
    try {
      const data = await monitorQuizProgress(quizId, courseId, attemptNumber);
      set({ result: data, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  // Get quiz statistics
  fetchQuizStatistics: async (questionpaperId, courseId, attemptNumber = null) => {
    set({ loading: true, error: null, result: null });
    try {
      const data = await getQuizStatistics(questionpaperId, courseId, attemptNumber);
      set({ result: data, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  // Download quiz CSV
  downloadCSV: async (courseId, quizId, attemptNumber) => {
    set({ error: null }); // don't wipe result - keeps monitor panel visible
    try {
      await downloadQuizCSV(courseId, quizId, attemptNumber);
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  // Upload marks CSV
  uploadCSV: async (courseId, questionpaperId, csvFile) => {
    set({ error: null }); // don't wipe result - keeps monitor panel visible
    try {
      await uploadMarksCSV(courseId, questionpaperId, csvFile);
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  // Get user data
  fetchUserData: async (userId, questionpaperId = null, courseId = null) => {
    set({ loading: true, error: null, result: null });
    try {
      const data = await getUserData(userId, questionpaperId, courseId);
      set({ result: data, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  // Extend answer paper time
  extendTime: async (paperId, extraTime) => {
    set({ loading: true, error: null, result: null });
    try {
      const data = await extendAnswerPaperTime(paperId, extraTime);
      set({ result: data, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  // Allow special attempt
  allowSpecial: async (userId, courseId, quizId) => {
    set({ loading: true, error: null, result: null });
    try {
      const data = await allowSpecialAttempt(userId, courseId, quizId);
      set({ result: data, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  // Start special attempt
  startSpecial: async (micromanagerId) => {
    set({ loading: true, error: null, result: null });
    try {
      const data = await startSpecialAttempt(micromanagerId);
      set({ result: data, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  // Revoke special attempt
  revokeSpecial: async (micromanagerId) => {
    set({ loading: true, error: null, result: null });
    try {
      const data = await revokeSpecialAttempt(micromanagerId);
      set({ result: data, loading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), loading: false });
    }
  },

  // Reset state
  reset: () => set({ loading: false, error: null, result: null }),
}));

export default useMonitorStore;