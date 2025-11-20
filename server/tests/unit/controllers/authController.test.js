// authController.test.js - Unit tests for auth controller
const User = require('../../../src/models/User');
const { generateToken } = require('../../../src/utils/auth');
const { register, login, getMe } = require('../../../src/controllers/authController');

jest.mock('../../../src/models/User');
jest.mock('../../../src/utils/auth');
jest.mock('../../../src/utils/logger');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      user: { id: '507f1f77bcf86cd799439011' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      generateToken.mockReturnValue('test-token');

      req.body = userData;

      await register(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: userData.email }, { username: userData.username }],
      });
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(generateToken).toHaveBeenCalledWith(mockUser);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        token: 'test-token',
        user: {
          id: mockUser._id,
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
        },
      });
    });

    it('should return 400 if user already exists', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      User.findOne.mockResolvedValue({ 
        _id: 'existing-user',
        username: 'testuser',
        email: 'test@example.com',
      });

      req.body = userData;

      await register(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: userData.email }, { username: userData.username }],
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User with this email or username already exists',
      });
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      // Mock the query chain: User.findOne().select()
      User.findOne.mockReturnValue({
        select: mockSelect,
      });
      generateToken.mockReturnValue('test-token');

      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      await login(req, res, next);

      // Check that findOne was called with normalized email (lowercase)
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockSelect).toHaveBeenCalledWith('+password');
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Login successful',
          token: 'test-token',
          user: expect.objectContaining({
            email: 'test@example.com',
          }),
        })
      );
    });

    it('should return 401 if user not found', async () => {
      const mockSelect = jest.fn().mockResolvedValue(null);
      User.findOne.mockReturnValue({
        select: mockSelect,
      });

      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await login(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid email or password',
      });
    });

    it('should return 401 if password is invalid', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({
        select: mockSelect,
      });

      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await login(req, res, next);

      expect(mockUser.comparePassword).toHaveBeenCalledWith('wrongpassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid email or password',
      });
    });

    it('should return 400 if email is missing', async () => {
      req.body = {
        password: 'password123',
      };

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email and password are required',
      });
    });

    it('should return 400 if password is missing', async () => {
      req.body = {
        email: 'test@example.com',
      };

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email and password are required',
      });
    });

    it('should normalize email to lowercase and trim spaces', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({
        select: mockSelect,
      });
      generateToken.mockReturnValue('test-token');

      req.body = {
        email: '  TEST@EXAMPLE.COM  ',
        password: 'password123',
      };

      await login(req, res, next);

      // Should normalize to lowercase and trim
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('should return current user', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date(),
      };

      User.findById.mockResolvedValue(mockUser);

      await getMe(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        user: expect.objectContaining({
          username: 'testuser',
          email: 'test@example.com',
        }),
      });
    });
  });
});

