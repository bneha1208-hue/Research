/**
 * Category Controller
 * Implements Section 4: GET /categories
 */

const categories = require('../db/seeds/categories.seed');

async function list(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      data: categories,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list
};
