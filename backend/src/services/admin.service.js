/**
 * Admin Service
 * Section 7: Content Management CRUD
 */

let termsData = require('../db/seeds/terms.seed');

async function createTerm({ word, meaning, example = null, origin = null, categoryId }) {
  if (!word || !meaning || !categoryId) {
    const err = new Error("word, meaning, and categoryId are required fields.");
    err.statusCode = 400;
    err.code = "BAD_REQUEST";
    throw err;
  }

  const slug = word.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newTerm = {
    id: `term_${Date.now()}`,
    word,
    slug,
    meaning,
    example,
    origin,
    categoryId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  termsData.unshift(newTerm);
  return newTerm;
}

async function updateTerm(id, data) {
  const index = termsData.findIndex(t => t.id === id || t.slug === id);
  if (index === -1) {
    const err = new Error("No legal term exists with this id.");
    err.statusCode = 404;
    err.code = "TERM_NOT_FOUND";
    throw err;
  }

  const existing = termsData[index];
  const updatedTerm = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString()
  };

  if (data.word && data.word !== existing.word) {
    updatedTerm.slug = data.word.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  termsData[index] = updatedTerm;
  return updatedTerm;
}

async function deleteTerm(id) {
  const initialLength = termsData.length;
  termsData = termsData.filter(t => t.id !== id && t.slug !== id);

  if (termsData.length === initialLength) {
    const err = new Error("No legal term exists with this id.");
    err.statusCode = 404;
    err.code = "TERM_NOT_FOUND";
    throw err;
  }

  return { deleted: true };
}

module.exports = {
  createTerm,
  updateTerm,
  deleteTerm
};
