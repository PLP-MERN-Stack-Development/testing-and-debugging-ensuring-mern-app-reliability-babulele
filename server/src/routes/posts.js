// posts.js - Posts routes
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postsController');
const { authenticate } = require('../middleware/auth');

// Middleware to check validation results
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// Validation middleware
const postValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
];

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', authenticate, postValidation, checkValidation, createPost);
router.put('/:id', authenticate, postValidation, checkValidation, updatePost);
router.delete('/:id', authenticate, deletePost);

module.exports = router;

