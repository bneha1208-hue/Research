/**
 * Express Application Configuration
 * Layered middleware pipeline: CORS -> Logger -> Parsers -> Routes -> 404 -> Centralized Error Handler
 */

const express = require('express');
const cors = require('cors');
const config = require('./config');
const requestLogger = require('./middleware/logger.middleware');
const errorHandler = require('./middleware/error.middleware');
const apiRoutes = require('./routes');

const app = express();

// 1. Cross-Origin & Body Parsers
app.use(cors(config.corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Logging Middleware
app.use(requestLogger);

// 3. Mount API Routes (/api/v1 and alias /api)
app.use(config.apiPrefix, apiRoutes);
app.use('/api', apiRoutes);

// Root Welcome & Discovery Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: "LegalPrecedent & Legal Dictionary API Server",
      version: "1.0.0",
      docs: `${config.apiPrefix}/info`,
      meta: `${config.apiPrefix}/meta`,
      endpoints: {
        precedents: [
          `POST ${config.apiPrefix}/cases/search`,
          `GET  ${config.apiPrefix}/cases`,
          `GET  ${config.apiPrefix}/cases/:id`,
          `POST ${config.apiPrefix}/cases/compare`,
          `GET  ${config.apiPrefix}/cases/presets`,
          `GET  ${config.apiPrefix}/cases/saved`,
          `POST ${config.apiPrefix}/cases/saved`,
          `DELETE ${config.apiPrefix}/cases/saved/:id`
        ],
        courts: [
          `GET  ${config.apiPrefix}/courts`,
          `GET  ${config.apiPrefix}/courts/:id`
        ],
        provisions: [
          `GET  ${config.apiPrefix}/provisions`,
          `GET  ${config.apiPrefix}/provisions/:id`
        ],
        auth: [
          `POST ${config.apiPrefix}/auth/login`,
          `POST ${config.apiPrefix}/auth/register`,
          `GET  ${config.apiPrefix}/auth/me`,
          `GET  ${config.apiPrefix}/auth/roles`
        ],
        dictionary: [
          `GET  ${config.apiPrefix}/categories`,
          `GET  ${config.apiPrefix}/terms`,
          `GET  ${config.apiPrefix}/terms/random`,
          `GET  ${config.apiPrefix}/terms/:id`,
          `GET  ${config.apiPrefix}/terms/:id/image`,
          `POST ${config.apiPrefix}/terms/:id/share`,
          `GET  ${config.apiPrefix}/favorites`,
          `POST ${config.apiPrefix}/favorites`,
          `DELETE ${config.apiPrefix}/favorites/:id`
        ],
        admin: [
          `POST ${config.apiPrefix}/admin/terms`,
          `PUT  ${config.apiPrefix}/admin/terms/:id`,
          `DELETE ${config.apiPrefix}/admin/terms/:id`
        ]
      }
    },
    error: null
  });
});

// 4. Handle Undefined 404 Routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found.`
    }
  });
});

// 5. Centralized Error Handler
app.use(errorHandler);

module.exports = app;
