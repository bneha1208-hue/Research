/**
 * Application Configuration & Environment Variables
 */

require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: '/api/v1',
  baseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
  defaultPageLimit: 20,
  maxPageLimit: 50,
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

module.exports = config;
