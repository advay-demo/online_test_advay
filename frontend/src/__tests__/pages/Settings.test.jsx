import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Settings from '../../pages/Settings';
import { useAuthStore } from '../../store/authStore';

vi.mock('../../components/layout/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('../../components/layout/Sidebar', () => ({ default: () => <div data-testid="student-sidebar" /> }));
vi.mock('../../components/layout/TeacherSidebar', () => ({ default: () => <div data-testid="teacher-sidebar" /> }));
vi.mock('../../components/auth/ChangePassword', () => ({ default: () => <div data-testid="change-password" /> }));

vi.mock('../../store/authStore');

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Settings />
      </BrowserRouter>
    );
  };

  it('shows login prompt when not authenticated', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: false, user: null });
    renderComponent();
    expect(screen.getByText('Please log in to view settings')).toBeInTheDocument();
  });

  it('renders student settings correctly', () => {
    useAuthStore.mockReturnValue({ 
      isAuthenticated: true, 
      user: { first_name: 'John', last_name: 'Doe', email: 'john@example.com', is_moderator: false } 
    });
    renderComponent();
    
    expect(screen.getByTestId('student-sidebar')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Student')).toBeInTheDocument();
  });

  it('renders teacher settings correctly', () => {
    useAuthStore.mockReturnValue({ 
      isAuthenticated: true, 
      user: { first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', is_moderator: true } 
    });
    renderComponent();
    
    expect(screen.getByTestId('teacher-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Teacher / Moderator')).toBeInTheDocument();
  });
});