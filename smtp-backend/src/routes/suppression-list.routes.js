const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');
const { createNotification } = require('../helpers/notifications');

// ── GET /api/suppression-list ────────────────────────────────────
router.get('/suppression-list', protect, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT uid, email, reason, created_at as "dateAdded"
       FROM suppression_list
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json({ status: 'success', data: rows });
  } catch (err) {
    console.error('💥 /api/suppression-list GET error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch suppression list' });
  }
});

// ── POST /api/suppression-list ────────────────────────────────
router.post('/suppression-list', protect, async (req, res) => {
  try {
    const { email, reason } = req.body;
    if (!email) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO suppression_list (user_id, email, reason)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, email) DO UPDATE SET reason = EXCLUDED.reason
       RETURNING uid, email, reason, created_at as "dateAdded"`,
      [req.user.id, email.toLowerCase(), reason || null]
    );

    await createNotification(req.user.id, 'Suppression List Updated', `Email "${email}" has been added to the suppression list.`);

    return res.json({ status: 'success', message: 'Email added to suppression list', data: rows[0] });
  } catch (err) {
    console.error('💥 /api/suppression-list POST error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to add to suppression list' });
  }
});

// ── POST /api/suppression-list/bulk ───────────────────────────
router.post('/suppression-list/bulk', protect, async (req, res) => {
  try {
    const { emails } = req.body; // Expecting array of {email, reason}
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No emails provided' });
    }

    let addedCount = 0;
    for (const item of emails) {
      const email = typeof item === 'string' ? item : item.email;
      const reason = typeof item === 'string' ? 'Imported' : (item.reason || 'Imported');
      
      if (!email) continue;
      
      try {
        await pool.query(
          `INSERT INTO suppression_list (user_id, email, reason)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, email) DO NOTHING`,
          [req.user.id, email.toLowerCase(), reason]
        );
        addedCount++;
      } catch (err) {
        console.error('Failed to import suppression email:', email, err);
      }
    }

    await createNotification(req.user.id, 'Suppression List Bulk Import', `Successfully imported ${addedCount} emails to the suppression list.`);

    return res.json({ status: 'success', message: `Successfully imported ${addedCount} emails to suppression list` });
  } catch (err) {
    console.error('💥 /api/suppression-list/bulk POST error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to bulk import' });
  }
});

// ── DELETE /api/suppression-list/all (DELETE ALL) ─────────────────
router.delete('/suppression-list/all', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM suppression_list WHERE user_id = $1', [req.user.id]);
    await createNotification(req.user.id, 'Suppression List Cleared', 'All emails have been removed from the suppression list.');
    return res.json({ status: 'success', message: 'All suppression emails removed' });
  } catch (err) {
    console.error('💥 /api/suppression-list DELETE ALL error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to remove all suppression emails' });
  }
});

// ── DELETE /api/suppression-list/:uid ─────────────────────────
router.delete('/suppression-list/:uid', protect, async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Validate UUID to prevent Postgres type errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uid)) {
      return res.status(400).json({ status: 'error', message: 'Invalid suppression email ID format: ' + uid });
    }

    const { rowCount } = await pool.query(
      'DELETE FROM suppression_list WHERE uid = $1 AND user_id = $2',
      [uid, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Suppression email not found' });
    }

    await createNotification(req.user.id, 'Suppression List Updated', 'An email has been removed from the suppression list.');

    return res.json({ status: 'success', message: 'Suppression email removed' });
  } catch (err) {
    console.error('💥 /api/suppression-list/:uid DELETE error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to remove suppression email' });
  }
});

module.exports = router;
