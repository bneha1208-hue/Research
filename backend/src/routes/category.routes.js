/**
 * Category Routes
 * Implements Section 4: GET /categories
 */

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// GET /categories - Browse all categories
router.get('/', categoryController.list);

module.exports = router;
