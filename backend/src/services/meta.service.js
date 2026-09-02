/**
 * Meta Service
 * Aggregates courts, legal provisions, demo presets, and user roles for frontend initialization
 */

const courts = require('../db/seeds/courts.seed');
const provisions = require('../db/seeds/provisions.seed');
const { demoPresets } = require('../db/seeds/precedents.seed');
const { ROLES } = require('../db/seeds/users.seed');

async function getMetadata() {
  return {
    courts,
    legalProvisions: provisions,
    demoPresets,
    roles: ROLES,
    laws: [
      "Indian Penal Code (IPC)",
      "Bharatiya Nyaya Sanhita (BNS)",
      "Code of Criminal Procedure (CrPC)",
      "Bharatiya Nagarik Suraksha Sanhita (BNSS)",
      "Information Technology Act, 2000",
      "Constitution of India"
    ],
    supportedCourtLevels: [
      "Apex Court",
      "High Court",
      "Sessions Court",
      "Magistrate Court"
    ]
  };
}

module.exports = {
  getMetadata
};
