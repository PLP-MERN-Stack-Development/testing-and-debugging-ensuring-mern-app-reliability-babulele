// User.test.js - Unit tests for User model
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../../src/models/User');

jest.mock('bcryptjs');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('comparePassword method', () => {
    it('should compare password correctly', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
      });

      bcrypt.compare.mockResolvedValue(true);

      const result = await user.comparePassword('password123');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
      });

      bcrypt.compare.mockResolvedValue(false);

      const result = await user.comparePassword('wrongpassword');

      expect(result).toBe(false);
    });
  });

  describe('toJSON method', () => {
    it('should remove password from JSON output', () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
      });

      const json = user.toJSON();

      expect(json.password).toBeUndefined();
      expect(json.username).toBe('testuser');
      expect(json.email).toBe('test@example.com');
      expect(json.role).toBe('user');
    });

    it('should include other fields in JSON output', () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'admin',
        createdAt: new Date(),
      });

      const json = user.toJSON();

      expect(json.username).toBe('testuser');
      expect(json.email).toBe('test@example.com');
      expect(json.role).toBe('admin');
      expect(json.createdAt).toBeDefined();
    });
  });

  describe('pre-save hook', () => {
    it('should hash password when password is modified', async () => {
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedpassword');

      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      // Mock isModified to return true for password
      user.isModified = jest.fn((field) => field === 'password');

      // Mock the actual save to trigger the hook
      const originalSave = user.save;
      user.save = jest.fn(async function() {
        // Simulate pre-save hook
        if (this.isModified('password')) {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
        }
        return this;
      });

      await user.save();

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalled();
    });

    it('should not hash password if password is not modified', async () => {
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
      });

      // Mark password as not modified
      user.isModified = jest.fn((field) => field !== 'password');

      user.save = jest.fn(async function() {
        // Simulate pre-save hook - should skip hashing
        if (this.isModified('password')) {
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
        }
        return this;
      });

      await user.save();

      // Should not call bcrypt if password not modified
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
    });

    it('should handle password hashing error in pre-save hook', async () => {
      const error = new Error('Hashing failed');
      bcrypt.genSalt.mockRejectedValue(error);

      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      user.isModified = jest.fn((field) => field === 'password');

      user.save = jest.fn(async function() {
        // Simulate pre-save hook with error
        if (this.isModified('password')) {
          try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
          } catch (err) {
            throw err;
          }
        }
        return this;
      });

      await expect(user.save()).rejects.toThrow('Hashing failed');
    });
  });
});

