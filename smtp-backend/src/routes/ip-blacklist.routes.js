const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');
const { createNotification } = require('../helpers/notifications');

// ── GET /api/ip-blacklist ────────────────────────────────────
router.get('/ip-blacklist', protect, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT uid, ip_address as "ip", reason, created_at as "dateAdded"
       FROM ip_blacklist
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.json({ status: 'success', data: rows });
  } catch (err) {
    console.error('💥 /api/ip-blacklist GET error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch IP blacklist' });
  }
});

// ── POST /api/ip-blacklist ────────────────────────────────
router.post('/ip-blacklist', protect, async (req, res) => {
  try {
    const { ip, reason } = req.body;
    if (!ip) {
      return res.status(400).json({ status: 'error', message: 'IP address is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO ip_blacklist (user_id, ip_address, reason)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, ip_address) DO UPDATE SET reason = EXCLUDED.reason
       RETURNING uid, ip_address as "ip", reason, created_at as "dateAdded"`,
      [req.user.id, ip.trim(), reason || null]
    );

    await createNotification(req.user.id, 'IP Blacklist Updated', `IP address "${ip}" has been added to the blacklist.`);

    return res.json({ status: 'success', message: 'IP address added to blacklist', data: rows[0] });
  } catch (err) {
    console.error('💥 /api/ip-blacklist POST error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to add IP to blacklist' });
  }
});

// ── POST /api/ip-blacklist/bulk ───────────────────────────
router.post('/ip-blacklist/bulk', protect, async (req, res) => {
  try {
    const { ips } = req.body; // Expecting array of {ip, reason}
    if (!ips || !Array.isArray(ips) || ips.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No IP addresses provided' });
    }

    let addedCount = 0;
    for (const item of ips) {
      const ip = typeof item === 'string' ? item : item.ip;
      const reason = typeof item === 'string' ? 'Imported' : (item.reason || 'Imported');
      
      if (!ip) continue;
      
      try {
        await pool.query(
          `INSERT INTO ip_blacklist (user_id, ip_address, reason)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, ip_address) DO NOTHING`,
          [req.user.id, ip.trim(), reason]
        );
        addedCount++;
      } catch (err) {
        console.error('Failed to import IP:', ip, err);
      }
    }

    await createNotification(req.user.id, 'IP Blacklist Bulk Import', `Successfully imported ${addedCount} IP addresses to the blacklist.`);

    return res.json({ status: 'success', message: `Successfully imported ${addedCount} IP addresses to blacklist` });
  } catch (err) {
    console.error('💥 /api/ip-blacklist/bulk POST error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to bulk import IPs' });
  }
});

// ── DELETE /api/ip-blacklist/all (DELETE ALL) ─────────────────
router.delete('/ip-blacklist/all', protect, async (req, res) => {
  try {
    await pool.query('DELETE FROM ip_blacklist WHERE user_id = $1', [req.user.id]);
    await createNotification(req.user.id, 'IP Blacklist Cleared', 'All IP addresses have been removed from the blacklist.');
    return res.json({ status: 'success', message: 'All IP addresses removed from blacklist' });
  } catch (err) {
    console.error('💥 /api/ip-blacklist DELETE ALL error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to remove all IPs' });
  }
});

// ── DELETE /api/ip-blacklist/:uid ─────────────────────────
router.delete('/ip-blacklist/:uid', protect, async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Validate UUID to prevent Postgres type errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uid)) {
      return res.status(400).json({ status: 'error', message: 'Invalid IP Blacklist ID format: ' + uid });
    }

    const { rowCount } = await pool.query(
      'DELETE FROM ip_blacklist WHERE uid = $1 AND user_id = $2',
      [uid, req.user.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'IP address not found in blacklist' });
    }

    await createNotification(req.user.id, 'IP Blacklist Updated', 'An IP address has been removed from the blacklist.');

    return res.json({ status: 'success', message: 'IP address removed from blacklist' });
  } catch (err) {
    console.error('💥 /api/ip-blacklist/:uid DELETE error:', err);
    return res.status(500).json({ status: 'error', message: 'Failed to remove IP' });
  }
});

module.exports = router;
