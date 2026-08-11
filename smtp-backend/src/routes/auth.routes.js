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
// Body: { email }
// ─────────────────────────────────────────────────────────────
router.post('/single-login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required.' });
    }

    const emailLower = email.toLowerCase();

    // 1. Check if the user already exists in the main users table
    let { rows } = await pool.query(
      'SELECT id, uid, name, email, password, role, is_active FROM users WHERE email = $1',
      [emailLower]
    );

    let user = rows[0];

    // If user exists, log them in immediately! No PIN required.
    if (user) {
      if (!user.is_active) {
        return res.status(401).json({ status: 'error', message: 'Account is deactivated.' });
      }

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
    }

    // 2. If user DOES NOT exist, send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      `INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at`,
      [emailLower, otp, expiresAt]
    );

    // Send email via nodemailer
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: emailLower,
      subject: 'Your Login PIN Code',
      text: `Your login PIN is: ${otp}. It expires in 10 minutes.`,
      html: `<h2>Your Login PIN Code</h2><p>Your PIN is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`,
    });

    console.log(`📧 OTP sent to new user: ${emailLower}`);

    return res.status(200).json({
      status: 'otp_required',
      message: 'A 6-digit PIN has been sent to your email to authenticate.',
    });

  } catch (error) {
    console.error('💥 login error:', error);
    return res.status(500).json({ status: 'error', message: 'Authentication failed.' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/verify-otp
// Body: { email, otp }
// ─────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ status: 'error', message: 'Email and OTP are required.' });
    }

    const emailLower = email.toLowerCase();

    const otpCheck = await pool.query(
      'SELECT * FROM otps WHERE email = $1 AND otp = $2 AND expires_at > NOW()',
      [emailLower, otp]
    );

    if (otpCheck.rows.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Invalid or expired PIN.' });
    }

    // OTP is valid. Clear it.
    await pool.query('DELETE FROM otps WHERE email = $1', [emailLower]);

    // Create the user
    const uid = generateUid();
    const dummyPassword = await bcrypt.hash(uid, 12);
    const name = email.split('@')[0];

    const insertResult = await pool.query(
      `INSERT INTO users (uid, name, email, password, role)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING id, uid, name, email, role, is_active`,
      [uid, name, emailLower, dummyPassword]
    );
    const user = insertResult.rows[0];

    // Add to allowed_emails automatically
    await pool.query(
      `INSERT INTO allowed_emails (email) VALUES ($1) ON CONFLICT DO NOTHING`,
      [emailLower]
    );

    console.log(`🆕 Auto-registered and authenticated new user: ${user.email}`);

    const token = signToken(user.id);

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
    console.error('💥 verify otp error:', error);
    return res.status(500).json({ status: 'error', message: 'Verification failed.' });
  }
});

module.exports = router;
