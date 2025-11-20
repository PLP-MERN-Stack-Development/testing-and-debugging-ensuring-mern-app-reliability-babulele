// auth.test.js - Unit tests for authentication utilities
const { generateToken, verifyToken } = require('../../src/utils/auth');

describe('Auth Utilities', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should generate different tokens for different users', () => {
      const user1 = { ...mockUser, _id: '111' };
      const user2 = { ...mockUser, _id: '222' };
      
      const token1 = generateToken(user1);
      const token2 = generateToken(user2);
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);
      
      expect(decoded.id).toBe(mockUser._id);
      expect(decoded.username).toBe(mockUser.username);
      expect(decoded.email).toBe(mockUser.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token');
      }).toThrow();
    });

    it('should throw error for expired token', () => {
      // Create an expired token by using a past iat and exp
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        {
          id: mockUser._id,
          username: mockUser.username,
          email: mockUser.email,
          iat: Math.floor(Date.now() / 1000) - 3600, // Issued 1 hour ago
          exp: Math.floor(Date.now() / 1000) - 1800, // Expired 30 minutes ago
        },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );
      
      // Should throw error when verifying expired token
      expect(() => {
        verifyToken(expiredToken);
      }).toThrow();
    });
  });
});

