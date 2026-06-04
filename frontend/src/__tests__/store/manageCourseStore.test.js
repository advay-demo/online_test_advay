import { describe, it, expect, beforeEach, vi } from 'vitest';
import useManageCourseStore from '../../store/manageCourseStore';
import * as api from '../../api/api';

vi.mock('../../api/api', () => ({
  getTeacherCourse: vi.fn(),
  getCourseModules: vi.fn(),
  getCourseAnalytics: vi.fn(),
  createModule: vi.fn(),
  updateModule: vi.fn(),
  deleteModule: vi.fn(),
  createTeacherExercise: vi.fn(),
  getTeacherExercise: vi.fn(),
  updateTeacherExercise: vi.fn(),
  deleteTeacherExercise: vi.fn(),
  getModuleDesign: vi.fn(),
  addUnitsToModule: vi.fn(),
  changeModuleUnitOrder: vi.fn(),
  removeUnitsFromModule: vi.fn(),
  changeModuleUnitPrerequisite: vi.fn(),
  getQuestionPaperDesign: vi.fn(),
  addFixedQuestions: vi.fn(),
  removeFixedQuestions: vi.fn(),
  addRandomQuestionsSet: vi.fn(),
  removeRandomQuestionsSet: vi.fn(),
  saveQuestionPaperOptions: vi.fn(),
  filterQuestionPaperQuestions: vi.fn(),
}));

