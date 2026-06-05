import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Lesson from '../../../pages/student/Lesson';
import useManageCourseStore from '../../../store/student/manageCourseStore';
import { fetchLessonDetail, markLessonComplete } from '../../../api/api';

vi.mock('../../../store/student/manageCourseStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../../api/api', () => ({
  fetchLessonDetail: vi.fn(),
  markLessonComplete: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ lessonId: '1' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../../../components/layout/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));

describe('Student Lesson Component', () => {
  const mockLoadCourseModules = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useManageCourseStore.mockReturnValue({
      loadCourseModules: mockLoadCourseModules,
    });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Lesson />
      </BrowserRouter>
    );
  };

  it('renders loading state initially', () => {
    fetchLessonDetail.mockReturnValue(new Promise(() => {}));
    renderComponent();
    expect(screen.getByText('Loading lesson...')).toBeInTheDocument();
  });

  it('renders lesson data and handles completion', async () => {
    fetchLessonDetail.mockResolvedValue({
      id: 1,
      name: 'Test Lesson',
      course_id: 2,
      course_name: 'Test Course',
      module_name: 'Module 1',
      description: 'Lesson content here',
      is_completed: false,
    });
    
    markLessonComplete.mockResolvedValue({});

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    });

    expect(screen.getByText('Lesson content here')).toBeInTheDocument();

    const completeBtn = screen.getByRole('button', { name: /Mark as Complete/i });
    fireEvent.click(completeBtn);
    
    expect(markLessonComplete).toHaveBeenCalledWith('1');
    
    await waitFor(() => {
      expect(screen.getByText('Lesson Completed!')).toBeInTheDocument();
    });
  });
});