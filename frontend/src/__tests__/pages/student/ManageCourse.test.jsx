import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ManageCourseStudent from '../../../pages/student/ManageCourse';
import useManageCourseStore from '../../../store/student/manageCourseStore';

vi.mock('../../../store/student/manageCourseStore', () => ({
  default: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ courseId: '1' }),
  };
});

vi.mock('../../../components/layout/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));
vi.mock('../../../components/student/CourseModules', () => ({ default: () => <div data-testid="course-modules">Modules</div> }));
vi.mock('../../../components/student/CourseDiscussion', () => ({ default: () => <div data-testid="course-discussion">Discussions</div> }));

describe('Student ManageCourse Component', () => {
  const mockLoadCourseData = vi.fn();
  const mockSetActiveTab = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <ManageCourseStudent />
      </BrowserRouter>
    );
  };

  it('renders loading state initially', () => {
    useManageCourseStore.mockReturnValue({
      course: null,
      courseLoading: true,
      courseError: null,
      loadCourseData: mockLoadCourseData,
    });
    
    renderComponent();
    expect(screen.getByText('Loading course...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    useManageCourseStore.mockReturnValue({
      course: null,
      courseLoading: false,
      courseError: 'Course access denied',
      loadCourseData: mockLoadCourseData,
    });
    
    renderComponent();
    expect(screen.getByText('Course access denied')).toBeInTheDocument();
  });

  it('renders course details and modules tab', () => {
    useManageCourseStore.mockReturnValue({
      course: { id: 1, name: 'Test Course' },
      courseLoading: false,
      courseError: null,
      activeTab: 'Modules',
      loadCourseData: mockLoadCourseData,
      setActiveTab: mockSetActiveTab,
    });
    
    renderComponent();
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByTestId('course-modules')).toBeInTheDocument();
  });
});