/**
 * Court Controller
 */

const courtService = require('../services/court.service');

async function list(req, res, next) {
  try {
    const { level, q } = req.query;
    const courts = await courtService.listCourts({ level, q });

    res.status(200).json({
      success: true,
      data: courts,
      meta: { total: courts.length },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const court = await courtService.getCourtById(req.params.id);
    if (!court) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: "COURT_NOT_FOUND",
          message: "No court found matching the provided ID."
        }
      });
    }

    res.status(200).json({
      success: true,
      data: court,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getById
};
