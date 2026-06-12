import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Dashboard from '../../../pages/student/Dashboard';
import { useAuthStore } from '../../../store/authStore';
import { fetchStudentDashboardCourses } from '../../../api/api';

vi.mock('../../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('../../../api/api', () => ({
  fetchStudentDashboardCourses: vi.fn(),
}));

vi.mock('../../../components/layout/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock('../../../components/layout/Header', () => ({ default: () => <div data-testid="header">Header</div> }));

describe('Student Dashboard Component', () => {
  const mockUser = { id: 1, name: 'Student Doe' };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockReturnValue({ user: mockUser });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
  };

  it('renders loading state initially', () => {
    // Keep it unresolved to test loading spinner
    fetchStudentDashboardCourses.mockReturnValue(new Promise(() => {}));
    
    renderComponent();
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('renders dashboard data successfully', async () => {
    fetchStudentDashboardCourses.mockResolvedValue({
      stats: { learning_hours: '5h 30m' },
      dashboard: {
        total_enrolled: 4,
        active_enrolled: 2,
        avg_completion: 45,
        recent_activities: [],
        upcoming_quizzes: []
      },
      courses: [
        {
          id: 1,
          name: 'Advanced Math',
          instructor: 'Dr. Smith',
          active: true,
          completion_percentage: 50,
          start_date: '2023-01-01',
          end_date: '2023-12-31'
        }
      ]
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Welcome back, Student Doe! Here\'s your learning progress and activities.')).toBeInTheDocument();
    });

    // Check stats are rendered
    expect(screen.getByText('5h 30m')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument(); // avg completion

    // Check course is rendered
    expect(screen.getByText('Advanced Math')).toBeInTheDocument();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
  });

  it('renders error state on api failure', async () => {
    fetchStudentDashboardCourses.mockRejectedValue(new Error('API Failure'));
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });
  });
});