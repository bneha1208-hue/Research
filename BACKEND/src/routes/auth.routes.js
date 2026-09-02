/**
 * Authentication & User Routes
 * Matches User Table endpoints in context/backend.md
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { requireUser } = require('../middleware/auth.middleware');

// POST /auth/login - User login & role selection
router.post('/login', authController.login);

// POST /auth/register - User registration
router.post('/register', authController.register);

// GET /auth/me - Current user profile
router.get('/me', requireUser, authController.me);

// GET /auth/roles - Available user roles
router.get('/roles', authController.getRoles);

// GET /auth/users - List all users (admin or directory)
router.get('/users', authController.listUsers);

module.exports = router;
