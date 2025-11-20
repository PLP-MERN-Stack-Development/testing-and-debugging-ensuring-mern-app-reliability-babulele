// usersController.test.js - Unit tests for users controller
const User = require('../../../src/models/User');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../../../src/controllers/usersController');

jest.mock('../../../src/models/User');
jest.mock('../../../src/utils/logger');

describe('Users Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
      body: {},
      user: { id: '507f1f77bcf86cd799439011', username: 'testuser', role: 'user' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return users with pagination', async () => {
      const mockUsers = [
        { _id: '1', username: 'user1', email: 'user1@example.com' },
        { _id: '2', username: 'user2', email: 'user2@example.com' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockUsers),
      };

      User.find.mockReturnValue(mockQuery);
      User.countDocuments.mockResolvedValue(2);

      req.query = { page: 1, limit: 10 };
      req.user.role = 'admin'; // Admin only

      await getUsers(req, res, next);

      expect(User.find).toHaveBeenCalled();
      expect(mockQuery.select).toHaveBeenCalledWith('-password');
      expect(res.json).toHaveBeenCalledWith({
        users: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      });
    });
  });

  describe('getUser', () => {
    it('should return user by ID', async () => {
      const mockUser = {
        _id: '1',
        username: 'testuser',
        email: 'test@example.com',
      };

      User.findById.mockResolvedValue(mockUser);

      req.params.id = '1';

      await getUser(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);

      req.params.id = 'nonexistent';

      await getUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('updateUser', () => {
    it('should update own profile', async () => {
      const mockUser = {
        _id: req.user.id,
        username: 'oldusername',
        email: 'old@example.com',
        role: 'user',
        save: jest.fn().mockResolvedValue(mockUser),
      };

      User.findById.mockResolvedValue(mockUser);

      req.params.id = req.user.id;
      req.body = { username: 'newusername' };

      await updateUser(req, res, next);

      expect(User.findById).toHaveBeenCalledWith(req.user.id);
      expect(mockUser.username).toBe('newusername');
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        id: mockUser._id,
        username: 'newusername',
        email: 'old@example.com',
        role: 'user',
      });
    });

    it('should return 403 if trying to update another user', async () => {
      const mockUser = {
        _id: 'different-id',
        username: 'otheruser',
      };

      User.findById.mockResolvedValue(mockUser);

      req.params.id = 'different-id';
      req.body = { username: 'hacked' };

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not authorized to update this user',
      });
    });

    it('should allow admin to update any user', async () => {
      const mockUser = {
        _id: 'different-id',
        username: 'otheruser',
        email: 'other@example.com',
        role: 'user',
        save: jest.fn().mockResolvedValue(mockUser),
      };

      User.findById.mockResolvedValue(mockUser);

      req.user.role = 'admin';
      req.params.id = 'different-id';
      req.body = { username: 'updated' };

      await updateUser(req, res, next);

      expect(mockUser.username).toBe('updated');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);

      req.params.id = 'nonexistent';
      req.body = { username: 'newusername' };

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 403 if non-admin tries to change role', async () => {
      const mockUser = {
        _id: req.user.id,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      };

      User.findById.mockResolvedValue(mockUser);

      req.params.id = req.user.id;
      req.body = { role: 'admin' };

      await updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Only admin can change user role',
      });
    });

    it('should allow admin to change user role', async () => {
      const mockUser = {
        _id: 'different-id',
        username: 'otheruser',
        email: 'other@example.com',
        role: 'user',
        save: jest.fn().mockResolvedValue(mockUser),
      };

      User.findById.mockResolvedValue(mockUser);

      req.user.role = 'admin';
      req.params.id = 'different-id';
      req.body = { role: 'admin' };

      await updateUser(req, res, next);

      expect(mockUser.role).toBe('admin');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should update only email when only email is provided', async () => {
      const mockUser = {
        _id: req.user.id,
        username: 'oldusername',
        email: 'old@example.com',
        role: 'user',
        save: jest.fn().mockResolvedValue(mockUser),
      };

      User.findById.mockResolvedValue(mockUser);

      req.params.id = req.user.id;
      req.body = { email: 'new@example.com' };

      await updateUser(req, res, next);

      expect(mockUser.email).toBe('new@example.com');
      expect(mockUser.username).toBe('oldusername'); // Unchanged
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should update both username and email when both are provided', async () => {
      const mockUser = {
        _id: req.user.id,
        username: 'oldusername',
        email: 'old@example.com',
        role: 'user',
        save: jest.fn().mockResolvedValue(mockUser),
      };

      User.findById.mockResolvedValue(mockUser);

      req.params.id = req.user.id;
      req.body = { username: 'newusername', email: 'new@example.com' };

      await updateUser(req, res, next);

      expect(mockUser.username).toBe('newusername');
      expect(mockUser.email).toBe('new@example.com');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should not update role when role is not provided', async () => {
      const mockUser = {
        _id: req.user.id,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        save: jest.fn().mockResolvedValue(mockUser),
      };

      User.findById.mockResolvedValue(mockUser);

      req.params.id = req.user.id;
      req.body = { username: 'newusername' };

      await updateUser(req, res, next);

      expect(mockUser.role).toBe('user'); // Unchanged
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const mockUser = {
        _id: '1',
        username: 'todelete',
      };

      User.findById.mockResolvedValue(mockUser);
      User.findByIdAndDelete.mockResolvedValue(mockUser);

      req.user.role = 'admin'; // Admin can delete
      req.params.id = '1';

      await deleteUser(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        message: 'User deleted successfully',
      });
    });

    it('should return 404 if user not found', async () => {
      User.findById.mockResolvedValue(null);

      req.user.role = 'admin';
      req.params.id = 'nonexistent';

      await deleteUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });
});