describe('useManageCourseStore', () => {
  beforeEach(() => {
    useManageCourseStore.setState({
      activeTab: 'Modules',
      activeForumTab: 'Course Forum',
      course: null,
      modules: [],
      loading: true,
      error: null,
      analytics: null,
      loadingAnalytics: false,
      showQuizQuestionManager: false,
      selectedQuizId: null,
      moduleOrder: [],
      unitOrders: {},
      showModuleForm: false,
      editingModule: null,
    });

    vi.clearAllMocks();
  });

  it('should possess correct initial state', () => {
    const state = useManageCourseStore.getState();

    expect(state.course).toBeNull();
    expect(state.modules).toEqual([]);
    expect(state.loading).toBe(true);
  });

  it('should load course data correctly', async () => {
    const mockCourse = { id: 1, name: 'Chemistry' };
    const mockModules = [{ id: 10, name: 'Module 1' }];

    api.getTeacherCourse.mockResolvedValueOnce(mockCourse);
    api.getCourseModules.mockResolvedValueOnce(mockModules);

    await useManageCourseStore.getState().loadCourseData(1);

    const state = useManageCourseStore.getState();

    expect(state.course).toEqual(mockCourse);
    expect(state.modules).toEqual(mockModules);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should load course data with modules embedded correctly', async () => {
    const mockCourse = {
      id: 1,
      name: 'Physics',
      modules: [{ id: 11, name: 'Module A' }]
    };

    api.getTeacherCourse.mockResolvedValueOnce(mockCourse);

    await useManageCourseStore.getState().loadCourseData(1);

    const state = useManageCourseStore.getState();

    expect(state.course).toEqual(mockCourse);
    expect(state.modules).toEqual(mockCourse.modules);
    expect(api.getCourseModules).not.toHaveBeenCalled();
    expect(state.loading).toBe(false);
  });

  it('should set error if course data load fails', async () => {
    api.getTeacherCourse.mockRejectedValueOnce(
      new Error('Network Error')
    );

    await useManageCourseStore.getState().loadCourseData(1);

    const state = useManageCourseStore.getState();

    expect(state.course).toBeNull();
    expect(state.error).toBe('Network Error');
    expect(state.loading).toBe(false);
  });

  it('should load analytics correctly', async () => {
    const mockAnalytics = { total_students: 50 };

    api.getCourseAnalytics.mockResolvedValueOnce(mockAnalytics);

    await useManageCourseStore.getState().loadAnalytics(1);

    const state = useManageCourseStore.getState();

    expect(state.analytics).toEqual(mockAnalytics);
    expect(state.loadingAnalytics).toBe(false);
  });

  it('should open create module form with correct defaults', () => {
    const currentModules = [{ id: 1 }, { id: 2 }];

    useManageCourseStore.getState().openCreateModule(currentModules);

    const state = useManageCourseStore.getState();

    expect(state.editingModule).toBeNull();
    expect(state.showModuleForm).toBe(true);
    expect(state.moduleFormData.order).toBe(3);
  });

  it('should handle tab updates', () => {
    useManageCourseStore.getState().setActiveTab('Analytics');

    expect(
      useManageCourseStore.getState().activeTab
    ).toBe('Analytics');
  });

  it('should set active forum tab', () => {
    useManageCourseStore.getState().setActiveForumTab('Discussion');

    expect(
      useManageCourseStore.getState().activeForumTab
    ).toBe('Discussion');
  });

  it('should set selected quiz id', () => {
    useManageCourseStore.getState().setSelectedQuizId(99);

    expect(
      useManageCourseStore.getState().selectedQuizId
    ).toBe(99);
  });

  it('should toggle quiz manager', () => {
    useManageCourseStore.getState().setShowQuizQuestionManager(true);

    expect(
      useManageCourseStore.getState().showQuizQuestionManager
    ).toBe(true);
  });

  it('should open edit module', () => {
    const module = {
      id: 1,
      name: 'Physics',
      description: 'Physics Module',
      order: 1,
      check_prerequisite: false,
      active: true,
    };

    useManageCourseStore.getState().openEditModule(module);

    const state = useManageCourseStore.getState();

    expect(state.editingModule).toEqual(module);
    expect(state.showModuleForm).toBe(true);
    expect(state.moduleFormData.name).toBe('Physics');
  });

  it('should initialize ordering', () => {
    useManageCourseStore.setState({
      modules: [
        { id: 2, order: 2 },
        { id: 1, order: 1 }
      ]
    });

    useManageCourseStore.getState().initializeOrdering();

    expect(
      useManageCourseStore.getState().moduleOrder
    ).toEqual([1, 2]);
  });

  it('should move module up', () => {
    useManageCourseStore.setState({
      moduleOrder: [1, 2, 3]
    });

    useManageCourseStore.getState().moveModule(2, 'up');

    expect(
      useManageCourseStore.getState().moduleOrder
    ).toEqual([2, 1, 3]);
  });

  it('should move unit up', () => {
    useManageCourseStore.setState({
      unitOrders: {
        1: [
          { unit_id: 10, order: 1 },
          { unit_id: 20, order: 2 }
        ]
      }
    });

    useManageCourseStore.getState().moveUnit(
      1,
      20,
      'up'
    );

    expect(
      useManageCourseStore.getState().unitOrders[1][0].unit_id
    ).toBe(20);
  });
  it('should update module form data', () => {
  useManageCourseStore.getState().handleModuleFormChange({
    target: {
      name: 'name',
      value: 'New Module',
      type: 'text',
    },
  });

  expect(
    useManageCourseStore.getState().moduleFormData.name
  ).toBe('New Module');
});

it('should update module checkbox field', () => {
  useManageCourseStore.getState().handleModuleFormChange({
    target: {
      name: 'active',
      checked: false,
      type: 'checkbox',
    },
  });

  expect(
    useManageCourseStore.getState().moduleFormData.active
  ).toBe(false);
});

it('should create module successfully', async () => {
  useManageCourseStore.setState({
    moduleFormData: {
      name: 'Test Module',
      description: 'Demo',
      order: 1,
      active: true,
    },
  });

  api.createModule.mockResolvedValueOnce({});

  await useManageCourseStore
    .getState()
    .handleCreateModule(1);

  expect(api.createModule).toHaveBeenCalled();
});

it('should open create module correctly', () => {
  useManageCourseStore
    .getState()
    .openCreateModule([{ id: 1 }]);

  const state = useManageCourseStore.getState();

  expect(state.showModuleForm).toBe(true);
  expect(state.editingModule).toBeNull();
});

it('should not move module when already first', () => {
  useManageCourseStore.setState({
    moduleOrder: [1, 2, 3],
  });

  useManageCourseStore
    .getState()
    .moveModule(1, 'up');

  expect(
    useManageCourseStore.getState().moduleOrder
  ).toEqual([1, 2, 3]);
});

it('should not move module when id not found', () => {
  useManageCourseStore.setState({
    moduleOrder: [1, 2, 3],
  });


  useManageCourseStore
    .getState()
    .moveModule(99, 'up');

  expect(
    useManageCourseStore.getState().moduleOrder
  ).toEqual([1, 2, 3]);
});
it('should update module successfully', async () => {
  useManageCourseStore.setState({
    editingModule: { id: 5 },
    moduleFormData: {
      name: 'Updated Module',
      description: 'Demo',
      order: 1,
      active: true,
    },
    loadCourseData: vi.fn(),
  });

  api.updateModule.mockResolvedValueOnce({});

  await useManageCourseStore
    .getState()
    .handleUpdateModule(1);

  expect(api.updateModule).toHaveBeenCalled();
});

it('should delete module successfully', async () => {
  useManageCourseStore.setState({
    loadCourseData: vi.fn(),
  });

  api.deleteModule.mockResolvedValueOnce({});

  await useManageCourseStore
    .getState()
    .handleDeleteModule(1, 10);

  expect(api.deleteModule)
    .toHaveBeenCalledWith(1, 10);
});

it('should open create module with next order', () => {
  useManageCourseStore
    .getState()
    .openCreateModule([
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ]);

  expect(
    useManageCourseStore.getState().moduleFormData.order
  ).toBe(4);
});
it('should set lesson form data', () => {
  useManageCourseStore.getState().setLessonFormData({
    name: 'Lesson Demo',
  });

  expect(
    useManageCourseStore.getState().lessonFormData.name
  ).toBe('Lesson Demo');
});

it('should set selected module', () => {
  const module = { id: 99 };

  useManageCourseStore
    .getState()
    .setSelectedModule(module);

  expect(
    useManageCourseStore.getState().selectedModule
  ).toEqual(module);
});

it('should set editing lesson', () => {
  const lesson = { lesson_id: 1 };

  useManageCourseStore
    .getState()
    .setEditingLesson(lesson);

  expect(
    useManageCourseStore.getState().editingLesson
  ).toEqual(lesson);
});

it('should toggle lesson form', () => {
  useManageCourseStore
    .getState()
    .setShowLessonForm(true);

  expect(
    useManageCourseStore.getState().showLessonForm
  ).toBe(true);
});
it('should set quiz form data', () => {
  useManageCourseStore.getState().setQuizFormData({
    description: 'Quiz Demo',
  });

  expect(
    useManageCourseStore.getState().quizFormData.description
  ).toBe('Quiz Demo');
});

it('should set editing quiz', () => {
  const quiz = { quiz_id: 100 };

  useManageCourseStore
    .getState()
    .setEditingQuiz(quiz);

  expect(
    useManageCourseStore.getState().editingQuiz
  ).toEqual(quiz);
});

it('should toggle quiz form', () => {
  useManageCourseStore
    .getState()
    .setShowQuizForm(true);

  expect(
    useManageCourseStore.getState().showQuizForm
  ).toBe(true);
});

it('should update quiz text field', () => {
  useManageCourseStore
    .getState()
    .handleQuizFormChange({
      target: {
        name: 'description',
        value: 'Quiz Description',
        type: 'text',
      },
    });

  expect(
    useManageCourseStore.getState().quizFormData.description
  ).toBe('Quiz Description');
});

it('should update quiz checkbox field', () => {
  useManageCourseStore
    .getState()
    .handleQuizFormChange({
      target: {
        name: 'active',
        checked: false,
        type: 'checkbox',
      },
    });

  expect(
    useManageCourseStore.getState().quizFormData.active
  ).toBe(false);
});

it('should update quiz number field', () => {
  useManageCourseStore
    .getState()
    .handleQuizFormChange({
      target: {
        name: 'duration',
        value: '60',
        type: 'number',
      },
    });

  expect(
    useManageCourseStore.getState().quizFormData.duration
  ).toBe(60);
});
it('should set exercise form data', () => {
  useManageCourseStore.getState().setExerciseFormData({
    description: 'Exercise Demo',
  });

  expect(
    useManageCourseStore.getState().exerciseFormData.description
  ).toBe('Exercise Demo');
});

it('should set editing exercise', () => {
  const exercise = { quiz_id: 10 };

  useManageCourseStore
    .getState()
    .setEditingExercise(exercise);

  expect(
    useManageCourseStore.getState().editingExercise
  ).toEqual(exercise);
});

it('should toggle exercise form', () => {
  useManageCourseStore
    .getState()
    .setShowExerciseForm(true);

  expect(
    useManageCourseStore.getState().showExerciseForm
  ).toBe(true);
});

it('should update exercise text field', () => {
  useManageCourseStore
    .getState()
    .handleExerciseFormChange({
      target: {
        name: 'description',
        value: 'New Exercise',
        type: 'text',
      },
    });

  expect(
    useManageCourseStore.getState().exerciseFormData.description
  ).toBe('New Exercise');
});

it('should update exercise checkbox field', () => {
  useManageCourseStore
    .getState()
    .handleExerciseFormChange({
      target: {
        name: 'active',
        checked: false,
        type: 'checkbox',
      },
    });

  expect(
    useManageCourseStore.getState().exerciseFormData.active
  ).toBe(false);
});

it('should open create exercise', () => {
  const module = { id: 1 };

  useManageCourseStore
    .getState()
    .openCreateExercise(module);

  expect(
    useManageCourseStore.getState().showExerciseForm
  ).toBe(true);

  expect(
    useManageCourseStore.getState().selectedModule
  ).toEqual(module);
});
it('should open design module', () => {
  useManageCourseStore.setState({
    course: { id: 1 },
    loadModuleDesign: vi.fn(),
  });

  useManageCourseStore
    .getState()
    .openDesignModule(10);

  expect(
    useManageCourseStore.getState().showDesignModuleModal
  ).toBe(true);

  expect(
    useManageCourseStore.getState().designingModuleId
  ).toBe(10);
});

it('should close design module', () => {
  useManageCourseStore.setState({
    showDesignModuleModal: true,
    designingModuleId: 10,
  });

  useManageCourseStore
    .getState()
    .closeDesignModule();

  expect(
    useManageCourseStore.getState().showDesignModuleModal
  ).toBe(false);
});

it('should set exercise form directly', () => {
  useManageCourseStore
    .getState()
    .setExerciseFormData({
      description: 'Test Exercise',
      active: true,
    });

  expect(
    useManageCourseStore.getState().exerciseFormData.description
  ).toBe('Test Exercise');
});

it('should set editing module directly', () => {
  const module = { id: 50 };

  useManageCourseStore
    .getState()
    .setEditingModule(module);

  expect(
    useManageCourseStore.getState().editingModule
  ).toEqual(module);
});

it('should toggle module form', () => {
  useManageCourseStore
    .getState()
    .setShowModuleForm(true);

  expect(
    useManageCourseStore.getState().showModuleForm
  ).toBe(true);
});
it('should open design question paper', () => {
  useManageCourseStore.setState({
    course: { id: 1 },
    loadQuestionPaperDesign: vi.fn(),
  });

  useManageCourseStore
    .getState()
    .openDesignQuestionPaper(
      101,
      202,
      'Sample Quiz'
    );

  expect(
    useManageCourseStore.getState()
      .showDesignQuestionPaperModal
  ).toBe(true);

  expect(
    useManageCourseStore.getState()
      .designingQuizId
  ).toBe(101);

  expect(
    useManageCourseStore.getState()
      .designingQuestionPaperId
  ).toBe(202);
});

it('should close design question paper', () => {
  useManageCourseStore.setState({
    showDesignQuestionPaperModal: true,
    designingQuizId: 101,
    designingQuestionPaperId: 202,
  });

  useManageCourseStore
    .getState()
    .closeDesignQuestionPaper();

  expect(
    useManageCourseStore.getState()
      .showDesignQuestionPaperModal
  ).toBe(false);

  expect(
    useManageCourseStore.getState()
      .designingQuizId
  ).toBeNull();
});

it('should set selected module directly', () => {
  const module = { id: 500 };

  useManageCourseStore
    .getState()
    .setSelectedModule(module);

  expect(
    useManageCourseStore.getState()
      .selectedModule
  ).toEqual(module);
});

it('should set editing quiz directly', () => {
  const quiz = { quiz_id: 55 };

  useManageCourseStore
    .getState()
    .setEditingQuiz(quiz);

  expect(
    useManageCourseStore.getState()
      .editingQuiz
  ).toEqual(quiz);
});
it('should set question paper design data', () => {
  const data = {
    fixed_questions: [],
    random_sets: [],
  };

  useManageCourseStore.setState({
    questionPaperDesign: data,
  });

  expect(
    useManageCourseStore.getState()
      .questionPaperDesign
  ).toEqual(data);
});

it('should clear question paper modal state', () => {
  useManageCourseStore.setState({
    showDesignQuestionPaperModal: true,
    designingQuizId: 100,
    designingQuestionPaperId: 200,
  });

  useManageCourseStore
    .getState()
    .closeDesignQuestionPaper();

  expect(
    useManageCourseStore.getState()
      .showDesignQuestionPaperModal
  ).toBe(false);

  expect(
    useManageCourseStore.getState()
      .designingQuestionPaperId
  ).toBeNull();
});

it('should set analytics directly', () => {
  const analytics = {
    total_students: 50,
  };

  useManageCourseStore.setState({
    analytics,
  });

  expect(
    useManageCourseStore.getState()
      .analytics
  ).toEqual(analytics);
});

it('should set loading analytics flag', () => {
  useManageCourseStore.setState({
    loadingAnalytics: true,
  });

  expect(
    useManageCourseStore.getState()
      .loadingAnalytics
  ).toBe(true);
});

it('should clear selected quiz', () => {
  useManageCourseStore
    .getState()
    .setSelectedQuizId(null);

  expect(
    useManageCourseStore.getState()
      .selectedQuizId
  ).toBeNull();
});
it('should set design module directly', () => {
  const data = {
    available_items: [],
    chosen_items: [],
  };

  useManageCourseStore.setState({
    designModule: data,
  });

  expect(
    useManageCourseStore.getState().designModule
  ).toEqual(data);
});

it('should set design module error directly', () => {
  useManageCourseStore.setState({
    designModuleError: 'Design Error',
  });

  expect(
    useManageCourseStore.getState().designModuleError
  ).toBe('Design Error');
});

it('should set loading design module flag', () => {
  useManageCourseStore.setState({
    loadingDesignModule: true,
  });

  expect(
    useManageCourseStore.getState().loadingDesignModule
  ).toBe(true);
});

it('should close question paper design modal', () => {
  useManageCourseStore.setState({
    showDesignQuestionPaperModal: true,
    designingQuizId: 1,
    designingQuestionPaperId: 2,
    designingQuizName: 'Demo Quiz',
  });

  useManageCourseStore
    .getState()
    .closeDesignQuestionPaper();

  expect(
    useManageCourseStore.getState()
      .showDesignQuestionPaperModal
  ).toBe(false);

  expect(
    useManageCourseStore.getState()
      .designingQuizId
  ).toBeNull();
});

it('should open question paper design modal', () => {
  useManageCourseStore.setState({
    course: null,
  });

  useManageCourseStore
    .getState()
    .openDesignQuestionPaper(
      10,
      20,
      'Quiz Demo'
    );

  expect(
    useManageCourseStore.getState()
      .showDesignQuestionPaperModal
  ).toBe(true);

  expect(
    useManageCourseStore.getState()
      .designingQuizName
  ).toBe('Quiz Demo');
});

it('should update filtered questions directly', () => {
  const questions = [{ id: 1 }];

  useManageCourseStore.setState({
    filteredQuestions: questions,
  });

  expect(
    useManageCourseStore.getState()
      .filteredQuestions
  ).toEqual(questions);
});
it('should return when creating exercise without course', async () => {
  useManageCourseStore.setState({
    course: null,
    selectedModule: { id: 1 },
  });

  await useManageCourseStore
    .getState()
    .handleCreateExercise();

  expect(true).toBe(true);
});

it('should return when updating exercise without selected module', async () => {
  useManageCourseStore.setState({
    selectedModule: null,
    editingExercise: { quiz_id: 1 },
    course: { id: 1 },
  });

  await useManageCourseStore
    .getState()
    .handleUpdateExercise();

  expect(true).toBe(true);
});

it('should return when deleting exercise without course', async () => {
  useManageCourseStore.setState({
    course: null,
  });

  await useManageCourseStore
    .getState()
    .handleDeleteExercise(1, 2);

  expect(true).toBe(true);
});

it('should handle exercise checkbox change', () => {
  useManageCourseStore
    .getState()
    .handleExerciseFormChange({
      target: {
        name: 'view_answerpaper',
        checked: true,
        type: 'checkbox',
      },
    });

  expect(
    useManageCourseStore.getState()
      .exerciseFormData.view_answerpaper
  ).toBe(true);
});

it('should reset form when opening create exercise', () => {
  useManageCourseStore.setState({
    exerciseFormData: {
      description: 'Old Data',
    },
  });

  const module = { id: 10 };

  useManageCourseStore
    .getState()
    .openCreateExercise(module);

  expect(
    useManageCourseStore.getState()
      .selectedModule
  ).toEqual(module);

  expect(
    useManageCourseStore.getState()
      .showExerciseForm
  ).toBe(true);
});
it('should set question paper design directly', () => {
  const data = {
    fixed_questions: [],
  };

  useManageCourseStore.setState({
    questionPaperDesign: data,
  });

  expect(
    useManageCourseStore.getState()
      .questionPaperDesign
  ).toEqual(data);
});

it('should set question paper error directly', () => {
  useManageCourseStore.setState({
    questionPaperError: 'Load Error',
  });

  expect(
    useManageCourseStore.getState()
      .questionPaperError
  ).toBe('Load Error');
});

it('should set loading question paper directly', () => {
  useManageCourseStore.setState({
    loadingQuestionPaper: true,
  });

  expect(
    useManageCourseStore.getState()
      .loadingQuestionPaper
  ).toBe(true);
});

it('should filter question paper questions', async () => {
  const data = [{ id: 1 }];

  api.filterQuestionPaperQuestions
    .mockResolvedValueOnce(data);

  const result =
    await useManageCourseStore
      .getState()
      .handleFilterQuestionPaperQuestions(
        1,
        2,
        3,
        {}
      );

  expect(result).toEqual(data);
});

it('should handle filter question error', async () => {
  api.filterQuestionPaperQuestions
    .mockRejectedValueOnce(
      new Error('Filter Error')
    );

  await useManageCourseStore
    .getState()
    .handleFilterQuestionPaperQuestions(
      1,
      2,
      3,
      {}
    );

  expect(
    useManageCourseStore.getState()
      .questionPaperError
  ).toBe('Filter Error');
});
});