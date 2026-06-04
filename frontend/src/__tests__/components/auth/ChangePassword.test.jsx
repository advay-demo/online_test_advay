import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChangePassword from '../../../components/auth/ChangePassword';
import * as api from '../../../api/api';

vi.mock('../../../api/api', () => ({
  requestPasswordChange: vi.fn(),
  confirmPasswordChange: vi.fn(),
}));

describe('ChangePassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial step correctly', () => {
    render(<ChangePassword />);
    expect(screen.getByText('Password Security')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument();
  });

  it('handles request password change success and shows form', async () => {
    api.requestPasswordChange.mockResolvedValue({});
    render(<ChangePassword />);
    
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument();
    });
  });

  it('handles request password change failure', async () => {
    api.requestPasswordChange.mockRejectedValue({ response: { data: { message: 'Request Failed' } } });
    render(<ChangePassword />);
    
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Request Failed')).toBeInTheDocument();
    });
  });

  it('handles confirm password validation error (passwords do not match)', async () => {
    api.requestPasswordChange.mockResolvedValue({});
    render(<ChangePassword />);
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    await waitFor(() => expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument());
    
    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), { target: { value: 'password124' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
    expect(api.confirmPasswordChange).not.toHaveBeenCalled();
  });

  it('handles confirm password success', async () => {
    api.requestPasswordChange.mockResolvedValue({});
    api.confirmPasswordChange.mockResolvedValue({});
    render(<ChangePassword />);
    
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    await waitFor(() => expect(screen.getByPlaceholderText('Enter OTP')).toBeInTheDocument());
    
    fireEvent.change(screen.getByPlaceholderText('Enter OTP'), { target: { value: '123456' } });
    fireEvent.change(screen.getByPlaceholderText('Min. 8 characters'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Password Updated!')).toBeInTheDocument();
    });
  });
});