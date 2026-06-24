import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ViewAnswerPaper from '../../../pages/student/ViewAnswerPaper';
import { fetchAnswerPaper } from '../../../api/api';

vi.mock('../../../api/api', () => ({
  fetchAnswerPaper: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ attemptId: '1' }),
    useNavigate: () => vi.fn(),
  };
});

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
    fetchAnswerPaper.mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Loading paper details...')).toBeInTheDocument();
  });

  it('renders answer paper details', async () => {
    fetchAnswerPaper.mockResolvedValue({
      questionpaper_id: 1,
      questionpaper_title: 'Midterm Exam',
      course_name: 'Demo Course',
      module_name: 'Test Module',
      score: 85,
      total_marks: 100,
      answers: []
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Midterm Exam')).toBeInTheDocument();
    });

    expect(screen.getByText('85 / 100')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
  });
});