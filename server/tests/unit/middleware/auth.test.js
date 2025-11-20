// auth.test.js - Unit tests for authentication middleware
const { authenticate, authorizeAdmin } = require('../../../src/middleware/auth');
const { verifyToken } = require('../../../src/utils/auth');

// Mock the auth utilities
jest.mock('../../../src/utils/auth', () => ({
  verifyToken: jest.fn(),
  generateToken: jest.fn(),
}));
jest.mock('../../../src/utils/logger');

// Mock User model
jest.mock('../../../src/models/User', () => {
  return {
    findById: jest.fn(),
  };
});

const User = require('../../../src/models/User');

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('authenticate', () => {
    it('should return 401 if no token provided', async () => {
      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token format is invalid', async () => {
      req.headers.authorization = 'InvalidFormat token123';

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    });

    it('should authenticate valid token and attach user to request', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
      };

      const token = 'valid-token';
      req.headers.authorization = `Bearer ${token}`;

      verifyToken.mockReturnValue({ id: mockUser._id });
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await authenticate(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    });
  });

  describe('authorizeAdmin', () => {
    it('should allow access for admin users', () => {
      req.user = { role: 'admin' };

      authorizeAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny access for non-admin users', () => {
      req.user = { role: 'user' };

      authorizeAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access denied. Admin role required.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should deny access if no user', () => {
      req.user = null;

      authorizeAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});

