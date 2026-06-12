import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QuizGradingPanel from '../../../components/teacher/QuizGradingPanel';

vi.mock('../../../store/quizGradeStore', () => {
  const mockQuizUsersData = { users: [{ id: 1, first_name: 'John', last_name: 'Doe', username: 'j', email: 'j@e.com' }] };
  const mockUserAttemptsData = { attempts: [{ id: 1, attempt_number: 1 }] };
  const mockAttemptGradingData = {
    papers: [{ id: 1, status: 'Graded', questions: [{ question: { id: 1, summary: 'Q1', type: 'mcq', points: 10 }, answer: { id: 1, marks: 5, answer_content: 'A' } }] }]
  };
  const mockLoading = { quizUsers: false, userAttempts: false, attemptGrading: false };
  const mockError = { quizUsers: null, userAttempts: null, attemptGrading: null };

  return {
    useQuizGradingStore: () => ({
      quizUsersData: mockQuizUsersData,
      userAttemptsData: mockUserAttemptsData,
      attemptGradingData: mockAttemptGradingData,
      loading: mockLoading,
      error: mockError,
      loadQuizUsers: vi.fn(),
      loadUserAttempts: vi.fn(),
      loadAttemptGrading: vi.fn(),
      clearQuiz: vi.fn(),
      clearUserAttempts: vi.fn(),
      clearAttemptGrading: vi.fn(),
      submitGrades: vi.fn(),
    })
  };
});

vi.mock('../../../store/quizRegradeStore', () => ({
  default: () => ({
    regradeByQuiz: vi.fn(),
    regradeByUser: vi.fn(),
    regradeByQuestion: vi.fn(),
    loading: false,
    error: null,
    result: null,
    reset: vi.fn()
  })
}));

describe('QuizGradingPanel', () => {
  it('allows user selection, attempt selection, and saves grades', async () => {
    const mockQuiz = { description: 'Test', is_exercise: false };
    const mockCourse = { course_name: 'Course' };
    
    render(
      <BrowserRouter>
        <QuizGradingPanel courseId={1} questionpaperId={1} quiz={mockQuiz} course={mockCourse} onBack={vi.fn()} />
      </BrowserRouter>
    );

    // Select user
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Select attempt
    fireEvent.click(screen.getByText('Attempt 1'));
    
    await waitFor(() => {
      expect(screen.getByText('Q1')).toBeInTheDocument();
    });

    // Save grades
    fireEvent.click(screen.getByText('Save'));
  });
});