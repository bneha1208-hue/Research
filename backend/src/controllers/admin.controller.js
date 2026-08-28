/**
 * Admin Controller
 * Implements Section 7: Content Management (Admin Only)
 */

const adminService = require('../services/admin.service');

async function create(req, res, next) {
  try {
    const { word, meaning, example, origin, categoryId } = req.body;
    const term = await adminService.createTerm({ word, meaning, example, origin, categoryId });

    res.status(201).json({
      success: true,
      data: term,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const term = await adminService.updateTerm(id, req.body);

    res.status(200).json({
      success: true,
      data: term,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const result = await adminService.deleteTerm(id);

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
  create,
  update,
  remove
};
