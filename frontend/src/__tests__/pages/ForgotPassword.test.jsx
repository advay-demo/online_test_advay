import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../../pages/ForgotPassword';
import { useAuthStore } from '../../store/authStore';

vi.mock('../../store/authStore');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ForgotPassword Page', () => {
  const mockRequestPasswordReset = vi.fn();
  const mockConfirmPasswordReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.mockReturnValue({
      requestPasswordReset: mockRequestPasswordReset,
      confirmPasswordReset: mockConfirmPasswordReset,
      isLoading: false,
      error: null,
    });
  });

  const renderComponent = () => {
    render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
  };

  it('renders step 1 initially', () => {
    renderComponent();
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@example.com')).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    renderComponent();
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'invalid-email' } });
    
    const form = screen.getByPlaceholderText('name@example.com').closest('form');
    fireEvent.submit(form);
    
    expect(await screen.findByText('Invalid email format')).toBeInTheDocument();
    expect(mockRequestPasswordReset).not.toHaveBeenCalled();
  });

  it('proceeds to step 2 after requesting OTP', async () => {
    mockRequestPasswordReset.mockResolvedValue({ success: true });
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'test@example.com' } });
    const form = screen.getByPlaceholderText('name@example.com').closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter 6-digit OTP')).toBeInTheDocument();
    });
  });

  it('handles password reset confirmation', async () => {
    mockRequestPasswordReset.mockResolvedValue({ success: true });
    mockConfirmPasswordReset.mockResolvedValue({ success: true });
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'test@example.com' } });
    let form = screen.getByPlaceholderText('name@example.com').closest('form');
    fireEvent.submit(form);
    await waitFor(() => expect(screen.getByPlaceholderText('Enter 6-digit OTP')).toBeInTheDocument());
    
    fireEvent.change(screen.getByPlaceholderText('Enter 6-digit OTP'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } });
    
    form = screen.getByPlaceholderText('Enter 6-digit OTP').closest('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Password reset successfully!')).toBeInTheDocument();
    });
  });
});