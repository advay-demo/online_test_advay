import { describe, it, expect, vi, beforeEach } from 'vitest';
import useManageCourseStore from '../../store/manageCourseStore';
import * as api from '../../api/api';

vi.mock('../../api/api', () => ({
  getCourseEnrollments: vi.fn(),
  approveEnrollment: vi.fn(),
  rejectEnrollment: vi.fn(),
  removeEnrollment: vi.fn(),
  getCourseDesign: vi.fn(),
  addModulesToCourse: vi.fn(),
  changeCourseModuleOrder: vi.fn(),
  removeModulesFromCourse: vi.fn(),
  changeCourseModulePrerequisiteCompletion: vi.fn(),
  changeCourseModulePrerequisitePassing: vi.fn(),
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
  getTeacherLesson: vi.fn(),
  createTeacherLesson: vi.fn(),
  updateTeacherLesson: vi.fn(),
  deleteTeacherLesson: vi.fn(),
  getTeacherQuiz: vi.fn(),
  createQuiz: vi.fn(),
  updateQuiz: vi.fn(),
  deleteQuiz: vi.fn(),
  getTeacherExercise: vi.fn(),
  createTeacherExercise: vi.fn(),
  updateTeacherExercise: vi.fn(),
  deleteTeacherExercise: vi.fn(),
}));

