import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ManageCourse from '../../../pages/teacher/ManageCourse';
import useManageCourseStore from '../../../store/manageCourseStore';

vi.mock('../../../store/manageCourseStore', () => ({
  default: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ courseId: '123' }),
  };
});

// Mock all the sub-components to isolate ManageCourse testing
vi.mock('../../../components/layout/TeacherSidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));
vi.mock('../../../components/teacher/CourseAnalytics', () => ({ default: () => <div data-testid="course-analytics">CourseAnalytics</div> }));
vi.mock('../../../components/teacher/CourseDiscussion', () => ({ default: () => <div data-testid="course-discussion">CourseDiscussion</div> }));
vi.mock('../../../components/teacher/CourseEnrollement', () => ({ default: () => <div data-testid="course-enrollment">CourseEnrollment</div> }));
vi.mock('../../../components/teacher/CourseModules', () => ({ default: () => <div data-testid="course-modules">CourseModules</div> }));
vi.mock('../../../components/teacher/CourseDesign', () => ({ default: () => <div data-testid="course-design">CourseDesign</div> }));
vi.mock('../../../components/teacher/CourseMail', () => ({ default: () => <div data-testid="course-mail">CourseMail</div> }));
vi.mock('../../../components/teacher/CourseTeachers', () => ({ default: () => <div data-testid="course-teachers">CourseTeachers</div> }));
vi.mock('../../../components/teacher/CourseMembers', () => ({ default: () => <div data-testid="course-members">CourseMembers</div> }));
vi.mock('../../../components/teacher/CourseMDManager', () => ({ default: () => <div data-testid="course-md-manager">CourseMDManager</div> }));

describe('ManageCourse Component', () => {
  const mockLoadCourseData = vi.fn();
  const mockLoadEnrollments = vi.fn();
  const mockLoadAnalytics = vi.fn();
  const mockInitializeOrdering = vi.fn();
  const mockSetActiveTab = vi.fn();
  const mockOpenCreateModule = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useManageCourseStore.mockReturnValue({
      course: { id: 123, name: 'Advanced React', instructions: 'Learn hooks' },
      modules: [],
      loading: false,
      error: null,
      activeTab: 'Enrollment',
      activeForumTab: 'Course Forum',
      setActiveTab: mockSetActiveTab,
      loadCourseData: mockLoadCourseData,
      loadEnrollments: mockLoadEnrollments,
      loadAnalytics: mockLoadAnalytics,
      initializeOrdering: mockInitializeOrdering,
      openCreateModule: mockOpenCreateModule,
    });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <ManageCourse />
      </BrowserRouter>
    );
  };

  it('renders loading state', () => {
    useManageCourseStore.mockReturnValueOnce({
      loading: true,
      loadCourseData: mockLoadCourseData,
      loadEnrollments: mockLoadEnrollments,
      loadAnalytics: mockLoadAnalytics,
      modules: [],
      activeTab: 'Enrollment',
    });
    renderComponent();
    expect(screen.getByText('Loading course...')).toBeInTheDocument();
  });

  it('renders error state when course not found', () => {
    useManageCourseStore.mockReturnValueOnce({
      loading: false,
      error: 'Course not found',
      course: null,
      loadCourseData: mockLoadCourseData,
      loadEnrollments: mockLoadEnrollments,
      loadAnalytics: mockLoadAnalytics,
      modules: [],
      activeTab: 'Enrollment',
    });
    renderComponent();
    expect(screen.getByText('Course not found')).toBeInTheDocument();
    expect(screen.getByText('Back to Courses')).toBeInTheDocument();
  });

  it('loads course data on mount', () => {
    renderComponent();
    expect(mockLoadCourseData).toHaveBeenCalledWith('123');
    expect(screen.getByText('Advanced React')).toBeInTheDocument();
    expect(screen.getByText('Learn hooks')).toBeInTheDocument();
  });

  it('loads enrollments when Enrollment tab is active', () => {
    renderComponent();
    expect(mockLoadEnrollments).toHaveBeenCalledWith('123');
    expect(screen.getByTestId('course-enrollment')).toBeInTheDocument();
  });

  it('switches tabs and calls setActiveTab', () => {
    renderComponent();
    const modulesTabBtn = screen.getByRole('button', { name: 'Modules' });
    fireEvent.click(modulesTabBtn);
    expect(mockSetActiveTab).toHaveBeenCalledWith('Modules');
  });

  it('renders Modules tab and Add Module button', () => {
    useManageCourseStore.mockReturnValueOnce({
      course: { id: 123, name: 'Advanced React' },
      activeTab: 'Modules',
      loading: false,
      setActiveTab: mockSetActiveTab,
      loadCourseData: mockLoadCourseData,
      openCreateModule: mockOpenCreateModule,
      modules: [],
    });
    renderComponent();
    expect(screen.getByTestId('course-modules')).toBeInTheDocument();
    
    const addModuleBtn = screen.getByRole('button', { name: /Add Module/i });
    fireEvent.click(addModuleBtn);
    expect(mockOpenCreateModule).toHaveBeenCalled();
  });

  it('renders Analytics tab and loads analytics', () => {
    useManageCourseStore.mockReturnValueOnce({
      course: { id: 123, name: 'Advanced React' },
      activeTab: 'Analytics',
      loading: false,
      setActiveTab: mockSetActiveTab,
      loadCourseData: mockLoadCourseData,
      loadAnalytics: mockLoadAnalytics,
      modules: [],
    });
    renderComponent();
    expect(mockLoadAnalytics).toHaveBeenCalledWith('123');
    expect(screen.getByTestId('course-analytics')).toBeInTheDocument();
  });

  it('renders Discussions tab and New Post button', () => {
    useManageCourseStore.mockReturnValueOnce({
      course: { id: 123, name: 'Advanced React' },
      activeTab: 'Discussions',
      activeForumTab: 'Course Forum',
      loading: false,
      setActiveTab: mockSetActiveTab,
      loadCourseData: mockLoadCourseData,
      modules: [],
    });
    renderComponent();
    expect(screen.getByTestId('course-discussion')).toBeInTheDocument();
    
    const newPostBtn = screen.getByRole('button', { name: /New Post/i });
    expect(newPostBtn).toBeInTheDocument();
  });

  it('initializes ordering when Design Course tab is active with modules', () => {
    useManageCourseStore.mockReturnValueOnce({
      course: { id: 123, name: 'Advanced React' },
      activeTab: 'Design Course',
      loading: false,
      modules: [{ id: 1, name: 'Module 1' }],
      setActiveTab: mockSetActiveTab,
      loadCourseData: mockLoadCourseData,
      initializeOrdering: mockInitializeOrdering,
    });
    renderComponent();
    expect(screen.getByTestId('course-design')).toBeInTheDocument();
    expect(mockInitializeOrdering).toHaveBeenCalled();
  });
});
