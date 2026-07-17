const express = require('express');
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/notifications ──────────────────────────────────────
router.get('/notifications', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch notifications that haven't expired
    const { rows } = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 100`,
      [userId]
    );

    return res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error('💥 Error fetching notifications:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch notifications' });
  }
});

// ── PUT /api/notifications/:id/read ────────────────────────────
router.put('/notifications/:id/read', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    return res.json({ status: 'success', message: 'Notification marked as read' });
  } catch (error) {
    console.error('💥 Error marking notification as read:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update notification' });
  }
});

// ── PUT /api/notifications/read-all ────────────────────────────
router.put('/notifications/read-all', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
      [userId]
    );

    return res.json({ status: 'success', message: 'All notifications marked as read' });
  } catch (error) {
    console.error('💥 Error marking all notifications as read:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update notifications' });
  }
});

module.exports = router;
