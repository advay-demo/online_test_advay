
import { useUserStore } from '../../store/userStore';
import api from '../../api/api';

// Mock the API
vi.mock('../../api/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('useUserStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useUserStore.setState({
      user: null,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('should have correct initial state', () => {
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle successful profile fetch', async () => {
    const mockUser = { username: 'testuser', email: 'test@test.com' };
    
    api.get.mockResolvedValueOnce({
      data: { user: mockUser }
    });

    const result = await useUserStore.getState().fetchUserProfile('testuser');

    expect(result.success).toBe(true);
    expect(result.user).toEqual(mockUser);
    
    const state = useUserStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isLoading).toBe(false);
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(mockUser);
  });

  it('should handle failed profile fetch', async () => {
    api.get.mockRejectedValueOnce({
      response: { data: { error: 'User not found' } }
    });

    const result = await useUserStore.getState().fetchUserProfile('unknown');

    expect(result.success).toBe(false);
    expect(result.error).toBe('User not found');
    
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.error).toBe('User not found');
  });

  it('should clear user data correctly', () => {
    useUserStore.setState({ user: { id: 1 } });
    localStorage.setItem('user', JSON.stringify({ id: 1 }));

    useUserStore.getState().clearUser();

    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
  it('should update user profile successfully', async () => {
  useUserStore.setState({
    user: {
      username: 'testuser'
    }
  });

  api.post.mockResolvedValueOnce({
    data: {
      user: {
        email: 'updated@test.com'
      }
    }
  });

  const result =
    await useUserStore
      .getState()
      .updateUserProfile(
        'testuser',
        { email: 'updated@test.com' }
      );

  expect(result.success).toBe(true);

  expect(
    useUserStore.getState().user.email
  ).toBe('updated@test.com');
});

it('should handle update profile failure', async () => {
  api.post.mockRejectedValueOnce({
    response: {
      data: {
        error: 'Update failed'
      }
    }
  });

  const result =
    await useUserStore
      .getState()
      .updateUserProfile(
        'testuser',
        {}
      );

  expect(result.success).toBe(false);

  expect(
    useUserStore.getState().error
  ).toBe('Update failed');
});

it('should update local user', () => {
  useUserStore.setState({
    user: {
      username: 'testuser'
    }
  });

  useUserStore
    .getState()
    .updateLocalUser({
      email: 'local@test.com'
    });

  expect(
    useUserStore.getState().user.email
  ).toBe('local@test.com');
});

it('should initialize user from localStorage', () => {
  const user = {
    username: 'saveduser'
  };

  localStorage.setItem(
    'user',
    JSON.stringify(user)
  );

  useUserStore
    .getState()
    .initializeUser();

  expect(
    useUserStore.getState().user
  ).toEqual(user);
});

it('should clear error', () => {
  useUserStore.setState({
    error: 'Some Error'
  });

  useUserStore
    .getState()
    .clearError();

  expect(
    useUserStore.getState().error
  ).toBeNull();
});

it('should handle invalid localStorage data', () => {
  localStorage.setItem(
    'user',
    'invalid-json'
  );

  useUserStore
    .getState()
    .initializeUser();

  expect(
    localStorage.getItem('user')
  ).toBeNull();
});
});
