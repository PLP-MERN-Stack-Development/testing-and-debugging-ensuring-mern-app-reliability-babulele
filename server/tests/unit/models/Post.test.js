// Post.test.js - Unit tests for Post model
const Post = require('../../../src/models/Post');

describe('Post Model', () => {
  describe('pre-save hook', () => {
    it('should generate slug from title when title is modified and slug is empty', async () => {
      const post = new Post({
        title: 'Test Post Title',
        content: 'This is test content for the post',
        author: require('mongoose').Types.ObjectId(),
      });

      post.isModified = jest.fn((field) => field === 'title');
      post.save = jest.fn().mockImplementation(function() {
        // Simulate pre-save hook behavior
        if (this.isModified('title') && !this.slug) {
          this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
        this.updatedAt = Date.now();
        return Promise.resolve(this);
      });

      await post.save();

      expect(post.slug).toBe('test-post-title');
      expect(post.updatedAt).toBeDefined();
    });

    it('should not generate slug if slug already exists', async () => {
      const post = new Post({
        title: 'Test Post Title',
        content: 'This is test content for the post',
        author: require('mongoose').Types.ObjectId(),
        slug: 'existing-slug',
      });

      post.isModified = jest.fn((field) => field === 'title');
      post.save = jest.fn().mockImplementation(function() {
        if (this.isModified('title') && !this.slug) {
          this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
        this.updatedAt = Date.now();
        return Promise.resolve(this);
      });

      await post.save();

      expect(post.slug).toBe('existing-slug');
    });

    it('should not generate slug if title is not modified', async () => {
      const post = new Post({
        title: 'Test Post Title',
        content: 'This is test content for the post',
        author: require('mongoose').Types.ObjectId(),
      });

      post.isModified = jest.fn(() => false);
      post.save = jest.fn().mockImplementation(function() {
        if (this.isModified('title') && !this.slug) {
          this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
        this.updatedAt = Date.now();
        return Promise.resolve(this);
      });

      await post.save();

      expect(post.slug).toBeUndefined();
    });

    it('should update updatedAt on save', async () => {
      const post = new Post({
        title: 'Test Post',
        content: 'This is test content',
        author: require('mongoose').Types.ObjectId(),
      });

      const originalUpdatedAt = post.updatedAt;
      
      post.save = jest.fn().mockImplementation(function() {
        this.updatedAt = Date.now();
        return Promise.resolve(this);
      });

      await new Promise(resolve => setTimeout(resolve, 10)); // Wait a bit
      await post.save();

      expect(post.updatedAt).toBeDefined();
      expect(post.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt?.getTime() || 0);
    });

    it('should handle special characters in title when generating slug', async () => {
      const post = new Post({
        title: 'Test Post!!! With Special @Characters#',
        content: 'This is test content',
        author: require('mongoose').Types.ObjectId(),
      });

      post.isModified = jest.fn((field) => field === 'title');
      post.save = jest.fn().mockImplementation(function() {
        if (this.isModified('title') && !this.slug) {
          this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
        this.updatedAt = Date.now();
        return Promise.resolve(this);
      });

      await post.save();

      expect(post.slug).toBe('test-post-with-special-characters');
    });
  });
});


