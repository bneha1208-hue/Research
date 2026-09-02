/**
 * Case & Precedent Routes
 * Matches Case Table, Judgment Table, Similar Case Table in context/backend.md
 */

const express = require('express');
const router = express.Router();
const caseController = require('../controllers/case.controller');

// POST /cases/search - Similarity search & ranking
router.post('/search', caseController.search);

// GET /cases/presets - Pre-configured demo cases
router.get('/presets', caseController.getPresets);

// GET /cases/saved - List saved precedents
router.get('/saved', caseController.listSaved);

// POST /cases/saved - Save precedent to library
router.post('/saved', caseController.addSaved);

// DELETE /cases/saved/:id - Remove saved precedent
router.delete('/saved/:id', caseController.removeSaved);

// POST /cases/compare - Side-by-side case comparison
router.post('/compare', caseController.compare);

// GET /cases - List all precedents with filters (court, year, offence, q)
router.get('/', caseController.list);

// GET /cases/:id - Get single precedent case & judgment details
router.get('/:id', caseController.getById);

module.exports = router;
