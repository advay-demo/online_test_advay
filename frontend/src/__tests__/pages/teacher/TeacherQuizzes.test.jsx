import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TeacherQuizzes from '../../../pages/teacher/TeacherQuizzes';
import { useQuizGradingStore } from '../../../store/quizGradeStore';

vi.mock('../../../store/quizGradeStore', () => ({
  useQuizGradingStore: vi.fn(),
}));

vi.mock('../../../components/layout/TeacherSidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));

vi.mock('../../../components/teacher/QuizListContent', () => ({ 
  default: ({ onGradeClick, onMonitorClick }) => (
    <div data-testid="quiz-list-content">
      <button onClick={() => onGradeClick({ id: 1 }, { id: 101 })}>Grade Quiz</button>
      <button onClick={() => onMonitorClick({ id: 1 }, { id: 101 })}>Monitor Quiz</button>
    </div>
  )
}));

vi.mock('../../../components/teacher/QuizGradingPanel', () => ({ 
  default: ({ onBack }) => (
    <div data-testid="quiz-grading-panel">
      <button onClick={onBack}>Back from Grading</button>
    </div>
  )
}));

vi.mock('../../../components/teacher/QuizMonitorPanel', () => ({ 
  default: ({ onBack }) => (
    <div data-testid="quiz-monitor-panel">
      <button onClick={onBack}>Back from Monitor</button>
    </div>
  )
}));

describe('TeacherQuizzes Component', () => {
  const mockLoadTeacherQuizzes = vi.fn();
  const mockGetFilteredQuizzes = vi.fn();
  const mockGetQuizStats = vi.fn();
  const mockClearError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useQuizGradingStore.mockReturnValue({
      quizzesByCourse: [],
      loadingQuizzes: false,
      quizzesError: null,
      loadTeacherQuizzes: mockLoadTeacherQuizzes,
      getFilteredQuizzes: mockGetFilteredQuizzes,
      getQuizStats: mockGetQuizStats,
      clearError: mockClearError,
    });
    
    mockGetFilteredQuizzes.mockReturnValue([]);
    mockGetQuizStats.mockReturnValue({ totalQuizzes: 5, totalExercises: 2, totalActive: 3 });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <TeacherQuizzes />
      </BrowserRouter>
    );
  };

  it('renders loading state', () => {
      useQuizGradingStore.mockReturnValueOnce({
      loadingQuizzes: true,
      loadTeacherQuizzes: mockLoadTeacherQuizzes,
      getFilteredQuizzes: mockGetFilteredQuizzes,
      getQuizStats: mockGetQuizStats,
    });
    renderComponent();
    expect(screen.getByText('Loading quizzes...')).toBeInTheDocument();
  });

  it('loads quizzes on mount and renders list content', () => {
    renderComponent();
    expect(mockLoadTeacherQuizzes).toHaveBeenCalled();
    expect(screen.getByTestId('quiz-list-content')).toBeInTheDocument();
  });

  it('switches to grading panel and back', () => {
    renderComponent();
    
    // Click grade quiz
    fireEvent.click(screen.getByText('Grade Quiz'));
    expect(screen.getByTestId('quiz-grading-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('quiz-list-content')).not.toBeInTheDocument();
    
    // Click back
    fireEvent.click(screen.getByText('Back from Grading'));
    expect(screen.getByTestId('quiz-list-content')).toBeInTheDocument();
  });

  it('switches to monitor panel and back', () => {
    renderComponent();
    
    // Click monitor quiz
    fireEvent.click(screen.getByText('Monitor Quiz'));
    expect(screen.getByTestId('quiz-monitor-panel')).toBeInTheDocument();
    expect(screen.queryByTestId('quiz-list-content')).not.toBeInTheDocument();
    
    // Click back
    fireEvent.click(screen.getByText('Back from Monitor'));
    expect(screen.getByTestId('quiz-list-content')).toBeInTheDocument();
  });
});
