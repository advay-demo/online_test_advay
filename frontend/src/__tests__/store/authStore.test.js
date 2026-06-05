import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../../store/authStore';
import api, {
  requestPasswordResetOTP,
  confirmPasswordResetOTP,
} from '../../api/api';

// Mock API
vi.mock('../../api/api', () => ({
  default: {
    post: vi.fn(),
  },
  requestPasswordResetOTP: vi.fn(),
  confirmPasswordResetOTP: vi.fn(),
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();

    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should handle successful login', async () => {
    const mockUser = { id: 1, name: 'Test User' };
    const mockToken = 'test-token';

    api.post.mockResolvedValueOnce({
      data: {
        user: mockUser,
        token: mockToken,
      },
    });

    const result = await useAuthStore
      .getState()
      .login({
        email: 'test@test.com',
        password: 'password',
      });

    expect(result.success).toBe(true);

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(
      localStorage.getItem('authToken')
    ).toBe(mockToken);
  });

  it('should handle failed login', async () => {
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Invalid credentials',
        },
      },
    });

    const result = await useAuthStore
      .getState()
      .login({
        email: 'test@test.com',
        password: 'wrong',
      });

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      'Invalid credentials'
    );

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe(
      'Invalid credentials'
    );
  });

  it('should handle successful register', async () => {
    const mockUser = {
      id: 2,
      name: 'New User',
    };

    const mockToken = 'register-token';

    api.post.mockResolvedValueOnce({
      data: {
        user: mockUser,
        token: mockToken,
      },
    });

    const result = await useAuthStore
      .getState()
      .register({
        email: 'new@test.com',
        password: 'password',
      });

    expect(result.success).toBe(true);

    expect(
      useAuthStore.getState()
        .isAuthenticated
    ).toBe(true);
  });

  it('should handle failed register', async () => {
    api.post.mockRejectedValueOnce({
      response: {
        data: {
          error: 'Registration failed',
        },
      },
    });

    const result = await useAuthStore
      .getState()
      .register({});

    expect(result.success).toBe(false);

    expect(result.error).toBe(
      'Registration failed'
    );
  });

  it('should request password reset successfully', async () => {
    requestPasswordResetOTP.mockResolvedValueOnce();

    const result = await useAuthStore
      .getState()
      .requestPasswordReset(
        'test@test.com'
      );

    expect(result.success).toBe(true);
  });

  it('should handle password reset request failure', async () => {
    requestPasswordResetOTP.mockRejectedValueOnce({
      response: {
        data: {
          error: 'OTP failed',
        },
      },
    });

    const result = await useAuthStore
      .getState()
      .requestPasswordReset(
        'test@test.com'
      );

    expect(result.success).toBe(false);

    expect(result.error).toBe(
      'OTP failed'
    );
  });

  it('should confirm password reset successfully', async () => {
    confirmPasswordResetOTP.mockResolvedValueOnce();

    const result = await useAuthStore
      .getState()
      .confirmPasswordReset(
        'test@test.com',
        '1234',
        'newpass'
      );

    expect(result.success).toBe(true);
  });

  it('should handle successful logout', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: 1 },
      token: 'token',
    });

    localStorage.setItem(
      'authToken',
      'token'
    );

    api.post.mockResolvedValueOnce({});

    const result = await useAuthStore
      .getState()
      .logout();

    expect(result.success).toBe(true);

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();

    expect(
      localStorage.getItem('authToken')
    ).toBeNull();
  });

  it('should clear error', () => {
    useAuthStore.setState({
      error: 'Some Error',
    });

    useAuthStore.getState().clearError();

    expect(
      useAuthStore.getState().error
    ).toBeNull();
  });

  it('should update user data', () => {
    useAuthStore.setState({
      user: {
        id: 1,
        name: 'Old Name',
      },
    });

    useAuthStore
      .getState()
      .updateUser({
        name: 'New Name',
      });

    expect(
      useAuthStore.getState().user.name
    ).toBe('New Name');
  });

  it('should initialize auth from localStorage', () => {
    localStorage.setItem(
      'authToken',
      'token123'
    );

    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 1,
        name: 'User',
      })
    );

    useAuthStore
      .getState()
      .initializeAuth();

    expect(
      useAuthStore.getState()
        .isAuthenticated
    ).toBe(true);
  });
});