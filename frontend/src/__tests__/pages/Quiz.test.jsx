import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

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
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
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
  });

  it('renders quiz questions on success', async () => {
    api.startQuiz.mockResolvedValueOnce({
      time_left: 600,
      answerpaper: {
        id: 11,
        questions: [
          {
            id: 101,
            description: '<p>What is 2+2?</p>',
            type: 'integer',
            points: 5,
          }
        ]
      }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
    });

    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter integer...')).toBeInTheDocument();
  });

  it('submits answer correctly', async () => {
    api.startQuiz.mockResolvedValueOnce({
      time_left: 600,
      answerpaper: {
        id: 11,
        questions: [
          {
            id: 101,
            description: 'Test Question',
            type: 'string',
            points: 10,
          }
        ]
      }
    });

    api.submitAnswer.mockResolvedValueOnce({ success: true });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter string...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter string...');
    fireEvent.change(input, { target: { value: 'Test answer' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Answer/i });
    expect(submitBtn).not.toBeDisabled();
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.submitAnswer).toHaveBeenCalledWith(11, 101, ['Test answer']);
    });
  });
  it('opens confirmation modal when Quit Exam is clicked', async () => {
    api.startQuiz.mockResolvedValueOnce({
      time_left: 600,
      answerpaper: {
        id: 11,
        questions: [
          { id: 101, description: 'Test', type: 'string', points: 10 }
        ]
      }
    });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
    });

    const finishBtn = screen.getByRole('button', { name: /Quit Exam/i });
    fireEvent.click(finishBtn);

    expect(screen.getByText('Are you sure you want to quit?')).toBeInTheDocument();
  });

  it('quits the exam and navigates to submission page when confirmed', async () => {
    api.startQuiz.mockResolvedValueOnce({
      time_left: 600,
      answerpaper: {
        id: 11,
        questions: [
          { id: 101, description: 'Test', type: 'string', points: 10 }
        ]
      }
    });
    
    api.quitQuiz.mockResolvedValueOnce({ success: true });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Quit Exam/i }));
    
    const confirmBtn = screen.getByRole('button', { name: /Yes, Quit/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.quitQuiz).toHaveBeenCalledWith(11);
      expect(mockNavigate).toHaveBeenCalledWith('/answerpapers/11/submission');
    });
  });

  it('renders and interacts with mcq question', async () => {
    api.startQuiz.mockResolvedValueOnce({
      time_left: 600,
      answerpaper: {
        id: 11,
        questions: [
          {
            id: 102,
            description: 'Test MCQ',
            type: 'mcq',
            points: 10,
            test_cases: [{ options: ['Opt 1', 'Opt 2'] }]
          }
        ]
      }
    });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Opt 1')).toBeInTheDocument();
    });

    const opt2 = screen.getByLabelText('Opt 2');
    fireEvent.click(opt2);
    expect(opt2).toBeChecked();
  });

  it('renders and interacts with mcc question', async () => {
    api.startQuiz.mockResolvedValueOnce({
      time_left: 600,
      answerpaper: {
        id: 11,
        questions: [
          {
            id: 103,
            description: 'Test MCC',
            type: 'mcc',
            points: 10,
            test_cases: [{ options: ['Opt 1', 'Opt 2'] }]
          }
        ]
      }
    });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Opt 1')).toBeInTheDocument();
    });

    const opt1 = screen.getByLabelText('Opt 1');
    const opt2 = screen.getByLabelText('Opt 2');
    fireEvent.click(opt1);
    fireEvent.click(opt2);
    expect(opt1).toBeChecked();
    expect(opt2).toBeChecked();
  });

  it('handles empty answer submission validation', async () => {
    api.startQuiz.mockResolvedValueOnce({
      time_left: 600,
      answerpaper: {
        id: 11,
        questions: [
          { id: 104, description: 'Test Empty', type: 'string', points: 10 }
        ]
      }
    });
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter string...');
    fireEvent.change(input, { target: { value: '   ' } }); // string of spaces

    const submitBtn = screen.getByRole('button', { name: /Submit Answer/i });
    fireEvent.click(submitBtn);

    expect(alertMock).toHaveBeenCalledWith('Please enter an answer');
    alertMock.mockRestore();
  });

  it('polls for code evaluation result', async () => {
    api.startQuiz.mockResolvedValueOnce({
      time_left: 600,
      answerpaper: {
        id: 11,
        questions: [
          { id: 105, description: 'Test Code', type: 'string', points: 10 }
        ]
      }
    });
    
    api.submitAnswer.mockResolvedValueOnce({ status: 'running', uid: 'test-uid' });
    api.getAnswerResult.mockResolvedValueOnce({ status: 'done', result: JSON.stringify({ success: true }) });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter string...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Enter string...');
    fireEvent.change(input, { target: { value: 'My code answer' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Answer/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.getAnswerResult).toHaveBeenCalledWith('test-uid');
    }, { timeout: 2000 });
  });

  it('renders arrange question', async () => {
    api.startQuiz.mockResolvedValueOnce({
      time_left: 600,
      answerpaper: {
        id: 11,
        questions: [
          {
            id: 106,
            description: 'Test Arrange',
            type: 'arrange',
            points: 10,
            test_cases: [{ options: ['Line 1', 'Line 2'] }]
          }
        ]
      }
    });

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Line 1')).toBeInTheDocument();
      expect(screen.getByText('Line 2')).toBeInTheDocument();
    });
  });
});