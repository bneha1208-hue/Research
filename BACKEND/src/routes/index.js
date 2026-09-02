/**
 * Master API Router
 * Assembles all domain routers under /api/v1 (and alias /api)
 */

const express = require('express');
const router = express.Router();

const termRoutes = require('./term.routes');
const categoryRoutes = require('./category.routes');
const favoriteRoutes = require('./favorite.routes');
const adminRoutes = require('./admin.routes');
const caseRoutes = require('./case.routes');
const authRoutes = require('./auth.routes');
const courtRoutes = require('./court.routes');
const provisionRoutes = require('./provision.routes');

const { getMetadata } = require('../services/meta.service');

// Mount Domain Routers
router.use('/auth', authRoutes);
router.use('/courts', courtRoutes);
router.use('/provisions', provisionRoutes);
router.use('/cases', caseRoutes);
router.use('/terms', termRoutes);
router.use('/categories', categoryRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/admin', adminRoutes);

// Metadata & Config Endpoints
router.get('/meta', async (req, res, next) => {
  try {
    const meta = await getMetadata();
    res.status(200).json({
      success: true,
      data: meta,
      error: null
    });
  } catch (err) {
    next(err);
  }
});

// Meta / Info
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: "LegalPrecedent & Legal Dictionary API",
      version: "v1.0.0",
      architecture: "Layered MVC with In-Memory / Extensible DB Support",
      spec: "REST, JSON over HTTP/HTTPS",
      documentation: "See README.md and context/ specifications."
    },
    error: null
  });
});

module.exports = router;
