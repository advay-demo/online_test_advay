import axios from 'axios';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// ============================================================
// AUTHENTICATION APIs
// ============================================================

export const register = async (userData) => {
  const response = await api.post('/api/auth/register/', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/api/auth/login/', credentials);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout/');
  return response.data;
};

export const getUserProfile = async (username) => {
  const response = await api.get(`/api/auth/profile/?username=${username}`);
  return response.data;
};

export const updateUserProfile = async (username, profileData) => {
  const response = await api.post('/api/auth/profile/update/', {
    username,
    ...profileData
  });
  return response.data;
};


// ============================================================
// STUDENT DASHBOARD & STATS APIs
// ============================================================

export const fetchDashboardData = async () => {
  const response = await api.get('/api/student/dashboard/');
  return response.data;
};

export const fetchUserStats = async () => {
  const response = await api.get('/api/student/stats/');
  return response.data;
};


// ============================================================
// COURSE CATALOG & ENROLLMENT APIs
// ============================================================

export const fetchCourseCatalog = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.level) params.append('level', filters.level);
  if (filters.category) params.append('category', filters.category);
  if (filters.enrollment_status) params.append('enrollment_status', filters.enrollment_status);

  const response = await api.get(`/api/student/courses/catalog/?${params.toString()}`);
  return response.data;
};

export const fetchEnrolledCourses = async () => {
  const response = await api.get('/api/student/courses/enrolled/');
  return response.data;
};

export const enrollInCourse = async (courseId) => {
  const response = await api.post(`/api/student/courses/${courseId}/enroll/`);
  return response.data;
};


// ============================================================
// COURSE MODULES & LESSONS APIs
// ============================================================

export const fetchCourseModules = async (courseId) => {
  const response = await api.get(`/api/student/courses/${courseId}/modules/`);
  return response.data;
};

export const fetchModuleDetail = async (moduleId) => {
  const response = await api.get(`/api/student/modules/${moduleId}/`);
  return response.data;
};

export const fetchLessonDetail = async (lessonId) => {
  const response = await api.get(`/api/student/lessons/${lessonId}/`);
  return response.data;
};

export const markLessonComplete = async (lessonId) => {
  const response = await api.post(`/api/student/lessons/${lessonId}/complete/`);
  return response.data;
};


// ============================================================
// BADGES & INSIGHTS APIs
// ============================================================

export const fetchBadges = async () => {
  const response = await api.get('/api/student/insights/badges/');
  return response.data;
};

export const fetchAchievements = async () => {
  const response = await api.get('/api/student/insights/achievements/');
  return response.data;
};


// ============================================================
// QUIZ APIs
// ============================================================

export const startQuiz = async (courseId, quizId) => {
  const response = await api.get(`/api/start_quiz/${courseId}/${quizId}/`);
  return response.data;
};

export const submitAnswer = async (answerpaperId, questionId, answer) => {
  const response = await api.post(`/api/validate/${answerpaperId}/${questionId}/`, {
    answer: answer
  });
  return response.data;
};

export const getAnswerResult = async (answerId) => {
  const response = await api.get(`/api/validate/${answerId}/`);
  return response.data;
};

export const quitQuiz = async (answerpaperId) => {
  const response = await api.get(`/api/quit/${answerpaperId}/`);
  return response.data;
};

export const getQuizSubmissionStatus = async (answerpaperId) => {
  const response = await api.get(`/api/student/answerpapers/${answerpaperId}/submission/`);
  return response.data;
};

// ============================================================
// TEACHER APIs - Content Creation
// ============================================================

export const fetchTeacherDashboard = async () => {
  const response = await api.get('/api/teacher/dashboard/');
  return response.data;
};

export const fetchTeacherCourses = async (status = 'all', search = '') => {
  const params = new URLSearchParams();
  if (status !== 'all') params.append('status', status);
  if (search) params.append('search', search);
  const response = await api.get(`/api/teacher/courses/?${params.toString()}`);
  return response.data;
};

export const createCourse = async (courseData) => {
  const response = await api.post('/api/teacher/courses/create/', courseData);
  return response.data;
};

export const createDemoCourse = async () => {
  const response = await api.post('/api/teacher/courses/create_demo_course/');
  return response.data;
};

export const getTeacherCourse = async (courseId) => {
  const response = await api.get(`/api/teacher/courses/${courseId}/`);
  return response.data;
};

