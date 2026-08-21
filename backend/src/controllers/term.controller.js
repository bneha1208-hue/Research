/**
 * Term Controller
 * Implements Section 4 & 5 of Legal Dictionary API Contract
 */

const termService = require('../services/term.service');
const imageService = require('../services/image.service');

async function list(req, res, next) {
  try {
    const { q, categoryId, page, limit } = req.query;
    const { items, meta } = await termService.listTerms({ q, categoryId, page, limit });
    
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

async function getById(req, res, next) {
  try {
    const { id } = req.params;
    const term = await termService.getTermById(id);
    
    if (!term) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: "TERM_NOT_FOUND",
          message: "No legal term exists with this id."
        }
      });
    }

    res.status(200).json({
      success: true,
      data: term,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function getRandom(req, res, next) {
  try {
    const term = await termService.getRandomTerm();
    if (!term) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: "NO_TERMS_AVAILABLE",
          message: "No legal terms found in database."
        }
      });
    }

    res.status(200).json({
      success: true,
      data: term,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function getImage(req, res, next) {
  try {
    const { id } = req.params;
    const { variant } = req.query;

    const imageData = await imageService.getShareImages(id, variant);
    if (!imageData) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: "TERM_NOT_FOUND",
          message: "No legal term exists with this id."
        }
      });
    }

    res.status(200).json({
      success: true,
      data: imageData,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function share(req, res, next) {
  try {
    const { id } = req.params;
    const { variant, platform } = req.body || {};
    const result = await termService.recordShare(id, { variant, platform });

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
  list,
  getById,
  getRandom,
  getImage,
  share
};
