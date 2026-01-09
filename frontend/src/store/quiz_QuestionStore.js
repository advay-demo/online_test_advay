import { create } from 'zustand';
import {
  apiStartQuiz,
  apiQuitQuiz,
  apiCompleteQuiz,
  apiCheckAnswer,
  apiSkipQuestion,
  testQuestion,
} from '../api/api';

const useQuizStore = create((set, get) => ({
  // State
  quizIntro: null,
  currentQuestion: null,
  paper: null,
  loading: false,
  error: null,
  quizResult: null,
  answerResult: null,
  timeLeft: null,
  
  // Quiz parameters
  questionpaperId: null,
  moduleId: null,
  courseId: null,
  attemptNum: null,

  // Actions

  /**
   * Set quiz parameters
   */
  setQuizParams: (params) => set({
    questionpaperId: params.questionpaperId,
    moduleId: params.moduleId,
    courseId: params.courseId,
    attemptNum: params.attemptNum,
  }),

  /**
   * Get quiz intro (first step before starting)
   */
  getQuizIntro: async (questionpaperId, moduleId, courseId, attemptNum = null) => {
    set({ loading: true, error: null });
    try {
      const intro = await apiStartQuiz(questionpaperId, moduleId, courseId, attemptNum, null);
      set({ 
        quizIntro: intro,
        questionpaperId,
        moduleId,
        courseId,
        attemptNum,
        loading: false 
      });
      return intro;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to load quiz intro';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  /**
   * Start quiz (actually create answerpaper and get first question)
   */
  startQuiz: async (questionpaperId, moduleId, courseId, attemptNum = null) => {
    set({ loading: true, error: null });
    try {
      const quizData = await apiStartQuiz(questionpaperId, moduleId, courseId, attemptNum, {});
      set({ 
        currentQuestion: quizData.question,
        paper: quizData.paper,
        timeLeft: quizData.paper?.time_left,
        questionpaperId,
        moduleId,
        courseId,
        attemptNum: quizData.paper?.attempt_number || attemptNum,
        loading: false 
      });
      return quizData;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to start quiz';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  /**
   * Resume quiz with existing attempt
   */
  resumeQuiz: async (attemptNum, moduleId, questionpaperId, courseId) => {
    set({ loading: true, error: null });
    try {
      const quizData = await apiStartQuiz(questionpaperId, moduleId, courseId, attemptNum);
      set({ 
        currentQuestion: quizData.question,
        paper: quizData.paper,
        timeLeft: quizData.paper?.time_left,
        questionpaperId,
        moduleId,
        courseId,
        attemptNum,
        loading: false 
      });
      return quizData;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to resume quiz';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  /**
   * Submit an answer for the current question
   */
  submitAnswer: async (questionId, answerData) => {
    const { attemptNum, moduleId, questionpaperId, courseId } = get();
    set({ loading: true, error: null });
    
    try {
      const result = await apiCheckAnswer(
        questionId,
        attemptNum,
        moduleId,
        questionpaperId,
        courseId,
        answerData
      );
      
      set({ 
        answerResult: result,
        currentQuestion: result.next_question || result.question,
        paper: result.paper,
        timeLeft: result.paper?.time_left,
        loading: false 
      });
      
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to submit answer';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  /**
   * Get current question state (without submitting)
   */
  getCurrentQuestion: async (questionId) => {
    const { attemptNum, moduleId, questionpaperId, courseId } = get();
    set({ loading: true, error: null });
    
    try {
      const result = await apiCheckAnswer(
        questionId,
        attemptNum,
        moduleId,
        questionpaperId,
        courseId,
        null
      );
      
      set({ 
        currentQuestion: result.question,
        paper: result.paper,
        timeLeft: result.paper?.time_left,
        loading: false 
      });
      
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to get question';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  /**
   * Skip current question
   */
  skipQuestion: async (questionId, nextQuestionId = null, codeData = null) => {
    const { attemptNum, moduleId, questionpaperId, courseId } = get();
    set({ loading: true, error: null });
    
    try {
      const result = await apiSkipQuestion(
        questionId,
        attemptNum,
        moduleId,
        questionpaperId,
        courseId,
        nextQuestionId,
        codeData
      );
      
      set({ 
        currentQuestion: result.question || result.next_question,
        paper: result.paper,
        timeLeft: result.paper?.time_left,
        loading: false 
      });
      
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to skip question';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  /**
   * Complete/submit the quiz
   */
  completeQuiz: async () => {
    const { attemptNum, moduleId, questionpaperId, courseId } = get();
    set({ loading: true, error: null });
    
    try {
      const result = await apiCompleteQuiz(
        attemptNum,
        moduleId,
        questionpaperId,
        courseId,
        {}
      );
      
      set({ 
        quizResult: result,
        paper: result.paper,
        loading: false 
      });
      
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to complete quiz';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  /**
   * Quit the quiz
   */
  quitQuiz: async (reason = null) => {
    const { attemptNum, moduleId, questionpaperId, courseId } = get();
    set({ loading: true, error: null });
    
    try {
      const result = await apiQuitQuiz(
        attemptNum,
        moduleId,
        questionpaperId,
        courseId,
        reason
      );
      
      set({ 
        quizResult: result,
        paper: result.paper,
        loading: false 
      });
      
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to quit quiz';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  /**
   * Test a question (teacher only)
   */
  testQuestion: async (questionId) => {
    set({ loading: true, error: null });
    try {
      const result = await testQuestion(questionId);
      set({ 
        questionpaperId: result.questionpaper_id,
        moduleId: result.module_id,
        courseId: result.course_id,
        loading: false 
      });
      return result;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create test quiz';
      set({ error: errorMsg, loading: false });
      throw new Error(errorMsg);
    }
  },

  /**
   * Clear error
   */
  clearError: () => set({ error: null }),

  /**
   * Reset quiz state
   */
  resetQuiz: () => set({
    quizIntro: null,
    currentQuestion: null,
    paper: null,
    loading: false,
    error: null,
    quizResult: null,
    answerResult: null,
    timeLeft: null,
    questionpaperId: null,
    moduleId: null,
    courseId: null,
    attemptNum: null,
  }),

  /**
   * Update time left (for countdown timer)
   */
  updateTimeLeft: (seconds) => set({ timeLeft: seconds }),
}));

export default useQuizStore;