export const updateCourse = async (courseId, courseData) => {
  const response = await api.put(`/api/teacher/courses/${courseId}/update/`, courseData);
  return response.data;
};

export const fetchTeacherQuizzesGrouped = async () => {
  const response = await api.get('/api/teacher/quizzes/grouped/');
  return response.data;
};

// Module APIs
export const getCourseModules = async (courseId) => {
  const response = await api.get(`/api/teacher/courses/${courseId}/modules/`);
  return response.data;
};


export const createModule = async (courseId, moduleData) => {
  const response = await api.post(`/api/teacher/courses/${courseId}/modules/create/`, moduleData);
  return response.data;
};

export const updateModule = async (courseId, moduleId, moduleData) => {
  const response = await api.put(`/api/teacher/courses/${courseId}/modules/${moduleId}/update/`, moduleData);
  return response.data;
};

// not reqd
export const deleteModule = async (courseId, moduleId) => {
  const response = await api.delete(`/api/teacher/courses/${courseId}/modules/${moduleId}/delete/`);
  return response.data;
};
// not reqd 


// Lesson APIs
export const createLesson = async (moduleId, lessonData) => {
  const response = await api.post(`/api/teacher/modules/${moduleId}/lessons/create/`, lessonData);
  return response.data;
};

export const getTeacherLesson = async (moduleId, lessonId) => {
  const response = await api.get(`/api/teacher/modules/${moduleId}/lessons/${lessonId}/`);
  return response.data;
};

export const updateLesson = async (moduleId, lessonId, lessonData) => {
  const response = await api.put(`/api/teacher/modules/${moduleId}/lessons/${lessonId}/update/`, lessonData);
  return response.data;
};

export const deleteLesson = async (moduleId, lessonId) => {
  const response = await api.delete(`/api/teacher/modules/${moduleId}/lessons/${lessonId}/delete/`);
  return response.data;
};

