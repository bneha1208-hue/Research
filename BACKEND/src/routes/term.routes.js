/**
 * Term Routes
 * Implements Section 4 & 5 of Legal Dictionary API Contract
 */

const express = require('express');
const router = express.Router();
const termController = require('../controllers/term.controller');

// GET /terms - List and search terms
router.get('/', termController.list);

// GET /terms/random - Word of the Day (must be before /:id)
router.get('/random', termController.getRandom);

// GET /terms/:id - Single term full detail
router.get('/:id', termController.getById);

// GET /terms/:id/image - Shareable image cards
router.get('/:id/image', termController.getImage);

// POST /terms/:id/share - Share analytics tracking
router.post('/:id/share', termController.share);

module.exports = router;
