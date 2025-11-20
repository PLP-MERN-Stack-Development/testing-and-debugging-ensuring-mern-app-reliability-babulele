// performance.js - Performance monitoring middleware
const { logger } = require('../utils/logger');

/**
 * Performance monitoring middleware
 * Tracks request duration and logs slow requests
 */
const performanceMonitor = (req, res, next) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    const memoryUsed = {
      heapUsed: (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024, // MB
      external: (endMemory.external - startMemory.external) / 1024 / 1024, // MB
    };

    // Log performance metrics
    const performanceData = {
      method: req.method,
      path: req.path,
      duration: `${duration}ms`,
      memoryUsed: `${memoryUsed.heapUsed.toFixed(2)}MB`,
      statusCode: res.statusCode,
    };

    // Log slow requests (over 1 second)
    if (duration > 1000) {
      logger.warn('Slow request detected', performanceData);
    } else if (process.env.NODE_ENV === 'development') {
      logger.debug('Request performance', performanceData);
    }

    // Log memory usage if significant
    if (memoryUsed.heapUsed > 10) {
      logger.warn('High memory usage detected', {
        path: req.path,
        memoryUsed: `${memoryUsed.heapUsed.toFixed(2)}MB`,
      });
    }

    // Call original end
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Response time header middleware
 * Adds X-Response-Time header to responses
 */
const responseTime = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });

  next();
};

module.exports = {
  performanceMonitor,
  responseTime,
};


