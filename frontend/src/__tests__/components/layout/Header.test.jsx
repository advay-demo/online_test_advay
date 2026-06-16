import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Header from '../../../components/layout/Header';
import { useStore } from '../../../store/useStore';
import { useAuthStore } from '../../../store/authStore';
import { useNotificationsStore } from '../../../store/notificationsStore';
import { toggleModeratorRole, getModeratorStatus } from '../../../api/api';

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
  const mockLogout = vi.fn().mockResolvedValue({ success: true });
  const mockToggleTheme = vi.fn();
  const mockFetchNotifications = vi.fn();
  const mockFetchUnreadCount = vi.fn();
  const mockMarkAsRead = vi.fn();
  const mockMarkAllAsRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    useStore.mockImplementation((selector) => {
      const state = { theme: 'light', toggleTheme: mockToggleTheme };
      return selector ? selector(state) : state;
    });

    useAuthStore.mockImplementation((selector) => {
      const state = { 
        user: { first_name: 'John', last_name: 'Doe', is_moderator: true, email: 'john@example.com' },
        logout: mockLogout,
        isAuth: true
      };
      return selector ? selector(state) : state;
    });

    useNotificationsStore.mockImplementation((selector) => {
      const state = {
        notifications: [
          { message_uid: '1', summary: 'Test Notif', description: 'Hello', read: false, created_at: new Date().toISOString() }
        ],
        unreadCount: 1,
        isLoading: false,
        fetchNotifications: mockFetchNotifications,
        fetchUnreadCount: mockFetchUnreadCount,
        markAsRead: mockMarkAsRead,
        markAllAsRead: mockMarkAllAsRead,
      };
      return selector ? selector(state) : state;
    });
  });

  const renderComponent = (props = { isAuth: true, isLanding: false }) => {
    render(
      <BrowserRouter>
        <Header {...props} />
      </BrowserRouter>
    );
  };

  it('renders the header correctly for unauthenticated users on the landing page', () => {
    useAuthStore.mockImplementation((selector) => {
      const state = { user: null, logout: mockLogout, isAuth: false };
      return selector ? selector(state) : state;
    });
    renderComponent({ isAuth: false, isLanding: true });
    expect(document.querySelector('header')).toBeInTheDocument();
    expect(screen.getAllByText('Sign In').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Get Started').length).toBeGreaterThan(0);
  });

  it('renders user details when authenticated', async () => {
    renderComponent({ isAuth: true, isLanding: false });
    await waitFor(() => {
      expect(document.body.textContent).toMatch(/John|JD|J/);
    });
  });

  it('toggles theme when theme button is clicked', () => {
    renderComponent();
    const themeButtons = screen.getAllByLabelText('Toggle theme');
    fireEvent.click(themeButtons[0]);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
  it('opens user dropdown when avatar is clicked', async() => {
    renderComponent();
    const avatarBtn= screen.getByText('J').closest('button');
    fireEvent.click(avatarBtn);
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('My Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });
  it('logs out when logout option is selected', async() => {
    renderComponent();
    const avatarBtn= screen.getByText('J').closest('button');
    fireEvent.click(avatarBtn);
    await waitFor(() => {
      const logoutBtn = screen.getByText('Sign Out');
      fireEvent.click(logoutBtn);
    });
    expect(mockLogout).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin', { replace: true });
    });

  });
    it('opens notifications dropdown and marks all as read', async () => {
    renderComponent();
    const notifButton = screen.getByLabelText('Notifications');
    fireEvent.click(notifButton);
    await waitFor(() => {
      expect(screen.getByText('Test Notif')).toBeInTheDocument();
    });
    const markAllButton = screen.getByText('Mark all').closest('button');
    fireEvent.click(markAllButton);

    expect(mockMarkAllAsRead).toHaveBeenCalledTimes(1);
  });

});