import React from 'react';
import { render, screen } from '@testing-library/react';
import PublicRoute from '../../../components/auth/PublicRoute';
import { useAuthStore } from '../../../store/authStore';

vi.mock('../../../store/authStore');

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }) => <div data-testid="navigate-mock">{to}</div>,
  Outlet: () => <div data-testid="outlet-mock" />,
}));

describe('PublicRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Outlet when user is not authenticated', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: false, user: null });
    render(<PublicRoute />);
    
    expect(screen.getByTestId('outlet-mock')).toBeInTheDocument();
  });

  it('navigates to /dashboard when user is an authenticated student', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: true, user: { is_moderator: false } });
    render(<PublicRoute />);
    
    expect(screen.getByTestId('navigate-mock')).toHaveTextContent('/dashboard');
  });

  it('navigates to /teacher/dashboard when user is an authenticated teacher', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: true, user: { is_moderator: true } });
    render(<PublicRoute />);
    
    expect(screen.getByTestId('navigate-mock')).toHaveTextContent('/teacher/dashboard');
  });
});