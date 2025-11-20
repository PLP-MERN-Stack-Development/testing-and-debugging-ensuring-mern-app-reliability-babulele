// errorHandler.test.js - Unit tests for error handler middleware
const { errorHandler } = require('../../../src/middleware/errorHandler');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      path: '/api/test',
      method: 'GET',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.NODE_ENV = 'test';
    jest.clearAllMocks();
  });

  it('should handle ValidationError', () => {
    const error = {
      name: 'ValidationError',
      message: 'Validation failed',
      errors: {
        email: { message: 'Email is required' },
        username: { message: 'Username is required' },
      },
    };

    errorHandler(error, req, res, next);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Validation error',
      details: ['Email is required', 'Username is required'],
    });
  });

  it('should handle duplicate key error (code 11000)', () => {
    const error = {
      name: 'MongoServerError',
      code: 11000,
      keyPattern: { email: 1 },
      message: 'Duplicate key error',
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'email already exists',
    });
  });

  it('should handle CastError', () => {
    const error = {
      name: 'CastError',
      message: 'Cast to ObjectId failed',
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid ID format',
    });
  });

  it('should handle JsonWebTokenError', () => {
    const error = {
      name: 'JsonWebTokenError',
      message: 'Invalid token',
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid token',
    });
  });

  it('should handle TokenExpiredError', () => {
    const error = {
      name: 'TokenExpiredError',
      message: 'Token expired',
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Token expired',
    });
  });

  it('should handle default error with statusCode', () => {
    const error = {
      message: 'Custom error',
      statusCode: 404,
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Custom error',
    });
  });

  it('should handle default error without statusCode', () => {
    const error = {
      message: 'Internal error',
    };

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal error',
    });
  });

  it('should handle error without message', () => {
    const error = {};

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });

  it('should include stack trace in development mode', () => {
    process.env.NODE_ENV = 'development';
    const error = {
      message: 'Test error',
      stack: 'Error stack trace',
    };

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Test error',
      stack: 'Error stack trace',
    });
  });

  it('should not include stack trace in production mode', () => {
    process.env.NODE_ENV = 'production';
    const error = {
      message: 'Test error',
      stack: 'Error stack trace',
    };

    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Test error',
    });
  });
});


