
import { useQuizGradingStore } from '../../store/quizGradeStore';
import * as api from '../../api/api';

// Mock the API calls
vi.mock('../../api/api', () => ({
  fetchTeacherQuizzesGrouped: vi.fn(),
  getGradingCourses: vi.fn(),
  getQuizUsers: vi.fn(),
  getUserAttempts: vi.fn(),
  gradeUserAttempt: vi.fn(),
}));

describe('useQuizGradingStore', () => {
  beforeEach(() => {
    useQuizGradingStore.getState().reset();
    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const state = useQuizGradingStore.getState();
    expect(state.courses).toEqual([]);
    expect(state.selectedCourse).toBeNull();
    expect(state.loading.courses).toBe(false);
  });

  it('should load teacher quizzes successfully', async () => {
    const mockQuizzes = [{ course_id: 1, course_name: 'Math', quizzes: [] }];
    api.fetchTeacherQuizzesGrouped.mockResolvedValueOnce(mockQuizzes);

    const result = await useQuizGradingStore.getState().loadTeacherQuizzes();
    
    expect(result).toEqual(mockQuizzes);
    const state = useQuizGradingStore.getState();
    expect(state.quizzesByCourse).toEqual(mockQuizzes);
    expect(state.loadingQuizzes).toBe(false);
  });

  it('should handle failure to load teacher quizzes', async () => {
    api.fetchTeacherQuizzesGrouped.mockRejectedValueOnce({
      response: { data: { error: 'Failed' } }
    });

    await expect(useQuizGradingStore.getState().loadTeacherQuizzes()).rejects.toThrow();
    
    const state = useQuizGradingStore.getState();
    expect(state.quizzesError).toBe('Failed');
    expect(state.loadingQuizzes).toBe(false);
  });

  it('should manipulate selection states correctly', () => {
    const mockCourse = { id: 1, name: 'Science' };
    const mockModule = { id: 2, name: 'Physics' };
    
    useQuizGradingStore.getState().selectCourse(mockCourse);
    expect(useQuizGradingStore.getState().selectedCourse).toEqual(mockCourse);
    
    useQuizGradingStore.getState().selectModule(mockModule);
    expect(useQuizGradingStore.getState().selectedModule).toEqual(mockModule);

    useQuizGradingStore.getState().clearCourse();
    expect(useQuizGradingStore.getState().selectedCourse).toBeNull();
    expect(useQuizGradingStore.getState().selectedModule).toBeNull();
  });

  it('should get correct quiz stats', () => {
    useQuizGradingStore.setState({
      quizzesByCourse: [
        {
          course_id: 1,
          quizzes: [
            { id: 1, is_exercise: false, active: true },
            { id: 2, is_exercise: true, active: false }
          ]
        }
      ]
    });

    const stats = useQuizGradingStore.getState().getQuizStats();
    expect(stats.totalQuizzes).toBe(1);
    expect(stats.totalExercises).toBe(1);
    expect(stats.totalActive).toBe(1);
  });
  it('should load grading courses successfully', async () => {
  const mockData = {
    courses: [{ id: 1, name: 'Course 1' }]
  };

  api.getGradingCourses.mockResolvedValueOnce(mockData);

  const result = await useQuizGradingStore
    .getState()
    .loadGradingCourses();

  expect(result).toEqual(mockData);
  expect(
    useQuizGradingStore.getState().courses
  ).toEqual(mockData.courses);
});

it('should handle grading courses failure', async () => {
  api.getGradingCourses.mockRejectedValueOnce({
    response: {
      data: { error: 'Failed to load grading courses' }
    }
  });

  await expect(
    useQuizGradingStore.getState().loadGradingCourses()
  ).rejects.toBeDefined();

  expect(
    useQuizGradingStore.getState().error.courses
  ).toBe('Failed to load grading courses');
});

it('should load quiz users successfully', async () => {
  const mockData = {
    users: [{ id: 1, name: 'Student' }]
  };

  api.getQuizUsers.mockResolvedValueOnce(mockData);

  const result = await useQuizGradingStore
    .getState()
    .loadQuizUsers(1, 1);

  expect(result).toEqual(mockData);
  expect(
    useQuizGradingStore.getState().quizUsersData
  ).toEqual(mockData);
});

it('should load user attempts successfully', async () => {
  const mockData = {
    attempts: [{ id: 1 }]
  };

  api.getUserAttempts.mockResolvedValueOnce(mockData);

  const result = await useQuizGradingStore
    .getState()
    .loadUserAttempts(1, 1, 1);

  expect(result).toEqual(mockData);
  expect(
    useQuizGradingStore.getState().userAttemptsData
  ).toEqual(mockData);
});

it('should load attempt grading successfully', async () => {
  const mockData = {
    papers: [{ id: 1 }]
  };

  api.gradeUserAttempt.mockResolvedValueOnce(mockData);

  const result = await useQuizGradingStore
    .getState()
    .loadAttemptGrading(1, 1, 1, 1);

  expect(result).toEqual(mockData);
  expect(
    useQuizGradingStore.getState().attemptGradingData
  ).toEqual(mockData);
});

it('should clear errors', () => {
  useQuizGradingStore.setState({
    quizzesError: 'Error',
    error: {
      courses: 'Error',
      quizUsers: 'Error',
      userAttempts: 'Error',
      attemptGrading: 'Error',
      submittingGrades: 'Error',
    }
  });

  useQuizGradingStore.getState().clearErrors();

  expect(
    useQuizGradingStore.getState().quizzesError
  ).toBeNull();

  expect(
    useQuizGradingStore.getState().error.courses
  ).toBeNull();
});

it('should reset store', () => {
  useQuizGradingStore.setState({
    selectedCourse: { id: 1 },
    successMessage: 'Done',
  });

  useQuizGradingStore.getState().reset();

  expect(
    useQuizGradingStore.getState().selectedCourse
  ).toBeNull();

  expect(
    useQuizGradingStore.getState().successMessage
  ).toBeNull();
});
it('should handle quiz users failure', async () => {
  api.getQuizUsers.mockRejectedValueOnce({
    response: {
      data: { error: 'Users Error' }
    }
  });

  await expect(
    useQuizGradingStore.getState().loadQuizUsers(1, 1)
  ).rejects.toBeDefined();
});

it('should handle user attempts failure', async () => {
  api.getUserAttempts.mockRejectedValueOnce({
    response: {
      data: { error: 'Attempts Error' }
    }
  });

  await expect(
    useQuizGradingStore.getState().loadUserAttempts(
      1,
      1,
      1
    )
  ).rejects.toBeDefined();
});

it('should handle attempt grading failure', async () => {
  api.gradeUserAttempt.mockRejectedValueOnce({
    response: {
      data: { error: 'Grading Error' }
    }
  });

  await expect(
    useQuizGradingStore.getState().loadAttemptGrading(
      1,
      1,
      1,
      1
    )
  ).rejects.toBeDefined();
});
it('should filter quizzes by search', () => {
  useQuizGradingStore.setState({
    quizzesByCourse: [
      {
        quizzes: [
          {
            id: 1,
            name: 'Java Quiz',
            module_name: 'Java Module',
            is_exercise: false,
            active: true
          },
          {
            id: 2,
            name: 'Python Quiz',
            module_name: 'Python Module',
            is_exercise: false,
            active: true
          }
        ]
      }
    ]
  });

  const result =
  useQuizGradingStore
    .getState()
    .getFilteredQuizzes('Java', 'all');
  expect(result.length).toBe(1);
  });

it('should clear success message', () => {
  useQuizGradingStore.setState({
    successMessage: 'Completed'
  });

  useQuizGradingStore
    .getState()
    .clearSuccessMessage();

  expect(
    useQuizGradingStore.getState().successMessage
  ).toBeNull();
});

it('should navigate to courses level', () => {
  useQuizGradingStore.setState({
    selectedCourse: { id: 1 },
    selectedModule: { id: 2 },
    selectedQuiz: { id: 3 }
  });

  useQuizGradingStore
    .getState()
    .navigateToLevel('courses');

  expect(
    useQuizGradingStore.getState().selectedCourse
  ).toBeNull();
});

it('should navigate to course level', () => {
  useQuizGradingStore.setState({
    selectedCourse: { id: 1 },
    selectedModule: { id: 2 },
    selectedQuiz: { id: 3 }
  });

  useQuizGradingStore
    .getState()
    .navigateToLevel('course');

  expect(
    useQuizGradingStore.getState().selectedModule
  ).toBeNull();
});

it('should navigate to module level', () => {
  useQuizGradingStore.setState({
    selectedCourse: { id: 1 },
    selectedModule: { id: 2 },
    selectedQuiz: { id: 3 }
  });

  useQuizGradingStore
    .getState()
    .navigateToLevel('module');

  expect(
    useQuizGradingStore.getState().selectedQuiz
  ).toBeNull();
});

it('should clear a single error', () => {
  useQuizGradingStore.setState({
    error: {
      courses: 'Error',
      quizUsers: null,
      userAttempts: null,
      attemptGrading: null,
      submittingGrades: null
    }
  });

  useQuizGradingStore
    .getState()
    .clearError('courses');

  expect(
    useQuizGradingStore.getState().error.courses
  ).toBeNull();
});
it('should select quiz and clear old data', () => {
  const quiz = { id: 1, name: 'Quiz 1' };

  useQuizGradingStore.setState({
    userAttemptsData: { old: true },
    attemptGradingData: { old: true },
  });

  useQuizGradingStore.getState().selectQuiz(quiz);

  expect(
    useQuizGradingStore.getState().selectedQuiz
  ).toEqual(quiz);

  expect(
    useQuizGradingStore.getState().userAttemptsData
  ).toBeNull();

  expect(
    useQuizGradingStore.getState().attemptGradingData
  ).toBeNull();
});

it('should clear quiz selection', () => {
  useQuizGradingStore.setState({
    selectedQuiz: { id: 1 },
    quizUsersData: { users: [] },
    userAttemptsData: { attempts: [] },
    attemptGradingData: { papers: [] },
  });

  useQuizGradingStore.getState().clearQuiz();

  expect(
    useQuizGradingStore.getState().selectedQuiz
  ).toBeNull();
});

it('should clear user attempts', () => {
  useQuizGradingStore.setState({
    userAttemptsData: { attempts: [1] },
    attemptGradingData: { papers: [1] },
  });

  useQuizGradingStore.getState().clearUserAttempts();

  expect(
    useQuizGradingStore.getState().userAttemptsData
  ).toBeNull();

  expect(
    useQuizGradingStore.getState().attemptGradingData
  ).toBeNull();
});

it('should clear attempt grading', () => {
  useQuizGradingStore.setState({
    attemptGradingData: { papers: [1] },
  });

  useQuizGradingStore.getState().clearAttemptGrading();

  expect(
    useQuizGradingStore.getState().attemptGradingData
  ).toBeNull();
});

it('should detect loading state', () => {
  useQuizGradingStore.setState({
    loadingQuizzes: true,
  });

  expect(
    useQuizGradingStore.getState().isLoading()
  ).toBe(true);
});

it('should detect errors', () => {
  useQuizGradingStore.setState({
    quizzesError: 'Error',
  });

  expect(
    useQuizGradingStore.getState().hasErrors()
  ).toBe(true);
});

it('should return all errors', () => {
  useQuizGradingStore.setState({
    quizzesError: 'Quiz Error',
    error: {
      courses: 'Course Error',
      quizUsers: null,
      userAttempts: null,
      attemptGrading: null,
      submittingGrades: null,
    },
  });

  const errors =
    useQuizGradingStore.getState().getAllErrors();

  expect(errors.length).toBe(2);
});

it('should return current quiz users', () => {
  useQuizGradingStore.setState({
    quizUsersData: {
      users: [{ id: 1 }],
    },
  });

  expect(
    useQuizGradingStore.getState()
      .getCurrentQuizUsers()
  ).toEqual([{ id: 1 }]);
});

it('should return current user attempts', () => {
  useQuizGradingStore.setState({
    userAttemptsData: {
      attempts: [{ id: 1 }],
    },
  });

  expect(
    useQuizGradingStore.getState()
      .getCurrentUserAttempts()
  ).toEqual([{ id: 1 }]);
});

it('should return current attempt papers', () => {
  useQuizGradingStore.setState({
    attemptGradingData: {
      papers: [{ id: 1 }],
    },
  });

  expect(
    useQuizGradingStore.getState()
      .getCurrentAttemptPapers()
  ).toEqual([{ id: 1 }]);
});
it('should select quiz and load users', async () => {
  const quiz = { id: 1 };

  api.getQuizUsers.mockResolvedValueOnce({
    users: [{ id: 1 }]
  });

  await useQuizGradingStore
    .getState()
    .selectQuizAndLoadUsers(quiz, 10);

  expect(
    useQuizGradingStore.getState().selectedQuiz
  ).toEqual(quiz);
});

it('should submit grades successfully', async () => {
  api.gradeUserAttempt.mockResolvedValueOnce({
    success: true
  });

  api.gradeUserAttempt.mockResolvedValueOnce({
    papers: []
  });

  await useQuizGradingStore
    .getState()
    .submitGrades(
      1,
      1,
      1,
      1,
      { marks: 10 }
    );

  expect(
    useQuizGradingStore.getState().successMessage
  ).toBe('Grades submitted successfully');
});

it('should handle submit grades failure', async () => {
  api.gradeUserAttempt.mockRejectedValueOnce({
    response: {
      data: {
        error: 'Submit Failed'
      }
    }
  });

  await expect(
    useQuizGradingStore.getState().submitGrades(
      1,
      1,
      1,
      1,
      {}
    )
  ).rejects.toBeDefined();

  expect(
    useQuizGradingStore.getState()
      .error.submittingGrades
  ).toBe('Submit Failed');
});

it('should get all quizzes from course', () => {
  useQuizGradingStore.setState({
    selectedCourse: {
      learning_module: [
        {
          id: 1,
          name: 'Module',
          learning_unit: [
            {
              id: 11,
              type: 'quiz',
              order: 1,
              quiz: { id: 100 }
            }
          ]
        }
      ]
    }
  });

  const quizzes =
    useQuizGradingStore
      .getState()
      .getAllQuizzesFromCourse();

  expect(quizzes.length).toBe(1);
});

it('should get quizzes from module', () => {
  useQuizGradingStore.setState({
    selectedModule: {
      learning_unit: [
        {
          id: 1,
          order: 1,
          check_prerequisite: false,
          type: 'quiz',
          quiz: { id: 99 }
        }
      ]
    }
  });

  const quizzes =
    useQuizGradingStore
      .getState()
      .getQuizzesFromModule();

  expect(quizzes.length).toBe(1);
});

it('should navigate to quiz level', () => {
  useQuizGradingStore.setState({
    userAttemptsData: {
      attempts: [1]
    }
  });

  useQuizGradingStore
    .getState()
    .navigateToLevel('quiz');

  expect(
    useQuizGradingStore.getState()
      .userAttemptsData
  ).toBeNull();
});

it('should navigate to user level', () => {
  useQuizGradingStore.setState({
    attemptGradingData: {
      papers: [1]
    }
  });

  useQuizGradingStore
    .getState()
    .navigateToLevel('user');

  expect(
    useQuizGradingStore.getState()
      .attemptGradingData
  ).toBeNull();
});
it('should get current paper by id', () => {
  useQuizGradingStore.setState({
    attemptGradingData: {
      papers: [
        { id: 1, questions: [] },
        { id: 2, questions: [] }
      ]
    }
  });

  const paper =
    useQuizGradingStore
      .getState()
      .getCurrentPaper(2);

  expect(paper.id).toBe(2);
});

it('should return null when paper does not exist', () => {
  useQuizGradingStore.setState({
    attemptGradingData: null
  });

  const paper =
    useQuizGradingStore
      .getState()
      .getCurrentPaper(1);

  expect(paper).toBeNull();
});

it('should get paper questions using paper id', () => {
  useQuizGradingStore.setState({
    attemptGradingData: {
      papers: [
        {
          id: 1,
          questions: [{ id: 101 }]
        }
      ]
    }
  });

  const questions =
    useQuizGradingStore
      .getState()
      .getCurrentPaperQuestions(1);

  expect(questions.length).toBe(1);
});

it('should get first paper questions when no paper id is supplied', () => {
  useQuizGradingStore.setState({
    attemptGradingData: {
      papers: [
        {
          id: 1,
          questions: [{ id: 201 }]
        }
      ]
    }
  });

  const questions =
    useQuizGradingStore
      .getState()
      .getCurrentPaperQuestions();

  expect(questions.length).toBe(1);
});

it('should return empty array when no papers exist', () => {
  useQuizGradingStore.setState({
    attemptGradingData: {
      papers: []
    }
  });

  const questions =
    useQuizGradingStore
      .getState()
      .getCurrentPaperQuestions();

  expect(questions).toEqual([]);
});

it('should execute default navigation branch', () => {
  useQuizGradingStore
    .getState()
    .navigateToLevel('unknown');

  expect(true).toBe(true);
});
it('should clear quizzes error specifically', () => {
  useQuizGradingStore.setState({
    quizzesError: 'Quiz Error'
  });

  useQuizGradingStore
    .getState()
    .clearError('quizzes');

  expect(
    useQuizGradingStore.getState().quizzesError
  ).toBeNull();
});
});
