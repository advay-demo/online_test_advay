import axios from 'axios';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      // Token expired or invalid - clear everything
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage'); // Clear zustand persist

      // Only redirect if not already on auth pages (prevent loop)
      const currentPath = window.location.pathname;
      if (currentPath !== '/signin' && currentPath !== '/signup' && currentPath !== '/') {
        window.location.href = '/signin';
      }
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


// Password Change APIs
export const requestPasswordChange = async () => {
  const response = await api.post('/api/auth/password-change/request/');
  return response.data;
};

export const confirmPasswordChange = async (otp, newPassword) => {
  const response = await api.post('/api/auth/password-change/confirm/', {
    code: otp,
    new_password: newPassword
  });
  return response.data;
};

// Moderator Role APIs
export const toggleModeratorRole = async () => {
  const response = await api.post('/api/auth/toggle_moderator/');
  return response.data;
};

export const getModeratorStatus = async () => {
  const response = await api.get('/api/auth/moderator/status/');
  return response.data;
};

// ============================================================
// PROFILE APIs (Common for both students and teachers)
// ============================================================


export const getUserProfile = async () => {
  const response = await api.get('/api/auth/profile/');
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put('/api/auth/profile/', profileData);
  return response.data;
};

export const patchUserProfile = async (profileData) => {
  const response = await api.patch('/api/auth/profile/', profileData);
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
// NOTIFICATION APIs (Common for both students and teachers)
// ============================================================

export const getNotifications = async () => {
  const response = await api.get('/api/notifications/');
  return response.data;
};

export const getUnreadNotificationsCount = async () => {
  const response = await api.get('/api/notifications/unread/count/');
  return response.data;
};

export const markNotificationRead = async (messageUid) => {
  const response = await api.post(`/api/notifications/${messageUid}/mark-read/`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await api.post('/api/notifications/mark-all-read/');
  return response.data;
};

export const markBulkNotificationsRead = async (messageUids) => {
  const response = await api.post('/api/notifications/mark-bulk-read/', {
    message_uids: messageUids
  });
  return response.data;
};

// ============================================================
// ============================================================





// ============================================================
// ============================================================
// QUIZ INTERACTION APIs (For Taking Quizzes)
// ============================================================
// ============================================================


export const apiStartQuiz = async (questionpaperId, moduleId, courseId, attemptNum = null, data = null) => {
  let url;

  if (attemptNum) {
    url = `/api/quiz/start/${attemptNum}/${moduleId}/${questionpaperId}/${courseId}/`;
  } else {
    url = `/api/quiz/start/${questionpaperId}/${moduleId}/${courseId}/`;
  }

  if (data) {
    const response = await api.post(url, data);
    return response.data;
  } else {
    const response = await api.get(url);
    return response.data;
  }
};

/**
 * Quit/abandon a quiz
 */
export const apiQuitQuiz = async (attemptNum, moduleId, questionpaperId, courseId, reason = null) => {
  const url = `/api/quiz/quit/${attemptNum}/${moduleId}/${questionpaperId}/${courseId}/`;

  if (reason !== null) {
    const response = await api.post(url, { reason });
    return response.data;
  } else {
    const response = await api.get(url);
    return response.data;
  }
};

/**
 * Complete/submit a quiz
 */
export const apiCompleteQuiz = async (attemptNum = null, moduleId = null, questionpaperId = null, courseId = null, data = null) => {
  let url;

  if (attemptNum && moduleId && questionpaperId && courseId) {
    url = `/api/quiz/complete/${attemptNum}/${moduleId}/${questionpaperId}/${courseId}/`;
  } else {
    url = `/api/quiz/complete/`;
  }

  if (data) {
    const response = await api.post(url, data);
    return response.data;
  } else {
    const response = await api.get(url);
    return response.data;
  }
};

/**
 * Submit and check an answer for a question
 */
export const apiCheckAnswer = async (questionId, attemptNum, moduleId, questionpaperId, courseId, answerData = null) => {
  const url = `/api/quiz/check/${questionId}/${attemptNum}/${moduleId}/${questionpaperId}/${courseId}/`;

  if (answerData) {
    const response = await api.post(url, answerData);
    return response.data;
  } else {
    const response = await api.get(url);
    return response.data;
  }
};

/**
 * Skip a question and move to the next one
 */
export const apiSkipQuestion = async (questionId, attemptNum, moduleId, questionpaperId, courseId, nextQuestionId = null, codeData = null) => {
  let url;

  if (nextQuestionId) {
    url = `/api/quiz/skip/${questionId}/${nextQuestionId}/${attemptNum}/${moduleId}/${questionpaperId}/${courseId}/`;
  } else {
    url = `/api/quiz/skip/${questionId}/${attemptNum}/${moduleId}/${questionpaperId}/${courseId}/`;
  }

  if (codeData) {
    const response = await api.post(url, codeData);
    return response.data;
  } else {
    const response = await api.get(url);
    return response.data;
  }
};


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

// =====================================================================================================================
// =====================================================================================================================



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


// ============================================================
// GRADING SYSTEM APIs 
// ============================================================


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

// ============================================================
// ============================================================




// ============================================================
// MODULE TAB APIs : Modules, Lessons, Quizzes, Design, Exercise
// ============================================================

// Module APIs ============================================================

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



// Lesson APIs ============================================================


// not reqd 
export const createLesson = async (moduleId, lessonData) => {
  const response = await api.post(`/api/teacher/modules/${moduleId}/lessons/create/`, lessonData);
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
// not reqd 

export const createTeacherLesson = async (courseId, moduleId, lessonData) => {
  const response = await api.post(
    `/api/teacher/courses/${courseId}/modules/${moduleId}/lessons/`,
    lessonData
  );
  return response.data;
};

// Get a particular lesson 

export const getTeacherLesson = async (courseId, moduleId, lessonId) => {
  const response = await api.get(
    `/api/teacher/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/`
  );
  return response.data;
};

// Update a particular lesson 

export const updateTeacherLesson = async (courseId, moduleId, lessonId, lessonData) => {
  const response = await api.put(
    `/api/teacher/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/`,
    lessonData
  );
  return response.data;
};

// Delete a lesson 

export const deleteTeacherLesson = async (courseId, moduleId, lessonId) => {
  const response = await api.delete(
    `/api/teacher/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/`
  );
  return response.data;
};



// DESIGN MODULE APIS ============================================================

export const getModuleDesign = async (moduleId, courseId = null) => {
  let url = `/api/teacher/modules/${moduleId}/design/`;
  if (courseId) {
    url = `/api/teacher/modules/${moduleId}/design/${courseId}/`;
  }
  const response = await api.get(url);
  return response.data;
};


export const addUnitsToModule = async (moduleId, chosenList, courseId = null) => {
  let url = `/api/teacher/modules/${moduleId}/design/`;
  if (courseId) {
    url = `/api/teacher/modules/${moduleId}/design/${courseId}/`;
  }
  const response = await api.post(url, {
    action: "add",
    chosen_list: chosenList, // array of "id:type" strings, e.g. ["5:lesson", "7:quiz"]
  });
  return response.data;
};


export const changeModuleUnitOrder = async (moduleId, orderedList, courseId = null) => {
  let url = `/api/teacher/modules/${moduleId}/design/`;
  if (courseId) {
    url = `/api/teacher/modules/${moduleId}/design/${courseId}/`;
  }
  const response = await api.post(url, {
    action: "change",
    ordered_list: orderedList, // array of "unitId:order" strings, e.g. ["12:1", "13:2"]
  });
  return response.data;
};


export const removeUnitsFromModule = async (moduleId, deleteList, courseId = null) => {
  let url = `/api/teacher/modules/${moduleId}/design/`;
  if (courseId) {
    url = `/api/teacher/modules/${moduleId}/design/${courseId}/`;
  }
  const response = await api.post(url, {
    action: "remove",
    delete_list: deleteList, // array of unit IDs to remove
  });
  return response.data;
};


export const changeModuleUnitPrerequisite = async (moduleId, checkPrereqList, courseId = null) => {
  let url = `/api/teacher/modules/${moduleId}/design/`;
  if (courseId) {
    url = `/api/teacher/modules/${moduleId}/design/${courseId}/`;
  }
  const response = await api.post(url, {
    action: "change_prerequisite",
    check_prereq: checkPrereqList, // array of unit IDs to toggle prerequisite
  });
  return response.data;
};



// Exerise APIs ============================================================

export const createTeacherExercise = async (courseId, moduleId, exerciseData) => {
  const response = await api.post(
    `/api/teacher/courses/${courseId}/modules/${moduleId}/exercises/`,
    exerciseData
  );
  return response.data;
};

// Get a specific exercise (quiz) in a module
export const getTeacherExercise = async (courseId, moduleId, quizId) => {
  const response = await api.get(
    `/api/teacher/courses/${courseId}/modules/${moduleId}/exercises/${quizId}/`
  );
  return response.data;
};

// Update a specific exercise (quiz) in a module
export const updateTeacherExercise = async (courseId, moduleId, quizId, exerciseData) => {
  const response = await api.put(
    `/api/teacher/courses/${courseId}/modules/${moduleId}/exercises/${quizId}/`,
    exerciseData
  );
  return response.data;
};

// Delete a specific exercise (quiz) in a module
export const deleteTeacherExercise = async (courseId, moduleId, quizId) => {
  const response = await api.delete(
    `/api/teacher/courses/${courseId}/modules/${moduleId}/exercises/${quizId}/`
  );
  return response.data;
};



// Quiz APIs ============================================================

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

// ===============================
//  ENROLLMENT TAB APIs
// ===============================

// Get all enrollments (enrolled, requested, rejected) for a course
export const getCourseEnrollments = async (courseId) => {
  const response = await api.get(`/api/teacher/courses/${courseId}/enrollments/`);
  return response.data;
};

// Approve enrollments (single or bulk, from requested or rejected)
export const approveEnrollment = async (courseId, userIds, wasRejected = false) => {
  // userIds: array of user IDs (can be single or multiple)
  // wasRejected: true if approving from rejected list
  const response = await api.post(`/api/teacher/courses/${courseId}/enrollments/`, {
    user_ids: Array.isArray(userIds) ? userIds : [userIds],
    was_rejected: wasRejected,
  });
  return response.data;
};

// Reject enrollments (single or bulk, from requested or enrolled)
export const rejectEnrollment = async (courseId, userIds, wasEnrolled = false) => {
  // userIds: array of user IDs (can be single or multiple)
  // wasEnrolled: true if rejecting from enrolled list
  const response = await api.post(`/api/teacher/courses/${courseId}/enrollments/reject/`, {
    user_ids: Array.isArray(userIds) ? userIds : [userIds],
    was_enrolled: wasEnrolled,
  });
  return response.data;
};

// Remove enrollments (single or bulk, from enrolled)
export const removeEnrollment = async (courseId, userIds) => {
  // userIds: array of user IDs (can be single or multiple)
  const response = await api.post(`/api/teacher/courses/${courseId}/enrollments/remove/`, {
    user_ids: Array.isArray(userIds) ? userIds : [userIds],
  });
  return response.data;
};

// Send email to students
export const teacherSendMail = async (courseId, { subject, body, recipients }) => {
  const response = await api.post(`/api/teacher/courses/${courseId}/send_mail/`, {
    subject,
    body,
    recipients
  });
  return response.data;
};

// Teacher/TA Management APIs
export const searchTeachers = async (courseId, query) => {
  const response = await api.get(`/api/teacher/courses/${courseId}/teachers/search/?query=${encodeURIComponent(query)}`);
  return response.data;
};

export const getCourseTeachers = async (courseId) => {
  const response = await api.get(`/api/teacher/courses/${courseId}/teachers/`);
  return response.data;
};

export const addTeachersToCourse = async (courseId, teacherIds) => {
  const response = await api.post(`/api/teacher/courses/${courseId}/teachers/add/`, {
    teacher_ids: teacherIds
  });
  return response.data;
};

export const removeTeachersFromCourse = async (courseId, teacherIds) => {
  const response = await api.delete(`/api/teacher/courses/${courseId}/teachers/remove/`, {
    data: { teacher_ids: teacherIds }
  });
  return response.data;
};

// Course MD Upload/Download APIs
export const downloadCourseMD = async (courseId) => {
  const response = await api.get(`/api/teacher/courses/${courseId}/md/download/`, {
    responseType: 'blob', // Important for binary file download
  });
  
  // Create a blob URL and trigger download
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `course_${courseId}.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return { success: true };
};

export const uploadCourseMD = async (courseId, file) => {
  const formData = new FormData();
  formData.append('course_upload_md', file);
  
  const response = await api.post(`/api/teacher/courses/${courseId}/md/upload/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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

// ============================================================
// ANALYTICS TAB APIs
// ============================================================

export const getCourseAnalytics = async (courseId) => {
  const response = await api.get(`/api/teacher/courses/${courseId}/analytics/`);
  return response.data;
};

// ============================================================
// ============================================================


// ============================================================
// DESIGN COURSE TAB APIs
// ============================================================


export const getCourseDesign = async (courseId) => {
  const response = await api.get(`/api/teacher/courses/${courseId}/designcourse/`);
  return response.data;
};

// Add modules to course
export const addModulesToCourse = async (courseId, moduleList) => {
  const response = await api.post(`/api/teacher/courses/${courseId}/designcourse/`, {
    action: "add",
    module_list: moduleList, // array of module IDs
  });
  return response.data;
};

// Change module order in course
export const changeCourseModuleOrder = async (courseId, orderedList) => {
  // orderedList: array of "moduleId:order" strings, e.g. ["12:1", "13:2"]
  const response = await api.post(`/api/teacher/courses/${courseId}/designcourse/`, {
    action: "change",
    ordered_list: orderedList.join(","),
  });
  return response.data;
};

// Remove modules from course
export const removeModulesFromCourse = async (courseId, deleteList) => {
  // deleteList: array of module IDs to remove
  const response = await api.post(`/api/teacher/courses/${courseId}/designcourse/`, {
    action: "remove",
    delete_list: deleteList,
  });
  return response.data;
};

// Toggle prerequisite completion for modules
export const changeCourseModulePrerequisiteCompletion = async (courseId, checkPrereqList) => {
  // checkPrereqList: array of module IDs
  const response = await api.post(`/api/teacher/courses/${courseId}/designcourse/`, {
    action: "change_prerequisite_completion",
    check_prereq: checkPrereqList,
  });
  return response.data;
};

// Toggle prerequisite passing for modules
export const changeCourseModulePrerequisitePassing = async (courseId, checkPrereqPassesList) => {
  // checkPrereqPassesList: array of module IDs
  const response = await api.post(`/api/teacher/courses/${courseId}/designcourse/`, {
    action: "change_prerequisite_passing",
    check_prereq_passes: checkPrereqPassesList,
  });
  return response.data;
};

// ============================================================
// ============================================================



// ============================================================
// DISCUSSION FORUM APIs
// ============================================================


// COURSE FORUM APIs ==========================================================

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



// LESSON FORUM APIs ============================================================

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

//=======================================================================
//======================================================================




// ====================================================================
// =====================================================================
// QUESTION MENU : Question Library, , Upload Question , Create question 
// =====================================================================
// ===================================================================== 


// ===========================================
// QUESTION LIBRARY APIs 
// ===========================================

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

export const deleteQuestionFile = async (fileId) => {
  const response = await api.delete(`/api/teacher/questions/files/${fileId}/delete/`);
  return response.data;
};

export const uploadQuestionFile = async (questionId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(
    `/api/teacher/questions/${questionId}/files/upload/`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
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

// Test a question - creates a trial quiz for testing
export const testQuestion = async (questionId) => {
  const response = await api.post(`/api/teacher/questions/${questionId}/test/`);
  return response.data;
};

// ===========================================
// QUESTION Upload APIs 
// ===========================================

export const bulkUploadQuestions = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/teacher/questions/bulk-upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const downloadQuestionTemplate = async () => {
  const response = await api.get('/api/teacher/questions/template/', {
    responseType: 'blob',
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'questions_dump.yaml');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ===========================================
// CREATE QUESTION APIs 
// ===========================================


export const createQuestion = async (questionData) => {
  const response = await api.post('/api/teacher/questions/create/', questionData);
  return response.data;
};




export default api;
