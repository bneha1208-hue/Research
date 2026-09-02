/**
 * Legal Provision Controller
 */

const provisionService = require('../services/provision.service');

async function list(req, res, next) {
  try {
    const { law, q } = req.query;
    const provisions = await provisionService.listProvisions({ law, q });

    res.status(200).json({
      success: true,
      data: provisions,
      meta: { total: provisions.length },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const provision = await provisionService.getProvisionById(req.params.id);
    if (!provision) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          code: "PROVISION_NOT_FOUND",
          message: "No legal provision found matching the provided ID."
        }
      });
    }

    res.status(200).json({
      success: true,
      data: provision,
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
