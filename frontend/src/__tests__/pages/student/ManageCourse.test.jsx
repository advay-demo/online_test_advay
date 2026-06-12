import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

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
vi.mock('../../../components/student/CourseDiscussion', () => ({ default: (props) => <div data-testid="course-discussion">Discussions</div> }));

describe('Student ManageCourse Component', () => {
  const mockLoadCourseData = vi.fn();
  const mockSetActiveTab = vi.fn();

  const baseCourse = { id: 1, name: 'Test Course', instructions: 'Follow the syllabus' };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(<BrowserRouter><ManageCourseStudent /></BrowserRouter>);

  // ── Loading ────────────────────────────────────────────────────
  it('renders loading state initially', () => {
    useManageCourseStore.mockReturnValue({
      course: null, courseLoading: true, courseError: null, loadCourseData: mockLoadCourseData,
    });
    renderComponent();
    expect(screen.getByText('Loading course...')).toBeInTheDocument();
  });

  // ── Error state ────────────────────────────────────────────────
  it('renders error state', () => {
    useManageCourseStore.mockReturnValue({
      course: null, courseLoading: false, courseError: 'Course access denied', loadCourseData: mockLoadCourseData,
    });
    renderComponent();
    expect(screen.getByText('Course access denied')).toBeInTheDocument();
    expect(screen.getByText('Back to Courses')).toBeInTheDocument();
  });

  it('renders "Course not found" when no course and no error', () => {
    useManageCourseStore.mockReturnValue({
      course: null, courseLoading: false, courseError: null, loadCourseData: mockLoadCourseData,
    });
    renderComponent();
    expect(screen.getByText('Course not found')).toBeInTheDocument();
  });

  // ── Modules tab (default) ──────────────────────────────────────
  it('renders course details and modules tab', () => {
    useManageCourseStore.mockReturnValue({
      course: baseCourse, courseLoading: false, courseError: null,
      activeTab: 'Modules', activeForumTab: null,
      loadCourseData: mockLoadCourseData, setActiveTab: mockSetActiveTab,
    });
    renderComponent();
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('Follow the syllabus')).toBeInTheDocument();
    expect(screen.getByTestId('course-modules')).toBeInTheDocument();
  });

  // ── Discussions tab ────────────────────────────────────────────
  it('renders Discussions tab content', () => {
    useManageCourseStore.mockReturnValue({
      course: baseCourse, courseLoading: false, courseError: null,
      activeTab: 'Discussions', activeForumTab: 'Other',
      loadCourseData: mockLoadCourseData, setActiveTab: mockSetActiveTab,
    });
    renderComponent();
    expect(screen.getByTestId('course-discussion')).toBeInTheDocument();
  });

  it('shows "New Post" button when Discussions + Course Forum tab active', () => {
    useManageCourseStore.mockReturnValue({
      course: baseCourse, courseLoading: false, courseError: null,
      activeTab: 'Discussions', activeForumTab: 'Course Forum',
      loadCourseData: mockLoadCourseData, setActiveTab: mockSetActiveTab,
    });
    renderComponent();
    expect(screen.getByText('New Post')).toBeInTheDocument();
  });

  it('does NOT show "New Post" button on Modules tab', () => {
    useManageCourseStore.mockReturnValue({
      course: baseCourse, courseLoading: false, courseError: null,
      activeTab: 'Modules', activeForumTab: 'Course Forum',
      loadCourseData: mockLoadCourseData, setActiveTab: mockSetActiveTab,
    });
    renderComponent();
    expect(screen.queryByText('New Post')).not.toBeInTheDocument();
  });

  // ── Tab switching ──────────────────────────────────────────────
  it('calls setActiveTab when tab button is clicked', () => {
    useManageCourseStore.mockReturnValue({
      course: baseCourse, courseLoading: false, courseError: null,
      activeTab: 'Modules', activeForumTab: null,
      loadCourseData: mockLoadCourseData, setActiveTab: mockSetActiveTab,
    });
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Discussions' }));
    expect(mockSetActiveTab).toHaveBeenCalledWith('Discussions');
  });

  it('calls loadCourseData with courseId on mount', () => {
    useManageCourseStore.mockReturnValue({
      course: baseCourse, courseLoading: false, courseError: null,
      activeTab: 'Modules', activeForumTab: null,
      loadCourseData: mockLoadCourseData, setActiveTab: mockSetActiveTab,
    });
    renderComponent();
    expect(mockLoadCourseData).toHaveBeenCalledWith('1');
  });

  // ── Course without instructions ────────────────────────────────
  it('shows "Course management" when instructions are absent', () => {
    useManageCourseStore.mockReturnValue({
      course: { id: 1, name: 'No Instr Course' },
      courseLoading: false, courseError: null,
      activeTab: 'Modules', activeForumTab: null,
      loadCourseData: mockLoadCourseData, setActiveTab: mockSetActiveTab,
    });
    renderComponent();
    expect(screen.getByText('Course management')).toBeInTheDocument();
  });
});