/**
 * Favorites Routes
 * Implements Section 6: Signed-in User Favorites
 */

const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favorite.controller');
const { requireUser } = require('../middleware/auth.middleware');

// Protect all favorite routes with requireUser middleware
router.use(requireUser);

// POST /favorites - Save a term to favorites
router.post('/', favoriteController.add);

// GET /favorites - List user's saved terms
router.get('/', favoriteController.list);

// DELETE /favorites/:favoriteId - Remove a term from favorites
router.delete('/:favoriteId', favoriteController.remove);

module.exports = router;
