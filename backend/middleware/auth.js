const jwt = require('jsonwebtoken');
const dbService = require('../services/dbService');

const JWT_SECRET = process.env.JWT_SECRET || 'cafeteria_jwt_secret_key_2024';

/**
 * protect — verify JWT token from Authorization header (Bearer <token>)
 * Attaches decoded user object to req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await dbService.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found, token invalid' });
    }
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

/**
 * authorize(...roles) — restrict access to specific roles
 * Must be used AFTER protect middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user ? req.user.role : 'unknown'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
