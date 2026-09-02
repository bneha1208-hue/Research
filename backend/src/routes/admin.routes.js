/**
 * Admin Routes
 * Implements Section 7: Content Management
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

// Protect all admin routes with requireAdmin middleware
router.use(requireAdmin);

// POST /admin/terms - Create term
router.post('/terms', adminController.create);

// PUT /admin/terms/:id - Update term
router.put('/terms/:id', adminController.update);

// DELETE /admin/terms/:id - Delete term
router.delete('/terms/:id', adminController.remove);

module.exports = router;
