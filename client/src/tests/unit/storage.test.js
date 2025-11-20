// storage.test.js - Unit tests for storage utilities
import { getToken, setToken, removeToken } from '../../utils/storage';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorageMock.setItem('mern_testing_token', 'test-token');
      expect(getToken()).toBe('test-token');
    });

    it('should return null if token does not exist', () => {
      expect(getToken()).toBeNull();
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      expect(getToken()).toBeNull();
    });
  });

  describe('setToken', () => {
    it('should save token to localStorage', () => {
      setToken('new-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'mern_testing_token',
        'new-token'
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      // Should not throw
      expect(() => setToken('token')).not.toThrow();
    });
  });

  describe('removeToken', () => {
    it('should remove token from localStorage', () => {
      localStorageMock.setItem('mern_testing_token', 'test-token');
      removeToken();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'mern_testing_token'
      );
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      // Should not throw
      expect(() => removeToken()).not.toThrow();
    });
  });
});