export const uploadLessonFiles = async (lessonId, files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });
  const response = await api.post(`/api/teacher/lessons/${lessonId}/files/upload/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Quiz APIs
export const getTeacherQuiz = async (moduleId, quizId) => {
  const response = await api.get(`/api/teacher/modules/${moduleId}/quizzes/${quizId}/`);
  return response.data;
};

export const createQuiz = async (moduleId, quizData) => {
  const response = await api.post(`/api/teacher/modules/${moduleId}/quizzes/create/`, quizData);
  return response.data;
};

export const updateQuiz = async (moduleId, quizId, quizData) => {
  const response = await api.put(`/api/teacher/modules/${moduleId}/quizzes/${quizId}/update/`, quizData);
  return response.data;
};

export const deleteQuiz = async (moduleId, quizId) => {
  const response = await api.delete(`/api/teacher/modules/${moduleId}/quizzes/${quizId}/delete/`);
  return response.data;
};

// Question APIs
export const fetchTeacherQuestions = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);
  if (filters.language) params.append('language', filters.language);
  if (filters.search) params.append('search', filters.search);
  if (filters.active !== undefined) params.append('active', filters.active);
  const response = await api.get(`/api/teacher/questions/?${params.toString()}`);
  return response.data;
};

export const getTeacherQuestion = async (questionId) => {
  const response = await api.get(`/api/teacher/questions/${questionId}/`);
  return response.data;
};

export const createQuestion = async (questionData) => {
  const response = await api.post('/api/teacher/questions/create/', questionData);
  return response.data;
};

export const updateQuestion = async (questionId, questionData) => {
  const response = await api.put(`/api/teacher/questions/${questionId}/update/`, questionData);
  return response.data;
};

export const deleteQuestion = async (questionId) => {
  const response = await api.delete(`/api/teacher/questions/${questionId}/delete/`);
  return response.data;
};

// Quiz Question Management APIs
export const getQuizQuestions = async (quizId) => {
  const response = await api.get(`/api/teacher/quizzes/${quizId}/questions/`);
  return response.data;
};

export const addQuestionToQuiz = async (quizId, questionId, fixed = true) => {
  const response = await api.post(`/api/teacher/quizzes/${quizId}/questions/add/`, {
    question_id: questionId,
    fixed: fixed
  });
  return response.data;
};

export const removeQuestionFromQuiz = async (quizId, questionId) => {
  const response = await api.delete(`/api/teacher/quizzes/${quizId}/questions/${questionId}/remove/`);
  return response.data;
};

export const reorderQuizQuestions = async (quizId, questionOrder) => {
  const response = await api.put(`/api/teacher/quizzes/${quizId}/questions/reorder/`, {
    question_order: questionOrder
  });
  return response.data;
};

// Enrollment Management APIs
export const getCourseEnrollments = async (courseId) => {
  const response = await api.get(`/api/teacher/courses/${courseId}/enrollments/`);
  return response.data;
};

export const approveEnrollment = async (courseId, userId) => {
  const response = await api.post(`/api/teacher/courses/${courseId}/enrollments/${userId}/approve/`);
  return response.data;
};

export const rejectEnrollment = async (courseId, userId) => {
  const response = await api.post(`/api/teacher/courses/${courseId}/enrollments/${userId}/reject/`);
  return response.data;
};

export const removeEnrollment = async (courseId, userId) => {
  const response = await api.delete(`/api/teacher/courses/${courseId}/enrollments/${userId}/remove/`);
  return response.data;
};

// Unit Ordering APIs
export const reorderModuleUnits = async (moduleId, unitOrders) => {
  const response = await api.put(`/api/teacher/modules/${moduleId}/units/reorder/`, {
    unit_orders: unitOrders
  });
  return response.data;
};

export const reorderCourseModules = async (courseId, moduleOrders) => {
  const response = await api.put(`/api/teacher/courses/${courseId}/modules/reorder/`, {
    module_orders: moduleOrders
  });
  return response.data;
};

// Course Analytics API
export const getCourseAnalytics = async (courseId) => {
  const response = await api.get(`/api/teacher/courses/${courseId}/analytics/`);
  return response.data;
};

// Grading System APIs (using axios)
export const fetchGradingSystems = async () => {
  const response = await api.get('/api/teacher/grading-systems/');
  return response.data;
};

export const fetchGradingSystem = async (id) => {
  const response = await api.get(`/api/teacher/grading-systems/${id}/`);
  return response.data;
};

export const createGradingSystem = async (data) => {
  const response = await api.post('/api/teacher/grading-systems/', data);
  return response.data;
};

export const updateGradingSystem = async (id, data) => {
  const response = await api.put(`/api/teacher/grading-systems/${id}/`, data);
  return response.data;
};

export const deleteGradingSystem = async (id) => {
  const response = await api.delete(`/api/teacher/grading-systems/${id}/`);
  return response.data;
};


// COURSE FORUM APIs

// Get all posts for a course
export const getCourseForumPosts = async (courseId) => {
  const response = await api.get(`/api/forum/courses/${courseId}/posts/`);
  return response.data;
};

// Create a new post for a course
export const createCourseForumPost = async (courseId, postData) => {
  const response = await api.post(`/api/forum/courses/${courseId}/posts/`, 
    postData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Delete a course forum post
export const deleteCourseForumPost = async (courseId, postId) => {
  const response = await api.delete(`/api/forum/courses/${courseId}/posts/${postId}/`);
  return response.data;
};


// Get all comments for a post
export const getForumPostComments = async (courseId, postId) => {
  const response = await api.get(`/api/forum/courses/${courseId}/posts/${postId}/comments/`);
  console.log('getForumPostComments response:', response.data); // Debug log
  return response.data;
};

// Create a new comment for a post
export const createForumPostComment = async (courseId, postId, commentData) => {
  const response = await api.post(`/api/forum/courses/${courseId}/posts/${postId}/comments/`, commentData);
  return response.data;
};

// Delete a comment for a course forum post
export const deleteForumPostComment = async (courseId, commentId) => {
  const response = await api.delete(`/api/forum/courses/${courseId}/comments/${commentId}/`);
  return response.data;
};



// LESSON FORUM APIs

// Get all posts for a lesson
export const getLessonForumPosts = async (lessonId) => {
  const response = await api.get(`/api/forum/lessons/${lessonId}/posts/`);
  return response.data;
};

// Create a new post for a lesson
export const createLessonForumPost = async (lessonId, postData) => {
  const response = await api.post(`/api/forum/lessons/${lessonId}/posts/`, postData);
  return response.data;
};

// Get all comments for a lesson post
export const getLessonForumPostComments = async (lessonId, postId) => {
  const response = await api.get(`/api/forum/lessons/${lessonId}/posts/${postId}/comments/`);
  return response.data;
};

// Create a new comment for a lesson post
export const createLessonForumPostComment = async (lessonId, postId, commentData) => {
  const response = await api.post(`/api/forum/lessons/${lessonId}/posts/${postId}/comments/`, commentData);
  return response.data;
};

export default api;
