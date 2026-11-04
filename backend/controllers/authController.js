const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dbService = require('../services/dbService');

const JWT_SECRET = process.env.JWT_SECRET || 'cafeteria_jwt_secret_key_2024';

// Helper: sign JWT
const signToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });

// Helper: build safe user response (strip password)
const sanitizeUser = (user) => ({
  _id: user._id || user.id,
  id: user.id || user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  studentId: user.studentId || '',
  createdAt: user.createdAt,
});

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, studentId } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email, and password are required');
    }

    const existing = await dbService.findUserByEmail(email);
    if (existing) {
      res.status(400);
      throw new Error('Email already in use');
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await dbService.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      studentId: studentId || ''
    });

    const token = signToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are required');
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Support both bcrypt hashes and plain text passwords (e.g. initial demo seed)
    let isMatch = false;
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
      isMatch = bcrypt.compareSync(password, user.password);
    } else {
      isMatch = user.password === password;
    }

    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    const token = signToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
