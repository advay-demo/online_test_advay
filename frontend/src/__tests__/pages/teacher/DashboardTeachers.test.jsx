import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardTeachers from '../../../pages/teacher/DashboardTeachers';
import { useTeacherDashboardStore } from '../../../store/teacherDashboardStore';
import { toggleModeratorRole } from '../../../api/api';

vi.mock('../../../store/teacherDashboardStore', () => ({
  useTeacherDashboardStore: vi.fn(),
}));

vi.mock('../../../api/api', () => ({
  toggleModeratorRole: vi.fn(),
}));

vi.mock('../../../components/layout/TeacherSidebar', () => ({
  default: () => <div data-testid="teacher-sidebar">Sidebar</div>,
}));

vi.mock('../../../components/layout/Header', () => ({
  default: () => <div data-testid="header">Header</div>,
}));

describe('DashboardTeachers Component', () => {
  const mockLoadDashboard = vi.fn();
  const mockClearMessage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useTeacherDashboardStore.mockReturnValue({
      dashboardData: {
        teacher_name: 'Test Teacher',
        total_courses: 5,
        active_courses: 3,
        total_students: 120,
        avg_completion: 85,
        upcoming_quizzes: [],
        top_students: [],
        recent_courses: [],
      },
      loading: false,
      error: null,
      errorDetails: null,
      loadDashboard: mockLoadDashboard,
      message: null,
      clearMessage: mockClearMessage,
    });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <DashboardTeachers />
      </BrowserRouter>
    );
  };

  it('renders loading state correctly', () => {
    useTeacherDashboardStore.mockReturnValueOnce({
      loading: true,
      loadDashboard: mockLoadDashboard,
    });
    renderComponent();
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('renders error state and retry button', () => {
    useTeacherDashboardStore.mockReturnValueOnce({
      loading: false,
      error: 'Failed to fetch',
      dashboardData: null,
      loadDashboard: mockLoadDashboard,
    });
    renderComponent();
    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    
    const retryBtn = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryBtn);
    expect(mockLoadDashboard).toHaveBeenCalledTimes(1); // once on click (not on mount without token)
  });

  it('renders switch to teacher mode button when applicable', async () => {
    useTeacherDashboardStore.mockReturnValueOnce({
      loading: false,
      error: 'Not a teacher',
      errorDetails: { can_toggle: true },
      dashboardData: null,
      loadDashboard: mockLoadDashboard,
    });
    
    toggleModeratorRole.mockResolvedValueOnce({ success: true, is_moderator_active: true });
    
    // Mock window.location.reload
    const originalReload = window.location.reload;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: vi.fn() },
    });

    renderComponent();
    expect(screen.getByText('Switch To Teacher View')).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /Switch To Teacher View/i }));
    
    await waitFor(() => {
      expect(toggleModeratorRole).toHaveBeenCalled();
      expect(window.location.reload).toHaveBeenCalled();
    });

    // Restore original reload
    Object.defineProperty(window, 'location', { configurable: true, value: { reload: originalReload } });
  });

  it('renders dashboard with stats', () => {
    renderComponent();
    
    expect(screen.getByText(/Welcome back, Test Teacher!/i)).toBeInTheDocument();
    expect(screen.getByText('Total Courses')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    
    expect(screen.getByText('Active Courses')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    expect(screen.getByText('Students')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    
    expect(screen.getByText('Avg. Completion')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });
});
