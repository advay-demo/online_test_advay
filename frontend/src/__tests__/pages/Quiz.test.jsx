import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Quiz from '../../pages/Quiz';
import * as api from '../../api/api';

vi.mock('../../api/api', () => ({
  startQuiz: vi.fn(),
  submitAnswer: vi.fn(),
  getAnswerResult: vi.fn(),
  quitQuiz: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ courseId: '1', quizId: '10' }),
    useNavigate: () => mockNavigate,
  };
});

describe('Quiz Component', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <Quiz />
      </BrowserRouter>
    );
  };

  it('renders loading state initially', () => {
    api.startQuiz.mockImplementationOnce(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Loading quiz...')).toBeInTheDocument();
  });

  it('renders error state on API failure', async () => {
    api.startQuiz.mockRejectedValueOnce({ response: { data: { message: 'Quiz not ready' } } });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Quiz not ready')).toBeInTheDocument();
    });
    
    // Test back to modules button
    fireEvent.click(screen.getByText('Back to Modules'));
    expect(mockNavigate).toHaveBeenCalledWith('/courses/1/modules');
  });

  it('renders integer question and submits', async () => {
    api.startQuiz.mockResolvedValueOnce({
      time_left: 600,
      answerpaper: {
        id: 11,
        questions: [{ id: 101, description: 'What is 2+2?', type: 'integer', points: 5 }]
      }
    });

    api.submitAnswer.mockResolvedValueOnce({ success: true, points: 5 });

    renderComponent();
    await waitFor(() => expect(screen.getByText('Question 1 of 1')).toBeInTheDocument());

    const input = screen.getByPlaceholderText('Enter integer...');
    fireEvent.change(input, { target: { value: '4' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }));
    
    await waitFor(() => {
      expect(api.submitAnswer).toHaveBeenCalledWith(11, 101, ['4']);
    });
  });

  it('renders mcq question and submits', async () => {
    api.startQuiz.mockResolvedValueOnce({
      time_left: 600,
      answerpaper: {
        id: 11,
        questions: [{ 
          id: 102, type: 'mcq', description: 'MCQ Test', 
          test_cases: [{ options: ['A', 'B', 'C'] }] 
        }]
      }
    });

    api.submitAnswer.mockResolvedValueOnce({ success: true, points: 5 });
    renderComponent();
    await waitFor(() => expect(screen.getByText('MCQ Test')).toBeInTheDocument());

    const optionB = screen.getByLabelText('B');
    fireEvent.click(optionB);

    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }));
    
    await waitFor(() => {
      expect(api.submitAnswer).toHaveBeenCalledWith(11, 102, 'B');
    });
  });

  it('renders mcc question and submits multiple options', async () => {
    api.startQuiz.mockResolvedValueOnce({
      time_left: 600,
      answerpaper: {
        id: 11,
        questions: [{ 
          id: 103, type: 'mcc', description: 'MCC Test', 
          test_cases: [{ options: ['A', 'B', 'C'] }] 
        }]
      }
    });

    api.submitAnswer.mockResolvedValueOnce({ success: false, points: 0 }); // Wrong answer test
    renderComponent();
    await waitFor(() => expect(screen.getByText('MCC Test')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('A'));
    fireEvent.click(screen.getByLabelText('C'));
    // Uncheck A
    fireEvent.click(screen.getByLabelText('A'));

    fireEvent.click(screen.getByRole('button', { name: /Submit Answer/i }));
    
    await waitFor(() => {
      expect(api.submitAnswer).toHaveBeenCalledWith(11, 103, ['C']);
    });
  });


  it('quits quiz when confirmed', async () => {
    api.startQuiz.mockResolvedValueOnce({
      time_left: 600,
      answerpaper: { id: 11, questions: [{ id: 101, type: 'string' }] }
    });
    api.quitQuiz.mockResolvedValueOnce({ success: true });

    renderComponent();
    await waitFor(() => expect(screen.getByRole('button', { name: /Quit Exam/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Quit Exam/i }));
    expect(screen.getByText('Are you sure you want to quit?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Yes, Quit'));
    
    await waitFor(() => {
      expect(api.quitQuiz).toHaveBeenCalledWith(11);
      expect(mockNavigate).toHaveBeenCalledWith('/answerpapers/11/submission');
    });
  });
});