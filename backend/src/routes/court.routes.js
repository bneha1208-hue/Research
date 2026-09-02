/**
 * Court Routes
 * Matches Court Table endpoints in context/backend.md
 */

const express = require('express');
const router = express.Router();
const courtController = require('../controllers/court.controller');

// GET /courts - List all courts with optional level filter
router.get('/', courtController.list);

// GET /courts/:id - Get single court
router.get('/:id', courtController.getById);

module.exports = router;
