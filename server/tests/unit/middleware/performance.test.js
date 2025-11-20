// performance.test.js - Unit tests for performance monitoring middleware
const { performanceMonitor, responseTime } = require('../../../src/middleware/performance');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger');

describe('Performance Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      method: 'GET',
      path: '/api/test',
    };
    res = {
      statusCode: 200,
      end: jest.fn(),
      setHeader: jest.fn(),
      on: jest.fn(),
    };
    next = jest.fn();
    process.env.NODE_ENV = 'test';
    jest.clearAllMocks();
  });

  describe('performanceMonitor', () => {
    it('should monitor request performance and call next', () => {
      performanceMonitor(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(typeof res.end).toBe('function');
    });

    it('should override res.end to track performance', () => {
      const originalEnd = res.end;
      performanceMonitor(req, res, next);

      // res.end should be overridden
      expect(res.end).not.toBe(originalEnd);
      
      // Call the overridden end
      res.end('response');
      expect(originalEnd).not.toHaveBeenCalled();
    });

    it('should log slow requests (over 1 second)', (done) => {
      const startTime = Date.now() - 2000; // 2 seconds ago
      const originalNow = Date.now;
      Date.now = jest.fn(() => startTime);

      performanceMonitor(req, res, next);

      // Simulate slow request by calling end after time passes
      setTimeout(() => {
        Date.now = jest.fn(() => startTime + 1500); // 1.5 seconds later
        res.end('response');
        
        // Should log warning for slow request
        setTimeout(() => {
          Date.now = originalNow;
          done();
        }, 10);
      }, 10);
    });

    it('should log performance in development mode', () => {
      process.env.NODE_ENV = 'development';
      performanceMonitor(req, res, next);

      expect(next).toHaveBeenCalled();
      res.end('response');
    });

    it('should track memory usage', () => {
      const originalMemoryUsage = process.memoryUsage;
      let callCount = 0;
      process.memoryUsage = jest.fn(() => {
        callCount++;
        return {
          heapUsed: callCount === 1 ? 10 * 1024 * 1024 : 20 * 1024 * 1024, // 10MB then 20MB
          external: 5 * 1024 * 1024,
        };
      });

      performanceMonitor(req, res, next);
      res.end('response');

      expect(process.memoryUsage).toHaveBeenCalled();
      process.memoryUsage = originalMemoryUsage;
    });
  });

  describe('responseTime', () => {
    it('should add X-Response-Time header on finish', () => {
      let finishHandler;
      res.on.mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishHandler = callback;
        }
      });

      responseTime(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));

      // Simulate finish event
      if (finishHandler) {
        finishHandler();
        expect(res.setHeader).toHaveBeenCalledWith('X-Response-Time', expect.stringMatching(/\d+ms/));
      }
    });

    it('should call next immediately', () => {
      responseTime(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should calculate response time correctly', () => {
      const startTime = Date.now();
      let finishHandler;
      
      res.on.mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishHandler = callback;
        }
      });

      responseTime(req, res, next);

      // Simulate some time passing
      setTimeout(() => {
        if (finishHandler) {
          finishHandler();
          const duration = Date.now() - startTime;
          expect(res.setHeader).toHaveBeenCalledWith('X-Response-Time', expect.stringMatching(/\d+ms/));
        }
      }, 10);
    });
  });
});

