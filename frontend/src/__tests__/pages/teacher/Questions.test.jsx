import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Questions from '../../../pages/teacher/Questions';
import useQuestionsStore from '../../../store/questionsStore';
import useQuizStore from '../../../store/quiz_QuestionStore';

vi.mock('../../../store/questionsStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../../store/quiz_QuestionStore', () => ({
  default: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../components/layout/TeacherSidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));
vi.mock('../../../components/teacher/QuestionActionButtons', () => ({ 
  default: ({ onAddClick }) => (
    <div data-testid="action-buttons">
      <button onClick={onAddClick}>Add via Actions</button>
    </div>
  )
}));
vi.mock('../../../components/teacher/AddQuestionModal', () => ({ 
  default: ({ onCancel, onSuccess }) => (
    <div data-testid="add-question-modal">
      <button onClick={onCancel}>Cancel Modal</button>
      <button onClick={onSuccess}>Success Modal</button>
    </div>
  )
}));

describe('Questions Component', () => {
  const mockLoadQuestions = vi.fn();
  const mockDeleteQuestion = vi.fn();
  const mockSetFilters = vi.fn();
  const mockTestQuestion = vi.fn();

  const mockQuestions = [
    {
      id: 1,
      summary: 'What is React?',
      type: 'mcq',
      language: 'N/A',
      points: 1,
      active: true,
      test_cases_count: 4,
    },
    {
      id: 2,
      summary: 'Write a python script',
      type: 'code',
      language: 'python',
      points: 5,
      active: false,
      test_cases_count: 2,
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useQuestionsStore.mockReturnValue({
      questions: mockQuestions,
      loading: false,
      error: null,
      filters: { search: '', type: '', language: '', active: undefined },
      setFilters: mockSetFilters,
      loadQuestions: mockLoadQuestions,
      deleteQuestion: mockDeleteQuestion,
    });
    
    useQuizStore.mockReturnValue({
      testQuestion: mockTestQuestion,
    });

    window.confirm = vi.fn(() => true);
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Questions />
      </BrowserRouter>
    );
  };

  it('renders loading state', () => {
    useQuestionsStore.mockReturnValueOnce({
      questions: [],
      loading: true,
      error: null,
      filters: {},
      loadQuestions: mockLoadQuestions,
    });
    renderComponent();
    // Assuming a spinner is rendered when loading
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    useQuestionsStore.mockReturnValueOnce({
      questions: [],
      loading: false,
      error: 'Failed to load questions',
      filters: {},
      loadQuestions: mockLoadQuestions,
    });
    renderComponent();
    expect(screen.getByText('Failed to load questions')).toBeInTheDocument();
  });

  it('renders list of questions', () => {
    renderComponent();
    expect(mockLoadQuestions).toHaveBeenCalled();
    expect(screen.getByText('What is React?')).toBeInTheDocument();
    expect(screen.getByText('Write a python script')).toBeInTheDocument();
    expect(screen.getByText('MCQ')).toBeInTheDocument();
    expect(screen.getByText('CODE')).toBeInTheDocument();
  });

  it('handles search and filters', () => {
    renderComponent();
    
    const searchInput = screen.getByPlaceholderText('Search questions...');
    fireEvent.change(searchInput, { target: { value: 'React' } });
    expect(mockSetFilters).toHaveBeenCalledWith(expect.objectContaining({ search: 'React' }));

    const typeSelect = screen.getByDisplayValue('Question Types...');
    fireEvent.change(typeSelect, { target: { value: 'mcq' } });
    expect(mockSetFilters).toHaveBeenCalledWith(expect.objectContaining({ type: 'mcq' }));
  });

  it('opens and closes add question modal', () => {
    renderComponent();
    
    // Using the mocked ActionButtons add button
    fireEvent.click(screen.getByText('Add via Actions'));
    
    expect(screen.getByTestId('add-question-modal')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancel Modal'));
    expect(screen.queryByTestId('add-question-modal')).not.toBeInTheDocument();
  });

  it('handles delete question', async () => {
    renderComponent();
    
    const actionMenus = screen.getAllByLabelText('Actions');
    fireEvent.click(actionMenus[0]);
    
    const deleteBtn = screen.getByText('Delete');
    fireEvent.click(deleteBtn);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockDeleteQuestion).toHaveBeenCalledWith(1);
  });

  it('handles test question navigation', async () => {
    mockTestQuestion.mockResolvedValueOnce({
      questionpaper_id: 11,
      module_id: 22,
      course_id: 33,
    });

    renderComponent();
    
    const testBtns = screen.getAllByText('Test');
    fireEvent.click(testBtns[0]);
    
    expect(mockTestQuestion).toHaveBeenCalledWith(1);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/teacher/test-question/11/22/33');
    });
  });
});
