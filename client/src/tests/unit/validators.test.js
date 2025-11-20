// validators.test.js - Unit tests for validation utilities
import {
  isValidEmail,
  validatePassword,
  validateUsername,
  validatePostTitle,
  validatePostContent,
} from '../../utils/validators';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('test+tag@example.com')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return valid for passwords with 6+ characters', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return invalid for passwords with less than 6 characters', () => {
      const result = validatePassword('short');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Password must be at least 6 characters');
    });
  });

  describe('validateUsername', () => {
    it('should return valid for usernames between 3 and 30 characters', () => {
      expect(validateUsername('user123').isValid).toBe(true);
      expect(validateUsername('a'.repeat(15)).isValid).toBe(true);
      expect(validateUsername('a'.repeat(30)).isValid).toBe(true);
    });

    it('should return invalid for usernames shorter than 3 characters', () => {
      const result = validateUsername('ab');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Username must be at least 3 characters');
    });

    it('should return invalid for usernames longer than 30 characters', () => {
      const result = validateUsername('a'.repeat(31));
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Username cannot exceed 30 characters');
    });
  });

  describe('validatePostTitle', () => {
    it('should return valid for titles between 3 and 200 characters', () => {
      expect(validatePostTitle('Test Title').isValid).toBe(true);
      expect(validatePostTitle('a'.repeat(100)).isValid).toBe(true);
      expect(validatePostTitle('a'.repeat(200)).isValid).toBe(true);
    });

    it('should return invalid for titles shorter than 3 characters', () => {
      const result = validatePostTitle('ab');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Title must be at least 3 characters');
    });

    it('should return invalid for titles longer than 200 characters', () => {
      const result = validatePostTitle('a'.repeat(201));
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Title cannot exceed 200 characters');
    });
  });

  describe('validatePostContent', () => {
    it('should return valid for content with 10+ characters', () => {
      const result = validatePostContent('This is a valid post content');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should return invalid for content with less than 10 characters', () => {
      const result = validatePostContent('short');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Content must be at least 10 characters');
    });
  });
});

