// logger.test.js - Unit tests for logger utility
const { logger } = require('../../src/utils/logger');

describe('Logger Utility', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logger.info', () => {
    it('should log info messages', () => {
      logger.info('Test message');
      expect(console.log).toHaveBeenCalled();
    });

    it('should log info messages with metadata', () => {
      const meta = { key: 'value' };
      logger.info('Test message', meta);
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('logger.error', () => {
    it('should log error messages', () => {
      logger.error('Test error');
      expect(console.error).toHaveBeenCalled();
    });

    it('should log error messages with error object', () => {
      const error = new Error('Test error');
      logger.error('Test error', error);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('logger.warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning');
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('logger.debug', () => {
    it('should log debug messages in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      logger.debug('Test debug');
      expect(console.debug).toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not log debug messages in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      logger.debug('Test debug');
      expect(console.debug).not.toHaveBeenCalled();
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});

