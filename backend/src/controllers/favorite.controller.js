/**
 * Favorites Controller
 * Implements Section 6: Signed-in User Favorites
 */

const favoriteService = require('../services/favorite.service');

async function add(req, res, next) {
  try {
    const { termId } = req.body;
    if (!termId) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "BAD_REQUEST",
          message: "termId is required in request body."
        }
      });
    }

    const userId = req.user.id;
    const favorite = await favoriteService.addFavorite(userId, termId);

    res.status(201).json({
      success: true,
      data: favorite,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const userId = req.user.id;
    const { page, limit } = req.query;
    const { items, meta } = await favoriteService.listFavorites(userId, { page, limit });

    res.status(200).json({
      success: true,
      data: items,
      meta,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { favoriteId } = req.params;
    const userId = req.user.id;
    const result = await favoriteService.removeFavorite(userId, favoriteId);

    res.status(200).json({
      success: true,
      data: result,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  add,
  list,
  remove
};