describe('useManageCourseStore API interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Enrollments', () => {
    it('loadEnrollments success', async () => {
      const mockData = { enrolled: [{ id: 1 }], pending_requests: [], rejected: [] };
      api.getCourseEnrollments.mockResolvedValue(mockData);

      await useManageCourseStore.getState().loadEnrollments(1);
      const state = useManageCourseStore.getState();
      expect(api.getCourseEnrollments).toHaveBeenCalledWith(1);
      expect(state.enrollments).toEqual(mockData);
      expect(state.loadingEnrollments).toBe(false);
    });

    it('loadEnrollments failure', async () => {
      api.getCourseEnrollments.mockRejectedValue({ response: { data: { error: 'err' } } });
      await useManageCourseStore.getState().loadEnrollments(1);
      expect(useManageCourseStore.getState().enrollmentsError).toBe('err');
    });

    it('approveEnrollments', async () => {
      api.approveEnrollment.mockResolvedValue({});
      api.getCourseEnrollments.mockResolvedValue({ enrolled: [], pending_requests: [], rejected: [] });
      await useManageCourseStore.getState().approveEnrollments(1, [2]);
      expect(api.approveEnrollment).toHaveBeenCalledWith(1, [2], false);
      expect(api.getCourseEnrollments).toHaveBeenCalledWith(1);
    });

    it('rejectEnrollments', async () => {
      api.rejectEnrollment.mockResolvedValue({});
      api.getCourseEnrollments.mockResolvedValue({ enrolled: [], pending_requests: [], rejected: [] });
      await useManageCourseStore.getState().rejectEnrollments(1, [2]);
      expect(api.rejectEnrollment).toHaveBeenCalledWith(1, [2], false);
    });

    it('removeEnrollments', async () => {
      api.removeEnrollment.mockResolvedValue({});
      api.getCourseEnrollments.mockResolvedValue({ enrolled: [], pending_requests: [], rejected: [] });
      await useManageCourseStore.getState().removeEnrollments(1, [2]);
      expect(api.removeEnrollment).toHaveBeenCalledWith(1, [2]);
    });
  });

  describe('Design Course', () => {
    it('loadDesignCourse', async () => {
      api.getCourseDesign.mockResolvedValue({ modules: [] });
      await useManageCourseStore.getState().loadDesignCourse(1);
      expect(useManageCourseStore.getState().designCourse).toEqual({ modules: [] });
    });

    it('handleAddModulesToCourse', async () => {
      api.addModulesToCourse.mockResolvedValue({});
      api.getCourseDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleAddModulesToCourse(1, [2, 3]);
      expect(api.addModulesToCourse).toHaveBeenCalledWith(1, [2, 3]);
    });

    it('handleChangeCourseModuleOrder', async () => {
      api.changeCourseModuleOrder.mockResolvedValue({});
      api.getCourseDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleChangeCourseModuleOrder(1, 2);
      expect(api.changeCourseModuleOrder).toHaveBeenCalledWith(1, 2);
    });

    it('handleRemoveModulesFromCourse', async () => {
      api.removeModulesFromCourse.mockResolvedValue({});
      api.getCourseDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleRemoveModulesFromCourse(1, [2]);
      expect(api.removeModulesFromCourse).toHaveBeenCalledWith(1, [2]);
    });

    it('handleChangeCourseModulePrerequisiteCompletion', async () => {
      api.changeCourseModulePrerequisiteCompletion.mockResolvedValue({});
      api.getCourseDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleChangeCourseModulePrerequisiteCompletion(1, 2);
      expect(api.changeCourseModulePrerequisiteCompletion).toHaveBeenCalledWith(1, 2);
    });

    it('handleChangeCourseModulePrerequisitePassing', async () => {
      api.changeCourseModulePrerequisitePassing.mockResolvedValue({});
      api.getCourseDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleChangeCourseModulePrerequisitePassing(1, 2);
      expect(api.changeCourseModulePrerequisitePassing).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('Module Design', () => {
    it('loadModuleDesign', async () => {
      api.getModuleDesign.mockResolvedValue({ id: 1 });
      await useManageCourseStore.getState().loadModuleDesign(1);
      expect(useManageCourseStore.getState().designModule).toEqual({ id: 1 });
    });

    it('handleAddUnitsToModule', async () => {
      api.addUnitsToModule.mockResolvedValue({});
      api.getModuleDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleAddUnitsToModule(1, [2]);
      expect(api.addUnitsToModule).toHaveBeenCalledWith(1, [2], null);
    });

    it('handleChangeModuleUnitOrder', async () => {
      api.changeModuleUnitOrder.mockResolvedValue({});
      api.getModuleDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleChangeModuleUnitOrder(1, 2);
      expect(api.changeModuleUnitOrder).toHaveBeenCalledWith(1, 2, null);
    });

    it('handleRemoveUnitsFromModule', async () => {
      api.removeUnitsFromModule.mockResolvedValue({});
      api.getModuleDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleRemoveUnitsFromModule(1, [2]);
      expect(api.removeUnitsFromModule).toHaveBeenCalledWith(1, [2], null);
    });

    it('handleChangeModuleUnitPrerequisite', async () => {
      api.changeModuleUnitPrerequisite.mockResolvedValue({});
      api.getModuleDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleChangeModuleUnitPrerequisite(1, 2);
      expect(api.changeModuleUnitPrerequisite).toHaveBeenCalledWith(1, 2, null);
    });
  });

  describe('Question Paper Design', () => {
    it('loadQuestionPaperDesign', async () => {
      api.getQuestionPaperDesign.mockResolvedValue({ id: 1 });
      await useManageCourseStore.getState().loadQuestionPaperDesign(1);
      expect(useManageCourseStore.getState().questionPaperDesign).toEqual({ id: 1 });
    });

    it('handleAddFixedQuestions', async () => {
      api.addFixedQuestions.mockResolvedValue({});
      api.getQuestionPaperDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleAddFixedQuestions(1, 2, 3, [4]);
      expect(api.addFixedQuestions).toHaveBeenCalledWith(1, 2, 3, [4]);
    });

    it('handleRemoveFixedQuestions', async () => {
      api.removeFixedQuestions.mockResolvedValue({});
      api.getQuestionPaperDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleRemoveFixedQuestions(1, 2, 3, [4]);
      expect(api.removeFixedQuestions).toHaveBeenCalledWith(1, 2, 3, [4]);
    });

    it('handleAddRandomQuestionsSet', async () => {
      api.addRandomQuestionsSet.mockResolvedValue({});
      api.getQuestionPaperDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleAddRandomQuestionsSet(1, 2, 3, [4], 10, 5);
      expect(api.addRandomQuestionsSet).toHaveBeenCalledWith(1, 2, 3, [4], 10, 5);
    });

    it('handleRemoveRandomQuestionsSet', async () => {
      api.removeRandomQuestionsSet.mockResolvedValue({});
      api.getQuestionPaperDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleRemoveRandomQuestionsSet(1, 2, 3, [4]);
      expect(api.removeRandomQuestionsSet).toHaveBeenCalledWith(1, 2, 3, [4]);
    });

    it('handleSaveQuestionPaperOptions', async () => {
      api.saveQuestionPaperOptions.mockResolvedValue({});
      api.getQuestionPaperDesign.mockResolvedValue({});
      await useManageCourseStore.getState().handleSaveQuestionPaperOptions(1, 2, 3, { options: true });
      expect(api.saveQuestionPaperOptions).toHaveBeenCalledWith(1, 2, 3, { options: true });
    });

    it('handleFilterQuestionPaperQuestions', async () => {
      api.filterQuestionPaperQuestions.mockResolvedValue({ questions: [] });
      await useManageCourseStore.getState().handleFilterQuestionPaperQuestions(1, 2, 3, { search: 'test' });
      expect(api.filterQuestionPaperQuestions).toHaveBeenCalledWith(1, 2, 3, { search: 'test' });
    });
  });

  describe('Lesson Actions', () => {
    it('handleCreateLesson', async () => {
      useManageCourseStore.setState({ selectedModule: { id: 1 }, course: { id: 2 }, lessonFormData: { name: 'test' } });
      api.createTeacherLesson.mockResolvedValue({});
      useManageCourseStore.setState({ loadCourseData: vi.fn() });
      await useManageCourseStore.getState().handleCreateLesson();
      expect(api.createTeacherLesson).toHaveBeenCalled();
    });

    it('handleUpdateLesson', async () => {
      useManageCourseStore.setState({ selectedModule: { id: 1 }, editingLesson: { id: 1 }, course: { id: 2 }, lessonFormData: { name: 'test' } });
      api.updateTeacherLesson.mockResolvedValue({});
      useManageCourseStore.setState({ loadCourseData: vi.fn() });
      await useManageCourseStore.getState().handleUpdateLesson();
      expect(api.updateTeacherLesson).toHaveBeenCalled();
    });

    it('handleDeleteLesson', async () => {
      api.deleteTeacherLesson.mockResolvedValue({});
      useManageCourseStore.setState({ course: { id: 1 }, loadCourseData: vi.fn() });
      await useManageCourseStore.getState().handleDeleteLesson(2, 3);
      expect(api.deleteTeacherLesson).toHaveBeenCalledWith(1, 2, 3);
    });
  });

  describe('Quiz Actions', () => {
    it('handleCreateQuiz', async () => {
      useManageCourseStore.setState({ selectedModule: { id: 1 }, course: { id: 2 }, quizFormData: { description: 'test' } });
      api.createQuiz.mockResolvedValue({});
      useManageCourseStore.setState({ loadCourseData: vi.fn() });
      await useManageCourseStore.getState().handleCreateQuiz();
      expect(api.createQuiz).toHaveBeenCalled();
    });

    it('handleUpdateQuiz', async () => {
      useManageCourseStore.setState({ selectedModule: { id: 1 }, editingQuiz: { id: 1 }, course: { id: 2 }, quizFormData: { description: 'test' } });
      api.updateQuiz.mockResolvedValue({});
      useManageCourseStore.setState({ loadCourseData: vi.fn() });
      await useManageCourseStore.getState().handleUpdateQuiz();
      expect(api.updateQuiz).toHaveBeenCalled();
    });

    it('handleDeleteQuiz', async () => {
      api.deleteQuiz.mockResolvedValue({});
      useManageCourseStore.setState({ course: { id: 1 }, loadCourseData: vi.fn() });
      await useManageCourseStore.getState().handleDeleteQuiz(2, 3);
      expect(api.deleteQuiz).toHaveBeenCalledWith(1, 2, 3);
    });
  });

  describe('Exercise Actions', () => {
    it('handleCreateExercise', async () => {
      useManageCourseStore.setState({ selectedModule: { id: 1 }, course: { id: 2 }, exerciseFormData: { description: 'test' } });
      api.createTeacherExercise.mockResolvedValue({});
      useManageCourseStore.setState({ loadCourseData: vi.fn() });
      await useManageCourseStore.getState().handleCreateExercise();
      expect(api.createTeacherExercise).toHaveBeenCalled();
    });

    it('handleUpdateExercise', async () => {
      useManageCourseStore.setState({ selectedModule: { id: 1 }, editingExercise: { id: 1 }, course: { id: 2 }, exerciseFormData: { description: 'test' } });
      api.updateTeacherExercise.mockResolvedValue({});
      useManageCourseStore.setState({ loadCourseData: vi.fn() });
      await useManageCourseStore.getState().handleUpdateExercise();
      expect(api.updateTeacherExercise).toHaveBeenCalled();
    });

    it('handleDeleteExercise', async () => {
      api.deleteTeacherExercise.mockResolvedValue({});
      useManageCourseStore.setState({ course: { id: 1 }, loadCourseData: vi.fn() });
      await useManageCourseStore.getState().handleDeleteExercise(2, 3);
      expect(api.deleteTeacherExercise).toHaveBeenCalledWith(1, 2, 3);
    });
  });
});
