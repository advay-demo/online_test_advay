import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SocialAuthCallback from '../../pages/SocialAuthCallback';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/api';

vi.mock('../../store/authStore');
vi.mock('../../api/api', () => ({
  default: {
    post: vi.fn()
  }
}));

const mockNavigate = vi.fn();
let searchParamsMock = new URLSearchParams('');

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [searchParamsMock],
  };
});

describe('SocialAuthCallback Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockReturnValue({ isAuthenticated: false });
    useAuthStore.setState = vi.fn();
    useAuthStore.getState = vi.fn(() => ({ isAuthenticated: false }));
    searchParamsMock = new URLSearchParams('?code=123&state=google-oauth2');
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <SocialAuthCallback />
      </BrowserRouter>
    );
  };

  it('redirects to dashboard if already authenticated', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: true });
    renderComponent();
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('shows error if missing authorization code', () => {
    searchParamsMock = new URLSearchParams(''); // empty search params
    renderComponent();
    expect(screen.getByText('Missing authorization code. Please try logging in again.')).toBeInTheDocument();
  });

  it('handles successful authentication callback', async () => {
    api.post.mockResolvedValue({
      data: { user: { id: 1 }, token: 'mock-token' }
    });
    
    renderComponent();
    
    await waitFor(() => {
      expect(useAuthStore.setState).toHaveBeenCalledWith({
        user: { id: 1 },
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('handles failed authentication callback', async () => {
    api.post.mockRejectedValue({
      response: { data: { error: 'Invalid authentication token' } }
    });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Invalid authentication token')).toBeInTheDocument();
    });
  });
});