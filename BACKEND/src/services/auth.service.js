/**
 * Authentication & User Service
 * Manages user accounts and roles defined in context/backend.md
 */

const { users, ROLES } = require('../db/seeds/users.seed');

let userDatabase = [...users];

async function authenticate(email, password, role) {
  if (!email) {
    const error = new Error("Email is required for authentication.");
    error.code = "INVALID_CREDENTIALS";
    error.statusCode = 400;
    throw error;
  }

  let user = userDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    user = {
      id: `user_${Date.now()}`,
      user_id: userDatabase.length + 1,
      name: email.split('@')[0].replace('.', ' '),
      email: email.toLowerCase(),
      role: role && ROLES.includes(role) ? role : "Lawyer",
      phone: "+91 98400 00000",
      createdAt: new Date().toISOString()
    };
    userDatabase.push(user);
  } else if (role && ROLES.includes(role)) {
    user.role = role;
  }

  const token = `jwt_token_${user.id || user.user_id}_${Date.now()}`;

  return {
    user: sanitizeUser(user),
    token
  };
}

async function register(userData) {
  const { name, email, role, phone, practice_areas, bar_council_id } = userData;

  if (!name || !email) {
    const error = new Error("Name and email are required fields.");
    error.code = "VALIDATION_FAILED";
    error.statusCode = 400;
    throw error;
  }

  const existing = userDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    const error = new Error("User with this email already exists.");
    error.code = "USER_EXISTS";
    error.statusCode = 409;
    throw error;
  }

  const newUser = {
    id: `user_${Date.now()}`,
    user_id: userDatabase.length + 1,
    name,
    email: email.toLowerCase(),
    role: role && ROLES.includes(role) ? role : "Lawyer",
    phone: phone || "+91 98400 12345",
    practice_areas: practice_areas || ["General Practice"],
    bar_council_id: bar_council_id || null,
    createdAt: new Date().toISOString()
  };

  userDatabase.push(newUser);

  const token = `jwt_token_${newUser.id}_${Date.now()}`;

  return {
    user: sanitizeUser(newUser),
    token
  };
}

async function listUsers() {
  return userDatabase.map(sanitizeUser);
}

async function getUserById(id) {
  const user = userDatabase.find(u => u.id === id || String(u.user_id) === String(id));
  return user ? sanitizeUser(user) : null;
}

function getRoles() {
  return ROLES;
}

function sanitizeUser(user) {
  const { password, ...sanitized } = user;
  return sanitized;
}

module.exports = {
  authenticate,
  register,
  listUsers,
  getUserById,
  getRoles
};
