import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TestQuestion from '../../../pages/teacher/TestQuestion';
import useQuizStore from '../../../store/quiz_QuestionStore';
import { useAuthStore } from '../../../store/authStore';

vi.mock('../../../store/quiz_QuestionStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ questionpaperId: '1', moduleId: '2', courseId: '3' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../../components/layout/TeacherSidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));
vi.mock('../../../components/teacher/QuestionActionButtons', () => ({ default: () => <div data-testid="action-buttons">ActionButtons</div> }));

describe('TestQuestion Component', () => {
  const mockStartQuiz = vi.fn();
  const mockSubmitAnswer = vi.fn();
  const mockSkipQuestion = vi.fn();
  const mockCompleteQuiz = vi.fn();
  const mockQuitQuiz = vi.fn();
  const mockUpdateTimeLeft = vi.fn();
  const mockClearError = vi.fn();
  const mockResetQuiz = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockReturnValue({
      user: { id: 1, name: 'Teacher' }
    });
    
    useQuizStore.mockReturnValue({
      currentQuestion: null,
      paper: { title: 'Test Paper' },
      loading: false,
      error: null,
      answerResult: null,
      timeLeft: 3600,
      attemptNum: 1,
      startQuiz: mockStartQuiz,
      submitAnswer: mockSubmitAnswer,
      skipQuestion: mockSkipQuestion,
      completeQuiz: mockCompleteQuiz,
      quitQuiz: mockQuitQuiz,
      updateTimeLeft: mockUpdateTimeLeft,
      clearError: mockClearError,
      resetQuiz: mockResetQuiz,
    });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <TestQuestion />
      </BrowserRouter>
    );
  };

  it('initializes quiz on mount', () => {
    renderComponent();
    expect(mockResetQuiz).toHaveBeenCalled();
    expect(mockClearError).toHaveBeenCalled();
    expect(mockStartQuiz).toHaveBeenCalledWith('1', '2', '3', null);
  });

  it('renders a multiple choice question correctly', () => {
    useQuizStore.mockReturnValue({
      currentQuestion: {
        id: 101,
        type: 'mcq',
        test_cases: [{ options: ['Option A', 'Option B'] }]
      },
      paper: { title: 'Test Paper' },
      loading: false,
      error: null,
      timeLeft: 3600,
      startQuiz: mockStartQuiz,
      clearError: mockClearError,
      resetQuiz: mockResetQuiz,
    });
    
    renderComponent();
    
    expect(screen.getByText('Single Correct Choice')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });
});