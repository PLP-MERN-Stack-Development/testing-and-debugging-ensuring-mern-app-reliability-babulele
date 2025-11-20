// users.test.js - Unit tests for users routes
const express = require('express');
const request = require('supertest');

// Mock the controllers and middleware
jest.mock('../../../src/controllers/usersController', () => ({
  getUsers: jest.fn((req, res) => res.json({ users: [] })),
  getUser: jest.fn((req, res) => res.json({ user: {} })),
  updateUser: jest.fn((req, res) => res.json({ user: {} })),
  deleteUser: jest.fn((req, res) => res.json({ message: 'Deleted' })),
}));

jest.mock('../../../src/middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: '1', username: 'testuser', role: 'admin' };
    next();
  }),
  authorizeAdmin: jest.fn((req, res, next) => next()),
}));

describe('Users Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    const usersRoutes = require('../../../src/routes/users');
    app.use('/api/users', usersRoutes);
    jest.clearAllMocks();
  });

  it('should have getUsers route', async () => {
    const response = await request(app)
      .get('/api/users');

    expect(response.status).not.toBe(404);
  });

  it('should have getUser route', async () => {
    const response = await request(app)
      .get('/api/users/123');

    expect(response.status).not.toBe(404);
  });

  it('should have updateUser route', async () => {
    const response = await request(app)
      .put('/api/users/123')
      .send({
        username: 'updateduser',
      });

    expect(response.status).not.toBe(404);
  });

  it('should have deleteUser route', async () => {
    const response = await request(app)
      .delete('/api/users/123');

    expect(response.status).not.toBe(404);
  });
});


