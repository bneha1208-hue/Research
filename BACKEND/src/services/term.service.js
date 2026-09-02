/**
 * Term Service
 * Business logic for searching, filtering, and retrieving legal terms
 */

let termsData = require('../db/seeds/terms.seed');
const categoriesData = require('../db/seeds/categories.seed');

// Share analytics storage
const shareAnalytics = [];

async function listTerms({ q, categoryId, page = 1, limit = 20 }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

  let results = [...termsData];

  // Category filter
  if (categoryId) {
    results = results.filter(t => t.categoryId === categoryId);
  }

  // Search filter (word and meaning)
  if (q && q.trim()) {
    const term = q.trim().toLowerCase();
    results = results.filter(t => 
      t.word.toLowerCase().includes(term) ||
      t.meaning.toLowerCase().includes(term) ||
      (t.origin && t.origin.toLowerCase().includes(term))
    );
  }

  const totalItems = results.length;
  const totalPages = Math.ceil(totalItems / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginatedItems = results.slice(startIndex, startIndex + limitNum);

  // Return trimmed Term object as specified in Section 4 of API contract
  const trimmed = paginatedItems.map(item => ({
    id: item.id,
    word: item.word,
    slug: item.slug,
    meaning: item.meaning,
    categoryId: item.categoryId
  }));

  return {
    items: trimmed,
    meta: {
      page: pageNum,
      limit: limitNum,
      totalItems,
      totalPages
    }
  };
}

async function getTermById(id) {
  const term = termsData.find(t => t.id === id || t.slug === id);
  return term || null;
}

async function getRandomTerm() {
  if (!termsData.length) return null;
  const randomIndex = Math.floor(Math.random() * termsData.length);
  return termsData[randomIndex];
}

async function recordShare(id, { variant = 'story', platform = 'whatsapp' }) {
  const record = {
    id: `share_${Date.now()}`,
    termId: id,
    variant,
    platform,
    timestamp: new Date().toISOString()
  };
  shareAnalytics.push(record);
  return { recorded: true };
}

module.exports = {
  listTerms,
  getTermById,
  getRandomTerm,
  recordShare,
  _termsData: termsData
};
