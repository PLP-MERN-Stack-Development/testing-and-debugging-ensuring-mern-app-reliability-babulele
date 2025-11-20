// postsController.test.js - Unit tests for posts controller
const Post = require('../../../src/models/Post');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require('../../../src/controllers/postsController');

jest.mock('../../../src/models/Post');
jest.mock('../../../src/utils/logger');

describe('Posts Controller', () => {
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

  describe('getPosts', () => {
    it('should return posts with pagination', async () => {
      const mockPosts = [
        { _id: '1', title: 'Post 1', author: { username: 'user1' } },
        { _id: '2', title: 'Post 2', author: { username: 'user2' } },
      ];
      
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPosts),
      };
      
      Post.find.mockReturnValue(mockQuery);
      Post.countDocuments.mockResolvedValue(2);

      req.query = { page: 1, limit: 10 };

      await getPosts(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        posts: mockPosts, // After filtering null authors
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      });
    });

    it('should filter by published status (string true)', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      
      Post.find.mockReturnValue(mockQuery);
      Post.countDocuments.mockResolvedValue(0);

      req.query = { published: 'true' };

      await getPosts(req, res, next);

      expect(Post.find).toHaveBeenCalledWith({ published: true });
      expect(res.json).toHaveBeenCalled();
    });

    it('should filter by published status (boolean true)', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      
      Post.find.mockReturnValue(mockQuery);
      Post.countDocuments.mockResolvedValue(0);

      req.query = { published: true };

      await getPosts(req, res, next);

      expect(Post.find).toHaveBeenCalledWith({ published: true });
      expect(res.json).toHaveBeenCalled();
    });

    it('should filter by published status (false)', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      
      Post.find.mockReturnValue(mockQuery);
      Post.countDocuments.mockResolvedValue(0);

      req.query = { published: 'false' };

      await getPosts(req, res, next);

      expect(Post.find).toHaveBeenCalledWith({ published: false });
      expect(res.json).toHaveBeenCalled();
    });

    it('should filter by category', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      
      Post.find.mockReturnValue(mockQuery);
      Post.countDocuments.mockResolvedValue(0);

      req.query = { category: 'category-id' };

      await getPosts(req, res, next);

      expect(Post.find).toHaveBeenCalledWith({ category: 'category-id' });
      expect(res.json).toHaveBeenCalled();
    });

    it('should filter out posts with null authors', async () => {
      const mockPosts = [
        { _id: '1', title: 'Post 1', author: { username: 'user1' } },
        { _id: '2', title: 'Post 2', author: null },
        { _id: '3', title: 'Post 3', author: { username: 'user3' } },
      ];
      
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPosts),
      };
      
      Post.find.mockReturnValue(mockQuery);
      Post.countDocuments.mockResolvedValue(3);

      req.query = { page: 1, limit: 10 };

      await getPosts(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        posts: [
          { _id: '1', title: 'Post 1', author: { username: 'user1' } },
          { _id: '3', title: 'Post 3', author: { username: 'user3' } },
        ],
        pagination: expect.any(Object),
      });
    });

    it('should return empty array when posts is null', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      };
      
      Post.find.mockReturnValue(mockQuery);
      Post.countDocuments.mockResolvedValue(0);

      req.query = { page: 1, limit: 10 };

      await getPosts(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        posts: [],
        pagination: expect.any(Object),
      });
    });
  });

  describe('getPost', () => {
    it('should return a post by ID', async () => {
      const mockPost = {
        _id: '1',
        title: 'Test Post',
        views: 5,
        save: jest.fn().mockResolvedValue(mockPost),
      };

      const mockPopulate = jest.fn().mockResolvedValue(mockPost);
      Post.findById.mockReturnValue({
        populate: mockPopulate,
      });

      req.params.id = '1';

      await getPost(req, res, next);

      expect(Post.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockPost);
      expect(mockPost.views).toBe(6);
      expect(mockPost.save).toHaveBeenCalled();
    });

    it('should return 404 if post not found', async () => {
      Post.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      req.params.id = 'nonexistent';

      await getPost(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const mockPost = {
        _id: '1',
        title: 'New Post',
        content: 'Content',
        author: { username: 'testuser' },
        category: null,
        populate: jest.fn().mockResolvedValue(mockPost),
      };

      Post.create.mockResolvedValue(mockPost);

      req.body = {
        title: 'New Post',
        content: 'Content',
        published: false,
      };

      await createPost(req, res, next);

      expect(Post.create).toHaveBeenCalledWith({
        title: 'New Post',
        content: 'Content',
        author: req.user.id,
        category: null,
        tags: [],
        published: false,
      });
      expect(mockPost.populate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it('should create post with category and populate it', async () => {
      const mockPost = {
        _id: '1',
        title: 'New Post',
        content: 'Content',
        author: { username: 'testuser' },
        category: 'category-id',
        populate: jest.fn().mockResolvedValue(mockPost),
      };

      Post.create.mockResolvedValue(mockPost);

      req.body = {
        title: 'New Post',
        content: 'Content',
        category: 'category-id',
        tags: ['tag1', 'tag2'],
        published: true,
      };

      await createPost(req, res, next);

      expect(Post.create).toHaveBeenCalledWith({
        title: 'New Post',
        content: 'Content',
        author: req.user.id,
        category: 'category-id',
        tags: ['tag1', 'tag2'],
        published: true,
      });
      expect(mockPost.populate).toHaveBeenCalledTimes(2); // author and category
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updatePost', () => {
    it('should update a post when user is author', async () => {
      const mockPost = {
        _id: '1',
        title: 'Old Title',
        content: 'Old Content',
        author: { toString: () => req.user.id },
        save: jest.fn().mockResolvedValue(mockPost),
        populate: jest.fn().mockResolvedValue(mockPost),
      };

      Post.findById.mockResolvedValue(mockPost);

      req.params.id = '1';
      req.body = { title: 'New Title' };

      await updatePost(req, res, next);

      expect(Post.findById).toHaveBeenCalledWith('1');
      expect(mockPost.title).toBe('New Title');
      expect(mockPost.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it('should return 403 if user is not author', async () => {
      const mockPost = {
        _id: '1',
        title: 'Test Post',
        author: { toString: () => 'different-user-id' },
      };

      Post.findById.mockResolvedValue(mockPost);

      req.params.id = '1';
      req.body = { title: 'New Title' };

      await updatePost(req, res, next);

      expect(Post.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not authorized to update this post',
      });
    });

    it('should update post when user is admin', async () => {
      req.user.role = 'admin';
      const mockPost = {
        _id: '1',
        title: 'Old Title',
        content: 'Old Content',
        author: { toString: () => 'different-user-id' },
        category: 'old-category',
        save: jest.fn().mockResolvedValue(mockPost),
        populate: jest.fn().mockResolvedValue(mockPost),
      };

      Post.findById.mockResolvedValue(mockPost);

      req.params.id = '1';
      req.body = { 
        title: 'New Title',
        content: 'New Content',
        category: 'new-category',
        tags: ['tag1'],
        published: true,
      };

      await updatePost(req, res, next);

      expect(mockPost.title).toBe('New Title');
      expect(mockPost.content).toBe('New Content');
      expect(mockPost.category).toBe('new-category');
      expect(mockPost.tags).toEqual(['tag1']);
      expect(mockPost.published).toBe(true);
      expect(mockPost.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it('should update post with category and populate it', async () => {
      const mockPost = {
        _id: '1',
        title: 'Old Title',
        author: { toString: () => req.user.id },
        category: 'category-id',
        save: jest.fn().mockResolvedValue(mockPost),
        populate: jest.fn().mockResolvedValue(mockPost),
      };

      Post.findById.mockResolvedValue(mockPost);

      req.params.id = '1';
      req.body = { category: 'category-id' };

      await updatePost(req, res, next);

      expect(mockPost.populate).toHaveBeenCalledTimes(2); // author and category
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it('should update post without category (null)', async () => {
      const mockPost = {
        _id: '1',
        title: 'Old Title',
        author: { toString: () => req.user.id },
        category: null,
        save: jest.fn().mockResolvedValue(mockPost),
        populate: jest.fn().mockResolvedValue(mockPost),
      };

      Post.findById.mockResolvedValue(mockPost);

      req.params.id = '1';
      req.body = { category: null };

      await updatePost(req, res, next);

      expect(mockPost.category).toBe(null);
      expect(mockPost.populate).toHaveBeenCalledTimes(1); // only author, not category
      expect(res.json).toHaveBeenCalledWith(mockPost);
    });

    it('should return 404 if post not found', async () => {
      Post.findById.mockResolvedValue(null);

      req.params.id = 'nonexistent';
      req.body = { title: 'New Title' };

      await updatePost(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });
  });

  describe('deletePost', () => {
    it('should delete a post when user is author', async () => {
      const mockPost = {
        _id: '1',
        title: 'Test Post',
        author: { toString: () => req.user.id },
      };

      Post.findById.mockResolvedValue(mockPost);
      Post.findByIdAndDelete.mockResolvedValue(mockPost);

      req.params.id = '1';

      await deletePost(req, res, next);

      expect(Post.findById).toHaveBeenCalledWith('1');
      expect(Post.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post deleted successfully',
      });
    });

    it('should return 404 if post not found', async () => {
      Post.findById.mockResolvedValue(null);

      req.params.id = 'nonexistent';

      await deletePost(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Post not found' });
    });

    it('should return 403 if user is not author', async () => {
      const mockPost = {
        _id: '1',
        title: 'Test Post',
        author: { toString: () => 'different-user-id' },
      };

      Post.findById.mockResolvedValue(mockPost);

      req.params.id = '1';

      await deletePost(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not authorized to delete this post',
      });
    });

    it('should delete post when user is admin', async () => {
      req.user.role = 'admin';
      const mockPost = {
        _id: '1',
        title: 'Test Post',
        author: { toString: () => 'different-user-id' },
      };

      Post.findById.mockResolvedValue(mockPost);
      Post.findByIdAndDelete.mockResolvedValue(mockPost);

      req.params.id = '1';

      await deletePost(req, res, next);

      expect(Post.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post deleted successfully',
      });
    });
  });
});

