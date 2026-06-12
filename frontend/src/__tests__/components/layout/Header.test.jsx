import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../../components/layout/Header';
import { useStore } from '../../../store/useStore';
import { useAuthStore } from '../../../store/authStore';
import { useNotificationsStore } from '../../../store/notificationsStore';
import * as api from '../../../api/api';

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

  it('handles theme toggle', () => {
    renderComponent({ isAuth: true });
    const toggleBtn = screen.getByLabelText('Toggle theme');
    fireEvent.click(toggleBtn);
    expect(mockToggleTheme).toHaveBeenCalled();
  });

  it('handles notifications toggle and interactions', async () => {
    const mockMarkAllAsRead = vi.fn();
    const mockFetchNotifications = vi.fn();
    const mockMarkAsRead = vi.fn();
    
    useNotificationsStore.mockImplementation((selector) => {
      const state = {
        notifications: [{ message_uid: '1', read: false, summary: 'Test notif', message_type: 'info' }],
        unreadCount: 1,
        isLoading: false,
        fetchNotifications: mockFetchNotifications,
        fetchUnreadCount: vi.fn(),
        markAsRead: mockMarkAsRead,
        markAllAsRead: mockMarkAllAsRead,
      };
      return selector ? selector(state) : state;
    });

    renderComponent({ isAuth: true });
    
    // Open notifications
    const notifBtn = screen.getByLabelText('Notifications');
    fireEvent.click(notifBtn);
    
    expect(mockFetchNotifications).toHaveBeenCalled();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Test notif')).toBeInTheDocument();

    // Click on notification to mark as read
    const notifItem = screen.getByText('Test notif');
    fireEvent.click(notifItem);
    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith('1');
    });

    // Mark all as read
    const markAllBtn = screen.getByText('Mark all');
    fireEvent.click(markAllBtn);
    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('handles user dropdown and signout', async () => {
    mockLogout.mockResolvedValue({ success: true });
    renderComponent({ isAuth: true });

    const dropdownBtn = screen.getByText('J').closest('button');
    fireEvent.click(dropdownBtn);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    
    const signOutBtn = screen.getByText('Sign Out');
    fireEvent.click(signOutBtn);
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('handles moderator toggle', async () => {
    const mockToggleModeratorRole = vi.fn().mockResolvedValue({ success: true, is_moderator_active: true });
    api.toggleModeratorRole.mockImplementation(mockToggleModeratorRole);

    renderComponent({ isAuth: true });

    const dropdownBtn = screen.getByText('J').closest('button');
    fireEvent.click(dropdownBtn);
    
    const switchBtn = screen.getByText('Switch To Teacher');
    fireEvent.click(switchBtn);
    await waitFor(() => {
      expect(mockToggleModeratorRole).toHaveBeenCalled();
    });
  });

  it('closes dropdowns on click outside', async () => {
    renderComponent({ isAuth: true });
    const dropdownBtn = screen.getByText('J').closest('button');
    fireEvent.click(dropdownBtn);
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);
    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('renders user details when authenticated', () => {
    renderComponent({ isAuth: true });
    expect(document.body.textContent).toMatch(/John|JD|J/);
  });
});