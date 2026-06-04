import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../../pages/Profile';
import { useAuthStore } from '../../store/authStore';
import * as api from '../../api/api';
vi.mock('../../components/layout/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('../../components/layout/Sidebar', () => ({ default: () => <div data-testid="student-sidebar" /> }));
vi.mock('../../components/layout/TeacherSidebar', () => ({ default: () => <div data-testid="teacher-sidebar" /> }));

vi.mock('../../store/authStore');
vi.mock('../../api/api', () => ({
  getUserProfile: vi.fn(),
  patchUserProfile: vi.fn(),
  getModeratorStatus: vi.fn(),
}));

describe('Profile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { username: 'johndoe', is_moderator: false }
    });
    api.getModeratorStatus.mockResolvedValue({ is_moderator_active: false });
    api.getUserProfile.mockResolvedValue({
      user: {
        first_name: 'John',
        last_name: 'Doe',
        display_name: 'Johnny',
        email: 'john@example.com',
        city: 'New York',
        country: 'United States',
        bio: 'Hello world',
        department: '',
        github: '',
        institute: '',
        linkedin: '',
        phone: '',
        position: '',
        roll_number: '',
        timezone: 'Asia/Kolkata'
      }
    }); 
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
  };

  it('shows login prompt when not authenticated', () => {
    useAuthStore.mockReturnValue({ isAuthenticated: false, user: null });
    renderComponent();
    expect(screen.getByText('Please log in to view your profile')).toBeInTheDocument();
  });

  it('fetches and displays profile data', async () => {
    renderComponent();
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });
  });

  it('allows editing and saving profile', async () => {
    api.patchUserProfile.mockResolvedValue({
      message: 'Success',
      user: { first_name: 'Jane' }
    });
    
    renderComponent();
    
    await waitFor(() => expect(screen.getByDisplayValue('John')).toBeInTheDocument());
    
    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
    
    const firstNameInput = screen.getByDisplayValue('John');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    
    await waitFor(() => {
      expect(api.patchUserProfile).toHaveBeenCalledWith({ first_name: 'Jane' });
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('renders teacher view if user is an active moderator', async () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { username: 'teacher1', is_moderator: true }
    });
    api.getModeratorStatus.mockResolvedValue({ is_moderator_active: true });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByTestId('teacher-sidebar')).toBeInTheDocument();
    });
  });
});