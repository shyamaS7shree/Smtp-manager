const express = require('express');
const pool    = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/dashboard/stats ───────────────────────────────────
router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const [campaigns, lists, templates, subscribers] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM campaigns WHERE user_id = $1', [req.user.id]),
      pool.query('SELECT COUNT(*) FROM lists WHERE user_id = $1 AND is_archived = false', [req.user.id]),
      pool.query('SELECT COUNT(*) FROM templates WHERE user_id = $1 AND is_active = true', [req.user.id]),
      pool.query(`SELECT COUNT(*) FROM subscribers
                  WHERE list_uid IN (SELECT uid FROM lists WHERE user_id = $1)
                  AND status = 'confirmed'`, [req.user.id]),
    ]);

    return res.json({
      status: 'success',
      data: {
        campaigns:   parseInt(campaigns.rows[0].count),
        lists:       parseInt(lists.rows[0].count),
        templates:   parseInt(templates.rows[0].count),
        subscribers: parseInt(subscribers.rows[0].count),
      },
    });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
