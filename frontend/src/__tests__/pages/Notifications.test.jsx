import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Notifications from '../../pages/Notifications';
import { useAuthStore } from '../../store/authStore';
import { useNotificationsStore } from '../../store/notificationsStore';
import * as api from '../../api/api';

vi.mock('../../components/layout/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('../../components/layout/Sidebar', () => ({ default: () => <div data-testid="student-sidebar" /> }));
vi.mock('../../components/layout/TeacherSidebar', () => ({ default: () => <div data-testid="teacher-sidebar" /> }));
vi.mock('../../api/api', () => ({ getModeratorStatus: vi.fn() }));
vi.mock('../../store/authStore');
vi.mock('../../store/notificationsStore');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Notifications Page', () => {
  const mockFetchNotifications = vi.fn();
  const mockMarkAsRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { is_moderator: false }
    });
    useNotificationsStore.mockReturnValue({
      notifications: [],
      unreadCount: 0,
      fetchNotifications: mockFetchNotifications,
      markAsRead: mockMarkAsRead,
      markAllAsRead: vi.fn(),
      markBulkAsRead: vi.fn()
    });
    api.getModeratorStatus.mockResolvedValue({ is_moderator_active: false });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Notifications />
      </BrowserRouter>
    );
  };

  it('shows login prompt when not authenticated', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: false, user: null });
    renderComponent();
    expect(screen.getByText('Please sign in to view notifications')).toBeInTheDocument();
  });

  it('fetches notifications and displays them', async () => {
    useNotificationsStore.mockReturnValue({
      notifications: [
        { message_uid: '1', summary: 'Test Notification', read: false, message_type: 'info' }
      ],
      unreadCount: 1,
      fetchNotifications: mockFetchNotifications,
      markAsRead: mockMarkAsRead,
    });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });
  });

  it('filters notifications correctly', async () => {
    useNotificationsStore.mockReturnValue({
      notifications: [
        { message_uid: '1', summary: 'Unread Notification', read: false, message_type: 'info' },
        { message_uid: '2', summary: 'Read Notification', read: true, message_type: 'success' }
      ],
      unreadCount: 1,
      fetchNotifications: mockFetchNotifications,
    });
    
    renderComponent();
    
    await waitFor(() => expect(screen.getByText('Unread Notification')).toBeInTheDocument());
    
    const selects = screen.getAllByRole('combobox');
    const statusSelect = selects[0];
    fireEvent.change(statusSelect, { target: { value: 'read' } });
    
    expect(screen.queryByText('Unread Notification')).not.toBeInTheDocument();
    expect(screen.getByText('Read Notification')).toBeInTheDocument();
  });
});