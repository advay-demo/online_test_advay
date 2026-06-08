import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ViewAnswerPaper from '../../../pages/student/ViewAnswerPaper';
import useAnswerPaperStore from '../../../store/student/answerPaperStore';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ attemptId: '1' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../../store/student/answerPaperStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../../components/layout/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));

describe('Student ViewAnswerPaper Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <ViewAnswerPaper />
      </BrowserRouter>
    );
  };

  it('renders loading state', () => {
    useAnswerPaperStore.mockReturnValue({
      selectedPaper: null,
      loading: true,
      error: null,
      fetchAnswerPaperData: vi.fn(),
      getAvailableAttemptNumbers: vi.fn().mockReturnValue([1]),
      selectAttempt: vi.fn(),
      reset: vi.fn(),
      quiz: null,
      courseName: '',
      moduleName: '',
      user: null,
      selectedAttemptNumber: 1
    });

    renderComponent();
    expect(screen.getByText('Loading your answer paper details...')).toBeInTheDocument();
  });

  it('renders answer paper details', () => {
    useAnswerPaperStore.mockReturnValue({
      selectedPaper: {
        marks_obtained: 85,
        total_marks: 100,
        percent: 85,
        questions: [
          {
            question: {
              id: 1,
              description: 'What is React?',
              summary: 'What is React?',
              marks: 10,
            },
            answer: {
              answer_content: 'A library',
              correct: true,
              skipped: false,
              marks: 10,
            }
          }
        ]
      },
      quiz: { description: 'Midterm Exam' },
      courseName: 'Demo Course',
      moduleName: 'Test Module',
      user: { first_name: 'John', last_name: 'Doe', username: 'johndoe' },
      loading: false,
      error: null,
      fetchAnswerPaperData: vi.fn(),
      getAvailableAttemptNumbers: vi.fn().mockReturnValue([1]),
      selectAttempt: vi.fn(),
      reset: vi.fn(),
      selectedAttemptNumber: 1
    });

    renderComponent();

    // Check header info
    expect(screen.getByText('Midterm Exam')).toBeInTheDocument();
    expect(screen.getByText('Demo Course')).toBeInTheDocument();
    expect(screen.getByText('John Doe (johndoe)')).toBeInTheDocument();

    // Check score
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('/ 100')).toBeInTheDocument();

    // Check questions
    expect(screen.getAllByText('What is React?')[0]).toBeInTheDocument();
    expect(screen.getByText('A library')).toBeInTheDocument();
  });
});