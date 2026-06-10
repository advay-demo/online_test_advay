import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CourseModules from '../../../components/teacher/CourseModules';
import useManageCourseStore from '../../../store/manageCourseStore';
import { useSandboxStore } from '../../../store/sandboxStore';

vi.mock('../../../store/manageCourseStore');
vi.mock('../../../store/sandboxStore');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ courseId: '123' }),
    useNavigate: () => vi.fn()
  };
});

describe('CourseModules', () => {
  const mockStore = {
    modules: [
      { id: 1, name: 'Module 1', description: 'Desc 1', active: true, learning_units: [] }
    ],
    showModuleForm: false,
    editingModule: null,
    moduleFormData: { name: '', description: '', order: '', active: true },
    handleModuleFormChange: vi.fn(),
    handleCreateModule: vi.fn(),
    handleUpdateModule: vi.fn(),
    setShowModuleForm: vi.fn(),
    setEditingModule: vi.fn(),
    showLessonForm: false,
    editingLesson: null,
    lessonFormData: { name: '', description: '', video_path: '', active: true, files: [] },
    handleLessonFormChange: vi.fn(),
    handleCreateLesson: vi.fn(),
    handleUpdateLesson: vi.fn(),
    setShowLessonForm: vi.fn(),
    setSelectedModule: vi.fn(),
    setEditingLesson: vi.fn(),
    openCreateLesson: vi.fn(),
    openEditModule: vi.fn(),
    handleDeleteModule: vi.fn(),
    openEditLesson: vi.fn(),
    handleDeleteLesson: vi.fn(),
    setModuleFormData: vi.fn(),
    setLessonFormData: vi.fn(),
    showQuizForm: false,
    showExerciseForm: false,
    showDesignModuleModal: false,
    showDesignQuestionPaperModal: false,
    designModule: { learning_units: [], quiz_les_list: [] },
    designingModuleId: null,
    openDesignModule: vi.fn(),
    closeDesignModule: vi.fn(),
    handleAddUnitsToModule: vi.fn(),
    handleRemoveUnitsFromModule: vi.fn(),
    handleChangeModuleUnitOrder: vi.fn(),
    handleChangeModuleUnitPrerequisite: vi.fn(),
    questionPaperDesign: { question_paper: { id: 1, shuffle_questions: true } },
    filteredQuestions: { filtered_questions: [{ id: 1, points: 5 }] },
    designingQuizId: 1,
    designingQuizName: 'Quiz 1',
    openDesignQuestionPaper: vi.fn(),
    closeDesignQuestionPaper: vi.fn(),
    handleAddFixedQuestions: vi.fn(),
    handleRemoveFixedQuestions: vi.fn(),
    handleAddRandomQuestionsSet: vi.fn(),
    handleRemoveRandomQuestionsSet: vi.fn(),
    handleSaveQuestionPaperOptions: vi.fn(),
    handleFilterQuestionPaperQuestions: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useManageCourseStore.mockReturnValue(mockStore);
    useSandboxStore.mockReturnValue({ isGenerating: false, generateTestSandbox: vi.fn() });
  });

  it('renders modules list', () => {
    render(
      <BrowserRouter>
        <CourseModules />
      </BrowserRouter>
    );

    expect(screen.getByText('Course Modules')).toBeInTheDocument();
    expect(screen.getByText('Module 1')).toBeInTheDocument();
  });

  it('opens module form when add module is clicked', () => {
    useManageCourseStore.mockReturnValue({
      ...mockStore,
      showModuleForm: true
    });

    render(
      <BrowserRouter>
        <CourseModules />
      </BrowserRouter>
    );

    expect(screen.getByText('Create New Module')).toBeInTheDocument();
  });

  it('handles module form changes', () => {
    useManageCourseStore.mockReturnValue({
      ...mockStore,
      showModuleForm: true
    });

    render(
      <BrowserRouter>
        <CourseModules />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText('Enter module name *');
    fireEvent.change(nameInput, { target: { value: 'New Module' } });

    expect(mockStore.handleModuleFormChange).toHaveBeenCalled();
  });

  it('submits module form', () => {
    useManageCourseStore.mockReturnValue({
      ...mockStore,
      showModuleForm: true,
      moduleFormData: { name: 'Test', description: '', order: '', active: true }
    });

    render(
      <BrowserRouter>
        <CourseModules />
      </BrowserRouter>
    );

    fireEvent.submit(screen.getByRole('button', { name: 'Create' }));
    expect(mockStore.handleCreateModule).toHaveBeenCalled();
  });

  it('renders lesson form', () => {
    useManageCourseStore.mockReturnValue({
      ...mockStore,
      showLessonForm: true
    });

    render(
      <BrowserRouter>
        <CourseModules />
      </BrowserRouter>
    );

    expect(screen.getByText('Create New Lesson')).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText('Enter lesson Name');
    fireEvent.change(nameInput, { target: { value: 'New Lesson' } });
    expect(mockStore.handleLessonFormChange).toHaveBeenCalled();
  });
});
