// useAuth.test.js - Unit tests for useAuth hook
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../../../hooks/useAuth';
import * as api from '../../../utils/api';
import * as storage from '../../../utils/storage';

jest.mock('../../../utils/api');
jest.mock('../../../utils/storage');

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    storage.getToken.mockReturnValue(null);
  });

  it('should initialize with null user when no token', async () => {
    storage.getToken.mockReturnValue(null);
    const { result } = renderHook(() => useAuth());

    // Initially loading should be true
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should initialize with user when token exists', async () => {
    const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
    storage.getToken.mockReturnValue('valid-token');
    api.getMe.mockResolvedValue({ user: mockUser });

    const { result } = renderHook(() => useAuth());

    // Wait for the useEffect to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should login successfully', async () => {
    const mockData = {
      token: 'test-token',
      user: { id: '1', username: 'testuser', email: 'test@example.com' },
    };
    api.login.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAuth());

    await result.current.login('test@example.com', 'password123');

    await waitFor(() => {
      expect(storage.setToken).toHaveBeenCalledWith('test-token');
      expect(result.current.user).toEqual(mockData.user);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should register successfully', async () => {
    const mockData = {
      token: 'test-token',
      user: { id: '1', username: 'newuser', email: 'new@example.com' },
    };
    api.register.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAuth());

    await result.current.register('newuser', 'new@example.com', 'password123');

    await waitFor(() => {
      expect(storage.setToken).toHaveBeenCalledWith('test-token');
      expect(result.current.user).toEqual(mockData.user);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should logout successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    // First login to set user
    const mockData = {
      token: 'test-token',
      user: { id: '1', username: 'testuser', email: 'test@example.com' },
    };
    api.login.mockResolvedValue(mockData);
    
    await result.current.login('test@example.com', 'password123');
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    // Now logout
    result.current.logout();

    expect(storage.removeToken).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should handle login error', async () => {
    const errorMessage = 'Login failed';
    api.login.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAuth());

    await expect(result.current.login('test@example.com', 'wrong')).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('should handle login error without message', async () => {
    const error = new Error();
    error.message = undefined;
    api.login.mockRejectedValue(error);

    const { result } = renderHook(() => useAuth());

    await expect(result.current.login('test@example.com', 'wrong')).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe('Login failed');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('should handle register error without message', async () => {
    const error = new Error();
    error.message = undefined;
    api.register.mockRejectedValue(error);

    const { result } = renderHook(() => useAuth());

    await expect(result.current.register('user', 'test@example.com', 'password')).rejects.toThrow();

    await waitFor(() => {
      expect(result.current.error).toBe('Registration failed');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('should remove token when getMe fails during initialization', async () => {
    storage.getToken.mockReturnValue('invalid-token');
    api.getMe.mockRejectedValue(new Error('Invalid token'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(storage.removeToken).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('should handle getMe error without throwing', async () => {
    storage.getToken.mockReturnValue('token');
    const error = new Error('Auth failed');
    api.getMe.mockRejectedValue(error);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(storage.removeToken).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
    });
  });
});

