// auth.test.js - Unit tests for auth routes
const express = require('express');
const request = require('supertest');
const { validationResult } = require('express-validator');

// Mock the controllers and middleware
jest.mock('../../../src/controllers/authController', () => ({
  register: jest.fn((req, res) => res.status(201).json({ message: 'Registered' })),
  login: jest.fn((req, res) => res.json({ message: 'Logged in' })),
  getMe: jest.fn((req, res) => res.json({ user: req.user })),
}));

jest.mock('../../../src/middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: '1', username: 'testuser' };
    next();
  }),
}));

// We need to test the checkValidation function
// Since it's not exported, we'll test it through integration
// But we can create a test that imports the route and tests the validation middleware

describe('Auth Routes', () => {
  let app;
  let authRoutes;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    authRoutes = require('../../../src/routes/auth');
    app.use('/api/auth', authRoutes);
    jest.clearAllMocks();
  });

  it('should have register route', async () => {
    const { register } = require('../../../src/controllers/authController');
    
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

    // Route exists and processes request
    expect(response.status).not.toBe(404);
  });

  it('should have login route', async () => {
    const { login } = require('../../../src/controllers/authController');
    
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).not.toBe(404);
  });

  it('should have getMe route', async () => {
    const { getMe } = require('../../../src/controllers/authController');
    
    const response = await request(app)
      .get('/api/auth/me');

    expect(response.status).not.toBe(404);
  });
});


