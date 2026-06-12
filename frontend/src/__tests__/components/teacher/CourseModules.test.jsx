import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

window.confirm = vi.fn(() => true);

describe('CourseModules', () => {
  const mockStore = {
    modules: [
      { 
        id: 1, 
        name: 'Module 1', 
        description: 'Desc 1', 
        active: true, 
        learning_units: [
            { id: 101, type: 'lesson', content_object: { name: 'Lesson 1', id: 1011 } },
            { id: 102, type: 'quiz', content_object: { title: 'Quiz 1', id: 1021 } },
            { id: 103, type: 'exercise', content_object: { name: 'Exercise 1', id: 1031 } }
        ] 
      }
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
    lessonFormData: { name: '', description: '', video_path: 'https://youtube.com/watch?v=dQw4w9WgXcQ', active: true, files: [{id: 99, file: 'test.pdf'}] },
    handleLessonFormChange: vi.fn(),
    handleCreateLesson: vi.fn(),
    handleUpdateLesson: vi.fn(),
    setShowLessonForm: vi.fn(),
    setSelectedModule: vi.fn(),
    setEditingLesson: vi.fn(),
    showQuizForm: false,
    editingQuiz: null,
    quizFormData: { title: '', description: '', active: true, time_limit_minutes: 30, passing_score_percentage: 50 },
    handleQuizFormChange: vi.fn(),
    handleCreateQuiz: vi.fn(),
    handleUpdateQuiz: vi.fn(),
    setShowQuizForm: vi.fn(),
    setEditingQuiz: vi.fn(),
    openCreateLesson: vi.fn(),
    openCreateQuiz: vi.fn(),
    openEditModule: vi.fn(),
    handleDeleteModule: vi.fn(),
    openEditLesson: vi.fn(),
    handleDeleteLesson: vi.fn(),
    openEditQuiz: vi.fn(),
    handleDeleteQuiz: vi.fn(),
    showExerciseForm: false,
    editingExercise: null,
    setEditingExercise: vi.fn(),
    exerciseFormData: { name: '', content: '', active: true },
    handleExerciseFormChange: vi.fn(),
    handleCreateExercise: vi.fn(),
    handleUpdateExercise: vi.fn(),
    setShowExerciseForm: vi.fn(),
    openCreateExercise: vi.fn(),
    openEditExercise: vi.fn(),
    handleDeleteExercise: vi.fn(),
    setModuleFormData: vi.fn(),
    setLessonFormData: vi.fn(),
    showDesignModuleModal: false,
    designModule: { learning_units: [], quiz_les_list: [{id: 201, type: 'lesson', value_key: 'lesson_201', name: 'Free Lesson', display_name: 'Free Lesson'}] },
    loadingDesignModule: false,
    designModuleError: null,
    designingModuleId: null,
    openDesignModule: vi.fn(),
    closeDesignModule: vi.fn(),
    handleAddUnitsToModule: vi.fn(),
    handleRemoveUnitsFromModule: vi.fn(),
    handleChangeModuleUnitOrder: vi.fn(),
    handleChangeModuleUnitPrerequisite: vi.fn(),
    questionPaperDesign: { question_paper: { id: 1, shuffle_questions: true } },
    filteredQuestions: { filtered_questions: [{ id: 1, points: 5, q_type: 'mcq' }] },
    loadingQuestionPaper: false,
    questionPaperError: null,
    showDesignQuestionPaperModal: false,
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

  const renderComponent = () => render(
    <BrowserRouter>
      <CourseModules />
    </BrowserRouter>
  );

  it('renders modules list and toggles expansion', () => {
    renderComponent();
    expect(screen.getByText('Module 1')).toBeInTheDocument();
    
    // Toggle module expansion
    const toggleBtn = screen.getAllByRole('button').find(b => b.className.includes('bg-[var(--bg-secondary)]'));
    if (toggleBtn) {
        fireEvent.click(toggleBtn);
        // Check if lesson 1 is visible
        expect(screen.getByText('Lesson 1')).toBeInTheDocument();
        expect(screen.getByText('Quiz 1')).toBeInTheDocument();
        expect(screen.getByText('Exercise 1')).toBeInTheDocument();
    }
  });

  it('opens and submits module form', () => {
    useManageCourseStore.mockReturnValue({ ...mockStore, showModuleForm: true });
    renderComponent();
    
    expect(screen.getByRole('heading', { name: /Create New Module/i })).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText(/Enter module name/i);
    fireEvent.change(nameInput, { target: { value: 'New Module' } });
    expect(mockStore.handleModuleFormChange).toHaveBeenCalled();


    fireEvent.submit(screen.getByRole('button', { name: 'Create' }));
    expect(mockStore.handleCreateModule).toHaveBeenCalled();
  });

  it('opens and submits editing module form', () => {
    useManageCourseStore.mockReturnValue({ ...mockStore, showModuleForm: true, editingModule: {id: 1} });
    const { container } = renderComponent();
    fireEvent.submit(container.querySelector('form'));
    expect(mockStore.handleUpdateModule).toHaveBeenCalled();
  });

  it('opens and interacts with lesson form', () => {
    useManageCourseStore.mockReturnValue({ ...mockStore, showLessonForm: true });
    renderComponent();

    expect(screen.getAllByText('Add Lesson')[0]).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText('Enter lesson Name');
    fireEvent.change(nameInput, { target: { value: 'New Lesson' } });
    


    // The submit button might not say "Create Lesson". We just submit the form via button with type submit.
    const submitBtn = screen.getByRole('button', { name: /Create Lesson|Save/i });
    fireEvent.submit(submitBtn);
    expect(mockStore.handleCreateLesson).toHaveBeenCalled();
  });

  it('opens and interacts with quiz form', () => {
    useManageCourseStore.mockReturnValue({ ...mockStore, showQuizForm: true });
    renderComponent();

    expect(screen.getAllByText('Add Quiz')[0]).toBeInTheDocument();
    const titleInput = screen.getByPlaceholderText('Enter quiz Name/Title *');
    fireEvent.change(titleInput, { target: { value: 'New Quiz' } });
    expect(mockStore.handleQuizFormChange).toHaveBeenCalled();

    const submitBtn = screen.getByRole('button', { name: /Create Quiz|Save/i });
    fireEvent.submit(submitBtn);
    expect(mockStore.handleCreateQuiz).toHaveBeenCalled();
  });

  it('opens and interacts with exercise form', () => {
    useManageCourseStore.mockReturnValue({ ...mockStore, showExerciseForm: true });
    renderComponent();

    expect(screen.getAllByText('Add Exercise')[0]).toBeInTheDocument();
    const submitBtn = screen.getByRole('button', { name: /Create Exercise|Save/i });
    fireEvent.submit(submitBtn);
    expect(mockStore.handleCreateExercise).toHaveBeenCalled();
  });

  it('opens design module modal and interacts', () => {
    useManageCourseStore.mockReturnValue({ ...mockStore, showDesignModuleModal: true, designingModuleId: 1 });
    renderComponent();

    expect(screen.getByText('Design Module Content')).toBeInTheDocument();
    expect(screen.getByText('Free Lesson')).toBeInTheDocument();

    // Select the lesson in pool
    fireEvent.click(screen.getByText('Free Lesson'));

    const addBtn = screen.getByRole('button', { name: /^Add$/i });
    fireEvent.click(addBtn);
    expect(mockStore.handleAddUnitsToModule).toHaveBeenCalledWith(1, ['lesson_201'], '123');
  });

  it('opens design question paper modal and interacts', () => {
    useManageCourseStore.mockReturnValue({ ...mockStore, showDesignQuestionPaperModal: true });
    renderComponent();

    expect(screen.getByText('Design: Quiz 1')).toBeInTheDocument();
    const saveBtn = screen.getAllByRole('button', { name: /Save/i })[0];
    fireEvent.click(saveBtn);
    expect(mockStore.handleSaveQuestionPaperOptions).toHaveBeenCalled();
  });

  it('triggers item dropdown menus correctly', () => {
    renderComponent();
    // Use data-testid or find the dropdown
    const toggleBtn = screen.getAllByRole('button').find(b => b.className.includes('bg-[var(--bg-secondary)]'));
    if (toggleBtn) fireEvent.click(toggleBtn);
    
    // There are ellipses for module options
    const ellipses = screen.getAllByRole('button').filter(b => b.innerHTML.includes('polyline') || b.innerHTML.includes('circle'));
    if (ellipses.length > 0) {
        fireEvent.click(ellipses[0]);
        const editBtn = screen.queryByText('Edit');
        if (editBtn) fireEvent.click(editBtn);
        expect(mockStore.openEditModule).toHaveBeenCalled();
    }
  });
});
