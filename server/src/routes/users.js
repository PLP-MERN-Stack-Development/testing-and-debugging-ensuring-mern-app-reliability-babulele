// users.js - Users routes
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/usersController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

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
const updateUserValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
];

router.get('/', authenticate, authorizeAdmin, getUsers);
router.get('/:id', authenticate, getUser);
router.put('/:id', authenticate, updateUserValidation, checkValidation, updateUser);
router.delete('/:id', authenticate, authorizeAdmin, deleteUser);

module.exports = router;

