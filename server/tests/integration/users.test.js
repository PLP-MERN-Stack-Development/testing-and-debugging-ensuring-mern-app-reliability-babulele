// users.test.js - Integration tests for users endpoints
// MongoDB setup is handled by setup-integration.js
const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/User');
const { generateToken } = require('../../src/utils/auth');

let adminToken;
let userToken;
let adminUser;
let regularUser;

beforeAll(async () => {
}, 120000); // 2 minute timeout for MongoDB binary download

  // Create admin user
  adminUser = await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  });
  adminToken = generateToken(adminUser);

  // Create regular user
  regularUser = await User.create({
    username: 'user',
    email: 'user@example.com',
    password: 'password123',
    role: 'user',
  });
  userToken = generateToken(regularUser);
});

afterEach(async () => {
  // Keep admin and regular user, delete others
  await User.deleteMany({
    _id: { $nin: [adminUser._id, regularUser._id] },
  });
});

describe('GET /api/users', () => {
  it('should return all users for admin', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('users');
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it('should return 403 for non-admin users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/users');

    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/:id', () => {
  it('should return user by ID when authenticated', async () => {
    const res = await request(app)
      .get(`/api/users/${regularUser._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('user@example.com');
    expect(res.body).not.toHaveProperty('password');
  });

  it('should return 404 for non-existent user', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/users/${fakeId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/users/:id', () => {
  it('should update own profile', async () => {
    const res = await request(app)
      .put(`/api/users/${regularUser._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'updateduser' });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('updateduser');
  });

  it('should allow admin to update any user', async () => {
    const res = await request(app)
      .put(`/api/users/${regularUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ username: 'adminupdated' });

    expect(res.status).toBe(200);
    expect(res.body.username).toBe('adminupdated');
  });

  it('should return 403 if trying to update another user', async () => {
    const anotherUser = await User.create({
      username: 'another',
      email: 'another@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .put(`/api/users/${anotherUser._id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ username: 'hacked' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/users/:id', () => {
  it('should delete user for admin', async () => {
    const userToDelete = await User.create({
      username: 'todelete',
      email: 'todelete@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .delete(`/api/users/${userToDelete._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    const deletedUser = await User.findById(userToDelete._id);
    expect(deletedUser).toBeNull();
  });

  it('should return 403 for non-admin users', async () => {
    const userToDelete = await User.create({
      username: 'todelete2',
      email: 'todelete2@example.com',
      password: 'password123',
    });

    const res = await request(app)
      .delete(`/api/users/${userToDelete._id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});

