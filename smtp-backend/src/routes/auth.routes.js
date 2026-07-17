const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const pool     = require('../config/db');
const { generateUid } = require('../helpers/uid');

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });

// ─────────────────────────────────────────────────────────────
// POST /api/register
// Body: { name, email, password }
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 6 characters.' });
    }

    // Check duplicate
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ status: 'error', message: 'An account with this email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const uid    = generateUid();

    const { rows } = await pool.query(
      `INSERT INTO users (uid, name, email, password, role)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING id, uid, name, email, role`,
      [uid, name.trim(), email.toLowerCase(), hashed]
    );

    const user  = rows[0];
    const token = signToken(user.id);

    return res.status(201).json({
      status:  'success',
      message: 'Account created successfully.',
      user: { id: user.id, name: user.name, email: user.email },
      authorisation: {
        token,
        type:         'bearer',
        ttl:          1440,
        generated_at: Math.floor(Date.now() / 1000),
      },
    });
  } catch (error) {
    console.error('💥 register error:', error);
    return res.status(500).json({ status: 'error', message: 'Registration failed.', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/single-login   ← matches MailWizz endpoint name
// Body: { email, password }
// ─────────────────────────────────────────────────────────────
router.post('/single-login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required.' });
    }

    const emailLower = email.toLowerCase();

    // 1. Check if the email is in the allowed_emails table
    const allowedCheck = await pool.query(
      'SELECT email FROM allowed_emails WHERE email = $1',
      [emailLower]
    );

    if (allowedCheck.rows.length === 0) {
      console.log(`❌ Rejected unauthorized email login attempt: ${emailLower}`);
      return res.status(401).json({ status: 'error', message: 'Email not authorized for login.' });
    }

    // 2. Check if the user already exists in the main users table
    let { rows } = await pool.query(
      'SELECT id, uid, name, email, password, role, is_active FROM users WHERE email = $1',
      [emailLower]
    );

    let user = rows[0];

    // If user does not exist in users table but IS allowed, auto-register them
    if (!user) {
      const uid = generateUid();
      const dummyPassword = await bcrypt.hash(uid, 12);
      const name = email.split('@')[0]; // Extract name from email

      const insertResult = await pool.query(
        `INSERT INTO users (uid, name, email, password, role)
         VALUES ($1, $2, $3, $4, 'admin')
         RETURNING id, uid, name, email, role, is_active`,
        [uid, name, emailLower, dummyPassword]
      );
      user = insertResult.rows[0];
      console.log(`🆕 Auto-registered allowed user: ${user.email}`);
    }

    if (!user.is_active) {
      return res.status(401).json({ status: 'error', message: 'Account is deactivated.' });
    }

    // No password check needed
    const token = signToken(user.id);
    console.log(`✅ Login: ${user.email}`);

    return res.status(200).json({
      status: 'success',
      user: { id: user.id, name: user.name, email: user.email },
      authorisation: {
        token,
        type:         'bearer',
        ttl:          1440,
        generated_at: Math.floor(Date.now() / 1000),
      },
    });
  } catch (error) {
    console.error('💥 login error:', error);
    return res.status(500).json({ status: 'error', message: 'Authentication failed.' });
  }
});

module.exports = router;
