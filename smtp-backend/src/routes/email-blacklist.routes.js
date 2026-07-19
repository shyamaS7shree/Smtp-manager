const express = require('express');
const pool    = require('../config/db');
const { protect } = require('../middleware/auth');
const { createNotification } = require('../helpers/notifications');
const { generateUid } = require('../helpers/uid');

const router = express.Router();

// ── GET /api/email-blacklist ─────────────────────────────────
router.get('/email-blacklist', protect, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT uid, email, reason, created_at as "dateAdded" FROM email_blacklist WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    return res.json({ status: 'success', data: rows });
  } catch (err) {
    console.error('💥 /api/email-blacklist GET error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch email blacklist' });
  }
});

// ── POST /api/email-blacklist ────────────────────────────────
router.post('/email-blacklist', protect, async (req, res) => {
  try {
    const { email, reason } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO email_blacklist (user_id, email, reason)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, email) DO UPDATE SET reason = EXCLUDED.reason
       RETURNING uid, email, reason, created_at as "dateAdded"`,
      [req.user.id, email.toLowerCase(), reason || null]
    );

    await createNotification(req.user.id, 'Email Blacklist Updated', `Email "${email}" has been added to the blacklist.`);

    return res.json({ status: 'success', message: 'Email added to blacklist', data: rows[0] });
  } catch (err) {
    console.error('💥 /api/email-blacklist POST error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to add to blacklist' });
  }
});

// ── POST /api/email-blacklist/bulk ───────────────────────────
router.post('/email-blacklist/bulk', protect, async (req, res) => {
  try {
    const { emails } = req.body;
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No valid emails provided' });
    }

    let addedCount = 0;
    // Process sequentially (or map to Promise.all if preferred, seq is fine for CSV parsing up to reasonable sizes)
    for (const record of emails) {
      const email = record.email?.trim().toLowerCase();
      const reason = record.reason?.trim() || null;
      if (!email) continue;
      
      try {
        await pool.query(
          `INSERT INTO email_blacklist (user_id, email, reason)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, email) DO NOTHING`,
          [req.user.id, email, reason]
        );
        addedCount++;
      } catch (err) {
        // Ignore single insert errors (e.g. malformed data) and continue
      }
    }

    await createNotification(req.user.id, 'Email Blacklist Bulk Import', `Successfully imported ${addedCount} emails to the blacklist.`);

    return res.json({ status: 'success', message: `Successfully imported ${addedCount} emails to blacklist` });
  } catch (err) {
    console.error('💥 /api/email-blacklist/bulk POST error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to bulk import blacklist' });
  }
});

// ── DELETE /api/email-blacklist/all ──────────────────────────
router.delete('/email-blacklist/all', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM email_blacklist WHERE user_id = $1', [req.user.id]);
    await createNotification(req.user.id, 'Email Blacklist Cleared', 'All emails have been removed from the blacklist.');
    return res.json({ status: 'success', message: 'All emails removed from blacklist' });
  } catch (err) {
    console.error('💥 /api/email-blacklist/all DELETE error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to clear blacklist' });
  }
});

// ── DELETE /api/email-blacklist/:uid ─────────────────────────
router.delete('/email-blacklist/:uid', protect, async (req, res) => {
  try {
    const { uid } = req.params;
    const { rowCount } = await pool.query('DELETE FROM email_blacklist WHERE uid = $1 AND user_id = $2', [uid, req.user.id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Email not found in blacklist' });
    }

    await createNotification(req.user.id, 'Email Blacklist Updated', 'An email has been removed from the blacklist.');

    return res.json({ status: 'success', message: 'Email removed from blacklist' });
  } catch (err) {
    console.error('💥 /api/email-blacklist/:uid DELETE error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to remove from blacklist' });
  }
});

module.exports = router;
