/**
 * Authentication & Role Authorization Middleware
 * Conforms to Legal Dictionary API Contract conventions:
 * - Public: No header required
 * - User: Authorization: Bearer <user_token>
 * - Admin: Authorization: Bearer <admin_token>
 */

function requireUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication token required. Please sign in to access favorites."
      }
    });
  }

  const token = authHeader.split(' ')[1];
  req.user = {
    id: "user_001",
    name: "Adv. Rajesh Varma",
    role: token.includes('admin') ? "Admin" : "User",
    token
  };
  next();
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      data: null,
      error: {
        code: "UNAUTHORIZED",
        message: "Admin authentication token required."
      }
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token.toLowerCase().includes('admin') && token !== 'demo_admin_secret') {
    return res.status(403).json({
      success: false,
      data: null,
      error: {
        code: "FORBIDDEN",
        message: "Access restricted to administrators."
      }
    });
  }

  req.user = { id: "admin_001", name: "System Administrator", role: "Admin", token };
  next();
}

module.exports = {
  requireUser,
  requireAdmin
};
