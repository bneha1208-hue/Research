/**
 * Authentication & User Controller
 */

const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    const result = await authService.authenticate(email, password, role);

    res.status(200).json({
      success: true,
      message: "User authenticated successfully",
      data: result,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "Account registered successfully",
      data: result,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getUserById(req.user?.id || req.user?.user_id || "user_001");
    res.status(200).json({
      success: true,
      data: user,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await authService.listUsers();
    res.status(200).json({
      success: true,
      data: users,
      meta: { total: users.length },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

async function getRoles(req, res, next) {
  try {
    const roles = authService.getRoles();
    res.status(200).json({
      success: true,
      data: roles,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  register,
  me,
  listUsers,
  getRoles
};
