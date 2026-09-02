/**
 * Legal Provision Routes
 * Matches Legal Provision Table endpoints in context/backend.md
 */

const express = require('express');
const router = express.Router();
const provisionController = require('../controllers/provision.controller');

// GET /provisions - List legal provisions with law/section filters
router.get('/', provisionController.list);

// GET /provisions/:id - Get single legal provision
router.get('/:id', provisionController.getById);

module.exports = router;
