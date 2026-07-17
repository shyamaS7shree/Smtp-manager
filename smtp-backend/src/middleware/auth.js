const jwt  = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * JWT middleware — verifies Bearer token from Authorization header or ?token query param.
 * Attaches req.user = { id, uid, name, email, role }
 */
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'No token provided. Please login.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { rows } = await pool.query(
      'SELECT id, uid, name, email, role FROM users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({ status: 'error', message: 'User not found or account disabled.' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ status: 'error', message: 'Invalid token.' });
  }
};

module.exports = { protect };
