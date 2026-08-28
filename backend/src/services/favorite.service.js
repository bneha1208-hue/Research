/**
 * Favorites Service
 * Section 6: Signed-in User Favorites
 */

const { getTermById } = require('./term.service');

// In-memory favorites store
let favoritesStore = [
  {
    favoriteId: "fav_331",
    userId: "user_001",
    termId: "term_0192",
    savedAt: "2026-08-14T10:30:00Z"
  }
];

async function addFavorite(userId, termId) {
  const term = await getTermById(termId);
  if (!term) {
    const err = new Error("No legal term exists with this id.");
    err.statusCode = 404;
    err.code = "TERM_NOT_FOUND";
    throw err;
  }

  const alreadySaved = favoritesStore.some(f => f.userId === userId && f.termId === termId);
  if (alreadySaved) {
    const err = new Error("This term is already in your favorites.");
    err.statusCode = 409;
    err.code = "CONFLICT";
    throw err;
  }

  const newFavorite = {
    favoriteId: `fav_${Date.now()}`,
    userId,
    termId,
    savedAt: new Date().toISOString()
  };
  favoritesStore.unshift(newFavorite);

  return {
    favoriteId: newFavorite.favoriteId,
    termId: newFavorite.termId,
    savedAt: newFavorite.savedAt
  };
}

async function listFavorites(userId, { page = 1, limit = 20 }) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

  const userFavorites = favoritesStore.filter(f => f.userId === userId);
  
  const termsList = [];
  for (const fav of userFavorites) {
    const term = await getTermById(fav.termId);
    if (term) {
      termsList.push({
        favoriteId: fav.favoriteId,
        id: term.id,
        word: term.word,
        slug: term.slug,
        meaning: term.meaning,
        categoryId: term.categoryId,
        savedAt: fav.savedAt
      });
    }
  }

  const totalItems = termsList.length;
  const totalPages = Math.ceil(totalItems / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = termsList.slice(startIndex, startIndex + limitNum);

  return {
    items: paginated,
    meta: {
      page: pageNum,
      limit: limitNum,
      totalItems,
      totalPages
    }
  };
}

async function removeFavorite(userId, favoriteId) {
  const initialLength = favoritesStore.length;
  favoritesStore = favoritesStore.filter(
    f => !(f.favoriteId === favoriteId || f.termId === favoriteId)
  );

  if (favoritesStore.length === initialLength) {
    const err = new Error("Favorite item not found.");
    err.statusCode = 404;
    err.code = "NOT_FOUND";
    throw err;
  }

  return { deleted: true };
}

module.exports = {
  addFavorite,
  listFavorites,
  removeFavorite
};
