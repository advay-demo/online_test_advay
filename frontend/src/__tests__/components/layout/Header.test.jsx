import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../../components/layout/Header';
import { useStore } from '../../../store/useStore';
import { useAuthStore } from '../../../store/authStore';
import { useNotificationsStore } from '../../../store/notificationsStore';

vi.mock('../../../store/useStore');
vi.mock('../../../store/authStore');
vi.mock('../../../store/notificationsStore');
vi.mock('../../../api/api', () => ({
  getModeratorStatus: vi.fn().mockResolvedValue({ is_moderator_active: false }),
  toggleModeratorRole: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  };
});

describe('Header Component', () => {
  const mockLogout = vi.fn();
  const mockToggleTheme = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    useStore.mockImplementation((selector) => {
      const state = { theme: 'light', toggleTheme: mockToggleTheme };
      return selector ? selector(state) : state;
    });

    useAuthStore.mockImplementation((selector) => {
      const state = { 
        user: { first_name: 'John', last_name: 'Doe', is_moderator: true },
        logout: mockLogout 
      };
      return selector ? selector(state) : state;
    });

    useNotificationsStore.mockImplementation((selector) => {
      const state = {
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        fetchNotifications: vi.fn(),
        fetchUnreadCount: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
      };
      return selector ? selector(state) : state;
    });
  });

  const renderComponent = (props = {}) => {
    render(
      <BrowserRouter>
        <Header {...props} />
      </BrowserRouter>
    );
  };

  it('renders the header correctly for unauthenticated users on the landing page', () => {
        useAuthStore.mockImplementation((selector) => {
      const state = { user: null, logout: mockLogout };
      return selector ? selector(state) : state;
    });
    renderComponent({ isAuth: false, isLanding: true });
    expect(document.querySelector('header')).toBeInTheDocument();
    expect(screen.getAllByText('Sign In').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Get Started').length).toBeGreaterThan(0);
  });

  it('renders user details when authenticated', () => {
    renderComponent({ isAuth: true });
    expect(document.body.textContent).toMatch(/John|JD|J/);
  });
});