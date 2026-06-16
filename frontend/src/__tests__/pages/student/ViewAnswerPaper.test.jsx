import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ViewAnswerPaper from '../../../pages/student/ViewAnswerPaper';
import useAnswerPaperStore from '../../../store/student/answerPaperStore';

vi.mock('../../../store/student/answerPaperStore', () => ({
  default: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ questionPaperId: '1', courseId: '1' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../../components/layout/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));

describe('Student ViewAnswerPaper Component', () => {
  const mockFetchAnswerPaperData = vi.fn();
  const mockReset = vi.fn();
  const mockSelectAttempt = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAnswerPaperStore.mockReturnValue({
      fetchAnswerPaperData: mockFetchAnswerPaperData,
      quiz: null,
      courseName: null,
      moduleName: null,
      user: null,
      selectedPaper: null,
      selectedAttemptNumber: 1,
      selectAttempt: mockSelectAttempt,
      getAvailableAttemptNumbers: () => [],
      loading: false,
      error: null,
      reset: mockReset,
    });
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
      fetchAnswerPaperData: mockFetchAnswerPaperData,
      getAvailableAttemptNumbers: () => [],
      loading: true,
      reset: mockReset,
    });
    renderComponent();
    expect(screen.getByText('Loading your answer paper details...')).toBeInTheDocument();
  });

  it('renders answer paper details', async () => {
    useAnswerPaperStore.mockReturnValue({
      fetchAnswerPaperData: mockFetchAnswerPaperData,
      quiz: { description: 'Midterm Exam' },
      courseName: 'Demo Course',
      moduleName: 'Test Module',
      user: { first_name: 'John', last_name: 'Doe', username: 'johndoe' },
      selectedPaper: {
        status: 'completed',
        marks_obtained: 85,
        total_marks: 100,
        percent: 85,
        questions: [],
      },
      selectedAttemptNumber: 1,
      selectAttempt: mockSelectAttempt,
      getAvailableAttemptNumbers: () => [1],
      loading: false,
      error: null,
      reset: mockReset,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Midterm Exam')).toBeInTheDocument();
    });

    expect(screen.getAllByText(/85/)[0]).toBeInTheDocument();
    expect(screen.getByText(/\/ 100/)).toBeInTheDocument();
  });
});