// posts.test.js - Unit tests for posts routes
const express = require('express');
const request = require('supertest');

// Mock the controllers and middleware
jest.mock('../../../src/controllers/postsController', () => ({
  getPosts: jest.fn((req, res) => res.json({ posts: [] })),
  getPost: jest.fn((req, res) => res.json({ post: {} })),
  createPost: jest.fn((req, res) => res.status(201).json({ post: {} })),
  updatePost: jest.fn((req, res) => res.json({ post: {} })),
  deletePost: jest.fn((req, res) => res.json({ message: 'Deleted' })),
}));

jest.mock('../../../src/middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: '1', username: 'testuser' };
    next();
  }),
}));

describe('Posts Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    const postsRoutes = require('../../../src/routes/posts');
    app.use('/api/posts', postsRoutes);
    jest.clearAllMocks();
  });

  it('should have getPosts route', async () => {
    const response = await request(app)
      .get('/api/posts');

    expect(response.status).not.toBe(404);
  });

  it('should have getPost route', async () => {
    const response = await request(app)
      .get('/api/posts/123');

    expect(response.status).not.toBe(404);
  });

  it('should have createPost route', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({
        title: 'Test Post',
        content: 'Test content here',
      });

    expect(response.status).not.toBe(404);
  });

  it('should have updatePost route', async () => {
    const response = await request(app)
      .put('/api/posts/123')
      .send({
        title: 'Updated Post',
        content: 'Updated content',
      });

    expect(response.status).not.toBe(404);
  });

  it('should have deletePost route', async () => {
    const response = await request(app)
      .delete('/api/posts/123');

    expect(response.status).not.toBe(404);
  });
});


