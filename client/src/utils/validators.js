// validators.js - Validation utility functions

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters',
    };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {object} Validation result with isValid and message
 */
export const validateUsername = (username) => {
  if (username.length < 3) {
    return {
      isValid: false,
      message: 'Username must be at least 3 characters',
    };
  }
  if (username.length > 30) {
    return {
      isValid: false,
      message: 'Username cannot exceed 30 characters',
    };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate post title
 * @param {string} title - Title to validate
 * @returns {object} Validation result with isValid and message
 */
export const validatePostTitle = (title) => {
  if (title.length < 3) {
    return {
      isValid: false,
      message: 'Title must be at least 3 characters',
    };
  }
  if (title.length > 200) {
    return {
      isValid: false,
      message: 'Title cannot exceed 200 characters',
    };
  }
  return { isValid: true, message: '' };
};

/**
 * Validate post content
 * @param {string} content - Content to validate
 * @returns {object} Validation result with isValid and message
 */
export const validatePostContent = (content) => {
  if (content.length < 10) {
    return {
      isValid: false,
      message: 'Content must be at least 10 characters',
    };
  }
  return { isValid: true, message: '' };
};

