/**
 * Legal Provision Service
 * Manages statutory sections & articles (IPC, BNS, CrPC, BNSS, IT Act, Constitution)
 */

const provisions = require('../db/seeds/provisions.seed');

async function listProvisions({ law, q } = {}) {
  let list = [...provisions];

  if (law) {
    list = list.filter(p => p.law_name.toLowerCase().includes(law.toLowerCase()));
  }

  if (q) {
    const term = q.toLowerCase();
    list = list.filter(p =>
      p.law_name.toLowerCase().includes(term) ||
      (p.section && p.section.toLowerCase().includes(term)) ||
      (p.article && p.article.toLowerCase().includes(term)) ||
      p.description.toLowerCase().includes(term)
    );
  }

  return list;
}

async function getProvisionById(id) {
  return provisions.find(p => p.id === id || String(p.provision_id) === String(id)) || null;
}

module.exports = {
  listProvisions,
  getProvisionById
};
