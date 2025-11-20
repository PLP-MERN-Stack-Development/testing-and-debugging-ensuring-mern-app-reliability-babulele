// postsController.js - Posts controller
const Post = require('../models/Post');
const Category = require('../models/Category'); // Import Category model to register it
const { logger } = require('../utils/logger');

/**
 * Get all posts with optional filtering and pagination
 */
const getPosts = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10, published } = req.query;
    
    // Build query
    const query = {};
    if (category) {
      query.category = category;
    }
    if (published !== undefined) {
      // Handle both string 'true'/'false' and boolean values
      query.published = published === 'true' || published === true;
    }

    // Calculate pagination
    const skip = Math.max(0, (parseInt(page) - 1) * parseInt(limit));
    const limitNum = Math.max(1, parseInt(limit));

    // Get posts with safe populate (handles missing references)
    let posts = await Post.find(query)
      .populate({
        path: 'author',
        select: 'username email',
      })
      .populate({
        path: 'category',
        select: 'name',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean() for better performance

    // Filter out posts with null authors (deleted users)
    posts = posts.filter(post => post.author !== null);

    // Get total count
    const total = await Post.countDocuments(query);

    res.json({
      posts: posts || [],
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Error fetching posts:', error);
    next(error);
  }
};

/**
 * Get a single post by ID
 */
const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate({
        path: 'author',
        select: 'username email',
      })
      .populate({
        path: 'category',
        select: 'name',
      });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    logger.error('Error fetching post:', error);
    next(error);
  }
};

/**
 * Create a new post
 */
const createPost = async (req, res, next) => {
  try {
    const { title, content, category, tags, published } = req.body;

    const post = await Post.create({
      title,
      content,
      author: req.user.id,
      category: category || null,
      tags: tags || [],
      published: published || false,
    });

    await post.populate({
      path: 'author',
      select: 'username email',
    });
    if (post.category) {
      await post.populate({
        path: 'category',
        select: 'name',
      });
    }

    logger.info(`New post created: ${post.title} by ${req.user.username}`);

    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a post
 */
const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, published } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (category !== undefined) post.category = category || null;
    if (tags) post.tags = tags;
    if (published !== undefined) post.published = published;

    await post.save();
    await post.populate({
      path: 'author',
      select: 'username email',
    });
    if (post.category) {
      await post.populate({
        path: 'category',
        select: 'name',
      });
    }

    logger.info(`Post updated: ${post.title} by ${req.user.username}`);

    res.json(post);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a post
 */
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(id);

    logger.info(`Post deleted: ${post.title} by ${req.user.username}`);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};

