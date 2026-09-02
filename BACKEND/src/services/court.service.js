/**
 * Court Service
 * Manages Indian court hierarchy data
 */

const courts = require('../db/seeds/courts.seed');

async function listCourts({ level, q } = {}) {
  let list = [...courts];

  if (level) {
    list = list.filter(c => c.level.toLowerCase() === level.toLowerCase());
  }

  if (q) {
    const term = q.toLowerCase();
    list = list.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.location.toLowerCase().includes(term)
    );
  }

  return list;
}

async function getCourtById(id) {
  return courts.find(c => c.id === id || String(c.court_id) === String(id)) || null;
}

module.exports = {
  listCourts,
  getCourtById
};
