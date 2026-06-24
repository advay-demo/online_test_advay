import React from 'react';
import { render, screen } from '@testing-library/react';
import PrivateRoute from '../../../components/auth/PrivateRoute';
import { useAuthStore } from '../../../store/authStore';

vi.mock('../../../store/authStore');

vi.mock('react-router-dom', () => ({
  Navigate: ({ to }) => <div data-testid="navigate-mock">{to}</div>,
  Outlet: () => <div data-testid="outlet-mock" />,
}));

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Outlet when user is authenticated', () => {
    useAuthStore.mockImplementation((selector) => selector({ isAuthenticated: true }));
    render(<PrivateRoute />);
    
    expect(screen.getByTestId('outlet-mock')).toBeInTheDocument();
  });

  it('renders Navigate to /signin when user is not authenticated', () => {
    useAuthStore.mockImplementation((selector) => selector({ isAuthenticated: false }));
    render(<PrivateRoute />);
    
    expect(screen.getByTestId('navigate-mock')).toHaveTextContent('/signin');
  });
});