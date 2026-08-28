/**
 * Server Entry Point
 * Industry-Standard Structure: loads app.js and starts listening on PORT
 */

const app = require('./src/app');
const config = require('./src/config');

const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`  LegalPrecedent & Legal Dictionary API Server`);
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log(`  URL:         http://localhost:${config.port}`);
  console.log(`  API v1:      http://localhost:${config.port}${config.apiPrefix}`);
  console.log(`  Cases:       http://localhost:${config.port}${config.apiPrefix}/cases`);
  console.log(`  Courts:      http://localhost:${config.port}${config.apiPrefix}/courts`);
  console.log(`  Provisions:  http://localhost:${config.port}${config.apiPrefix}/provisions`);
  console.log(`  Terms:       http://localhost:${config.port}${config.apiPrefix}/terms`);
  console.log(`=======================================================`);
});

// Handle graceful termination
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
