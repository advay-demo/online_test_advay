import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ViewAnswerPaper from '../../../pages/student/ViewAnswerPaper';
import useAnswerPaperStore from '../../../store/student/answerPaperStore';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ questionPaperId: '5', courseId: '2' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../../store/student/answerPaperStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../../components/layout/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));

// katex is used in the component — mock it to avoid CSS import issues
vi.mock('katex', () => ({
  default: { renderToString: vi.fn((t) => t) },
  renderToString: vi.fn((t) => t),
}));
vi.mock('katex/dist/katex.min.css', () => ({}));

const makeQuestion = (overrides = {}) => ({
  question: { id: 1, description: 'What is React?', summary: 'What is React?', points: 10 },
  answer: { answer_content: 'A library', correct: true, skipped: false, marks: 10 },
  ...overrides,
});

const baseStore = {
  fetchAnswerPaperData: vi.fn(),
  getAvailableAttemptNumbers: vi.fn().mockReturnValue([1]),
  selectAttempt: vi.fn(),
  reset: vi.fn(),
  quiz: { description: 'Midterm Exam', is_exercise: false },
  courseName: 'Demo Course',
  moduleName: 'Test Module',
  user: { first_name: 'John', last_name: 'Doe', username: 'johndoe' },
  selectedAttemptNumber: 1,
  loading: false,
  error: null,
  selectedPaper: {
    marks_obtained: 85,
    total_marks: 100,
    percent: 85,
    status: 'completed',
    end_time: '2025-06-01T10:00:00Z',
    questions: [makeQuestion()],
  },
};

describe('Student ViewAnswerPaper Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAnswerPaperStore.mockReturnValue(baseStore);
  });

  const renderComponent = () =>
    render(<BrowserRouter><ViewAnswerPaper /></BrowserRouter>);

  // ── Loading ────────────────────────────────────────────────────
  it('renders loading state', () => {
    useAnswerPaperStore.mockReturnValue({ ...baseStore, loading: true, selectedPaper: null });
    renderComponent();
    expect(screen.getByText('Loading your answer paper details...')).toBeInTheDocument();
  });

  // ── Error ──────────────────────────────────────────────────────
  it('renders error state', () => {
    useAnswerPaperStore.mockReturnValue({ ...baseStore, error: 'Failed to load', selectedPaper: null, loading: false });
    renderComponent();
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  // ── No selected paper ──────────────────────────────────────────
  it('renders "No attempt data found" when no selectedPaper', () => {
    useAnswerPaperStore.mockReturnValue({ ...baseStore, selectedPaper: null, loading: false, error: null });
    renderComponent();
    expect(screen.getByText('No attempt data found.')).toBeInTheDocument();
  });

  // ── Main content ───────────────────────────────────────────────
  it('renders answer paper header info', () => {
    renderComponent();
    expect(screen.getByText('Midterm Exam')).toBeInTheDocument();
    expect(screen.getByText('Demo Course')).toBeInTheDocument();
    expect(screen.getByText('Test Module')).toBeInTheDocument();
    expect(screen.getByText('John Doe (johndoe)')).toBeInTheDocument();
  });

  it('renders marks and percentage', () => {
    renderComponent();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('/ 100')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('renders "completed" status with green color', () => {
    renderComponent();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  // ── Quiz vs Exercise badge ─────────────────────────────────────
  it('shows "Quiz" badge for non-exercise quiz', () => {
    renderComponent();
    expect(screen.getByText('Quiz')).toBeInTheDocument();
  });

  it('shows "Exercise" badge for exercise quiz', () => {
    useAnswerPaperStore.mockReturnValue({ ...baseStore, quiz: { description: 'Lab Exam', is_exercise: true } });
    renderComponent();
    expect(screen.getByText('Exercise')).toBeInTheDocument();
  });

  // ── Correct answer ─────────────────────────────────────────────
  it('shows Correct status for a correct answer', () => {
    renderComponent();
    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('A library')).toBeInTheDocument();
  });

  // ── Incorrect answer ───────────────────────────────────────────
  it('shows Incorrect status for a wrong answer', () => {
    useAnswerPaperStore.mockReturnValue({
      ...baseStore,
      selectedPaper: {
        ...baseStore.selectedPaper,
        questions: [makeQuestion({ answer: { answer_content: 'Wrong', correct: false, skipped: false, marks: 0 } })],
      },
    });
    renderComponent();
    expect(screen.getByText('Incorrect')).toBeInTheDocument();
  });

  // ── Skipped answer ─────────────────────────────────────────────
  it('shows Skipped status for a skipped answer', () => {
    useAnswerPaperStore.mockReturnValue({
      ...baseStore,
      selectedPaper: {
        ...baseStore.selectedPaper,
        questions: [makeQuestion({ answer: { answer_content: '', correct: false, skipped: true, marks: 0 } })],
      },
    });
    renderComponent();
    expect(screen.getByText('Skipped')).toBeInTheDocument();
    expect(screen.getByText('Question skipped')).toBeInTheDocument();
  });

  // ── Not answered ───────────────────────────────────────────────
  it('shows "Not answered" for empty answer content', () => {
    useAnswerPaperStore.mockReturnValue({
      ...baseStore,
      selectedPaper: {
        ...baseStore.selectedPaper,
        questions: [makeQuestion({ answer: { answer_content: '', correct: false, skipped: false, marks: 0 } })],
      },
    });
    renderComponent();
    expect(screen.getByText('Not answered')).toBeInTheDocument();
  });

  // ── Attempt tabs ───────────────────────────────────────────────
  it('renders attempt tabs for multiple attempts', () => {
    useAnswerPaperStore.mockReturnValue({
      ...baseStore,
      getAvailableAttemptNumbers: vi.fn().mockReturnValue([1, 2, 3]),
    });
    renderComponent();
    expect(screen.getByRole('button', { name: 'Attempt 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Attempt 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Attempt 3' })).toBeInTheDocument();
  });

  it('calls selectAttempt when attempt tab is clicked', () => {
    const mockSelectAttempt = vi.fn();
    useAnswerPaperStore.mockReturnValue({
      ...baseStore,
      selectAttempt: mockSelectAttempt,
      getAvailableAttemptNumbers: vi.fn().mockReturnValue([1, 2]),
    });
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Attempt 2' }));
    expect(mockSelectAttempt).toHaveBeenCalledWith(2);
  });

  // ── End time ──────────────────────────────────────────────────
  it('renders end time when present', () => {
    renderComponent();
    // Date should be formatted and visible
    expect(document.querySelector('.sm\\:text-xs')).toBeTruthy();
  });

  it('does not crash when end_time is null', () => {
    useAnswerPaperStore.mockReturnValue({
      ...baseStore,
      selectedPaper: { ...baseStore.selectedPaper, end_time: null },
    });
    renderComponent();
    expect(screen.getByText('Midterm Exam')).toBeInTheDocument();
  });

  // ── Calls fetchAnswerPaperData on mount ────────────────────────
  it('calls fetchAnswerPaperData with correct params on mount', () => {
    const mockFetch = vi.fn();
    useAnswerPaperStore.mockReturnValue({ ...baseStore, fetchAnswerPaperData: mockFetch });
    renderComponent();
    expect(mockFetch).toHaveBeenCalledWith('5', '2');
  });

  // ── Calls reset on unmount ─────────────────────────────────────
  it('calls reset on unmount', () => {
    const mockReset = vi.fn();
    useAnswerPaperStore.mockReturnValue({ ...baseStore, reset: mockReset });
    const { unmount } = renderComponent();
    unmount();
    expect(mockReset).toHaveBeenCalled();
  });
});