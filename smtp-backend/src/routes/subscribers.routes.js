const express = require('express');
const pool    = require('../config/db');
const { protect }     = require('../middleware/auth');
const { generateUid } = require('../helpers/uid');

const router = express.Router();

// ── Format subscriber row ──────────────────────────────────────
const fmt = (r) => ({
  subscriber_uid: r.uid,
  email:          r.email,
  first_name:     r.first_name,
  last_name:      r.last_name,
  full_name:      `${r.first_name || ''} ${r.last_name || ''}`.trim(),
  status:         r.status,
  ip_address:     r.ip_address,
  source:         r.source,
  date_added:     r.created_at,
  open_count:     r.open_count,
  click_count:    r.click_count,
});

// ── Update list subscriber counts ─────────────────────────────
const updateCounts = async (listUid) => {
  await pool.query(`
    UPDATE lists SET
      subscribers_count = (SELECT COUNT(*) FROM subscribers WHERE list_uid = $1),
      confirmed_count   = (SELECT COUNT(*) FROM subscribers WHERE list_uid = $1 AND status = 'confirmed'),
      updated_at = NOW()
    WHERE uid = $1`, [listUid]);
};

// ── GET /api/get-all-subscribers ──────────────────────────────
router.get('/get-all-subscribers', protect, async (req, res) => {
  try {
    const { list_uid, page_number = 1, per_page = 100 } = req.query;
    if (!list_uid) return res.status(400).json({ status: 'error', message: 'list_uid is required' });

    const limit  = parseInt(per_page);
    const offset = (parseInt(page_number) - 1) * limit;

    const countRes = await pool.query('SELECT COUNT(*) FROM subscribers WHERE list_uid = $1', [list_uid]);
    const count = parseInt(countRes.rows[0].count);

    const { rows } = await pool.query(
      `SELECT * FROM subscribers WHERE list_uid = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [list_uid, limit, offset]
    );

    return res.json({ status: 'success', data: { count, records: rows.map(fmt) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch subscribers', error: e.message });
  }
});

// ── GET /api/get-confirmed-subscribers ────────────────────────
router.get('/get-confirmed-subscribers', protect, async (req, res) => {
  try {
    const { list_uid, page_number = 1, per_page = 100 } = req.query;
    if (!list_uid) return res.status(400).json({ status: 'error', message: 'list_uid is required' });

    const limit  = parseInt(per_page);
    const offset = (parseInt(page_number) - 1) * limit;

    const countRes = await pool.query("SELECT COUNT(*) FROM subscribers WHERE list_uid = $1 AND status = 'confirmed'", [list_uid]);
    const count = parseInt(countRes.rows[0].count);

    const { rows } = await pool.query(
      `SELECT * FROM subscribers WHERE list_uid = $1 AND status = 'confirmed' ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [list_uid, limit, offset]
    );

    return res.json({ status: 'success', data: { count, records: rows.map(fmt) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch confirmed subscribers' });
  }
});

// ── GET /api/get-blacklisted-subscribers ──────────────────────
router.get('/get-blacklisted-subscribers', protect, async (req, res) => {
  try {
    const { list_uid } = req.query;
    if (!list_uid) return res.status(400).json({ status: 'error', message: 'list_uid is required' });

    const { rows } = await pool.query(
      `SELECT * FROM subscribers WHERE list_uid = $1 AND status = 'blacklisted' ORDER BY created_at DESC`,
      [list_uid]
    );
    return res.json({ status: 'success', data: { count: rows.length, records: rows.map(fmt) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch blacklisted subscribers' });
  }
});

// ── POST /api/create-a-subscriber ─────────────────────────────
router.post('/create-a-subscriber', protect, async (req, res) => {
  try {
    const { list_uid, email, first_name, last_name, source = 'web', ip_address = '' } = req.body;
    if (!list_uid || !email) return res.status(400).json({ status: 'error', message: 'list_uid and email are required' });

    // Verify list belongs to user and get opt_in setting
    const listRes = await pool.query('SELECT id, opt_in FROM lists WHERE uid = $1 AND user_id = $2', [list_uid, req.user.id]);
    if (!listRes.rows.length) return res.status(404).json({ status: 'error', message: 'List not found' });

    const list = listRes.rows[0];
    
    // Determine status based on list opt_in if not explicitly provided
    let finalStatus = req.body.status;
    if (!finalStatus) {
      const optIn = String(list.opt_in).toLowerCase();
      if (optIn.includes('double')) {
        finalStatus = 'unconfirmed';
      } else {
        finalStatus = 'confirmed';
      }
    }

    const uid = generateUid();
    const { rows } = await pool.query(
      `INSERT INTO subscribers (uid, list_id, list_uid, email, first_name, last_name, status, ip_address, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [uid, list.id, list_uid, email.toLowerCase(), first_name || '', last_name || '', finalStatus, ip_address, source]
    );

    await updateCounts(list_uid);
    return res.status(201).json({ status: 'success', message: 'Subscriber created.', data: { record: fmt(rows[0]) } });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ status: 'error', message: 'Subscriber with this email already exists in this list.' });
    console.error('💥 create-a-subscriber:', e);
    return res.status(500).json({ status: 'error', message: 'Failed to create subscriber', error: e.message });
  }
});

// ── GET /api/get-one-subscriber ───────────────────────────────
router.get('/get-one-subscriber', protect, async (req, res) => {
  try {
    const { list_uid, subscriber_uid } = req.query;
    if (!list_uid || !subscriber_uid) return res.status(400).json({ status: 'error', message: 'list_uid and subscriber_uid are required' });

    const { rows } = await pool.query('SELECT * FROM subscribers WHERE uid = $1 AND list_uid = $2', [subscriber_uid, list_uid]);
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'Subscriber not found' });
    return res.json({ status: 'success', data: { record: fmt(rows[0]) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch subscriber' });
  }
});

// ── PUT /api/update-a-subscriber ──────────────────────────────
router.put('/update-a-subscriber', protect, async (req, res) => {
  try {
    const { list_uid, subscriber_uid } = req.query;
    const { email, first_name, last_name, status } = req.body;

    const { rows } = await pool.query(
      `UPDATE subscribers SET
         email      = COALESCE($1, email),
         first_name = COALESCE($2, first_name),
         last_name  = COALESCE($3, last_name),
         status     = COALESCE($4, status),
         updated_at = NOW()
       WHERE uid = $5 AND list_uid = $6
       RETURNING *`,
      [email ? email.toLowerCase() : null, first_name || null, last_name || null, status || null, subscriber_uid, list_uid]
    );

    if (!rows.length) return res.status(404).json({ status: 'error', message: 'Subscriber not found' });
    return res.json({ status: 'success', message: 'Subscriber updated.', data: { record: fmt(rows[0]) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to update subscriber' });
  }
});

// ── DELETE /api/delete-one-subscriber ─────────────────────────
router.delete('/delete-one-subscriber', protect, async (req, res) => {
  try {
    const { list_uid, subscriber_uid } = req.query;
    const { rowCount } = await pool.query('DELETE FROM subscribers WHERE uid = $1 AND list_uid = $2', [subscriber_uid, list_uid]);
    if (!rowCount) return res.status(404).json({ status: 'error', message: 'Subscriber not found' });
    await updateCounts(list_uid);
    return res.json({ status: 'success', message: 'Subscriber deleted.' });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to delete subscriber' });
  }
});

// ── DELETE /api/delete-by-email ───────────────────────────────
router.delete('/delete-by-email', protect, async (req, res) => {
  try {
    const { list_uid, email } = req.query;
    const { rowCount } = await pool.query('DELETE FROM subscribers WHERE list_uid = $1 AND email = $2', [list_uid, email.toLowerCase()]);
    if (!rowCount) return res.status(404).json({ status: 'error', message: 'Subscriber not found' });
    await updateCounts(list_uid);
    return res.json({ status: 'success', message: 'Subscriber deleted.' });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to delete subscriber' });
  }
});

// ── GET /api/search-by-email ──────────────────────────────────
router.get('/search-by-email', protect, async (req, res) => {
  try {
    const { list_uid, email } = req.query;
    const { rows } = await pool.query(
      `SELECT * FROM subscribers WHERE list_uid = $1 AND email ILIKE $2 LIMIT 50`,
      [list_uid, `%${email}%`]
    );
    return res.json({ status: 'success', data: { count: rows.length, records: rows.map(fmt) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Search failed' });
  }
});

// ── GET /api/search-by-status ─────────────────────────────────
router.get('/search-by-status', protect, async (req, res) => {
  try {
    const { list_uid, status, page_number = 1, per_page = 100 } = req.query;
    const limit  = parseInt(per_page);
    const offset = (parseInt(page_number) - 1) * limit;

    const conditions = ['list_uid = $1'];
    const params     = [list_uid];
    if (status) { conditions.push(`status = $${params.length + 1}`); params.push(status); }

    const countRes = await pool.query(`SELECT COUNT(*) FROM subscribers WHERE ${conditions.join(' AND ')}`, params);
    const count = parseInt(countRes.rows[0].count);

    const { rows } = await pool.query(
      `SELECT * FROM subscribers
       WHERE ${conditions.join(' AND ')}
       ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    return res.json({ status: 'success', data: { count, records: rows.map(fmt) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to filter subscribers' });
  }
});

// ── POST /api/create-subscribers-in-bulk ──────────────────────
router.post('/create-subscribers-in-bulk', protect, async (req, res) => {
  try {
    const { list_uid, subscribers } = req.body;
    if (!list_uid || !Array.isArray(subscribers) || !subscribers.length) {
      return res.status(400).json({ status: 'error', message: 'list_uid and subscribers[] are required' });
    }

    const listRes = await pool.query('SELECT id FROM lists WHERE uid = $1 AND user_id = $2', [list_uid, req.user.id]);
    if (!listRes.rows.length) return res.status(404).json({ status: 'error', message: 'List not found' });

    const listId = listRes.rows[0].id;
    let imported = 0;

    for (const s of subscribers) {
      if (!s.email) continue;
      try {
        await pool.query(
          `INSERT INTO subscribers (uid, list_id, list_uid, email, first_name, last_name, status, source)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'import')
           ON CONFLICT (list_uid, email) DO NOTHING`,
          [generateUid(), listId, list_uid, s.email.toLowerCase(), s.first_name || '', s.last_name || '', s.status || 'confirmed']
        );
        imported++;
      } catch (_) { /* skip duplicates */ }
    }

    await updateCounts(list_uid);
    return res.json({ status: 'success', message: `${imported} subscribers imported.`, data: { imported, total: subscribers.length } });
  } catch (e) {
    console.error('💥 bulk-import:', e);
    return res.status(500).json({ status: 'error', message: 'Bulk import failed', error: e.message });
  }
});

// ── PUT /api/track-subscriber-open ────────────────────────────
router.put('/track-subscriber-open', protect, async (req, res) => {
  try {
    const { list_uid, subscriber_uid } = req.query;
    await pool.query(
      'UPDATE subscribers SET open_count = open_count + 1, last_open_date = NOW() WHERE uid = $1 AND list_uid = $2',
      [subscriber_uid, list_uid]
    );
    return res.json({ status: 'success', message: 'Open tracked.' });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to track open' });
  }
});

// ── PUT /api/track-subscriber-unsubscribe ─────────────────────
router.put('/track-subscriber-unsubscribe', protect, async (req, res) => {
  try {
    const { list_uid, subscriber_uid } = req.query;
    await pool.query(
      "UPDATE subscribers SET status = 'unsubscribed', updated_at = NOW() WHERE uid = $1 AND list_uid = $2",
      [subscriber_uid, list_uid]
    );
    await updateCounts(list_uid);
    return res.json({ status: 'success', message: 'Subscriber unsubscribed.' });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to unsubscribe' });
  }
});

// ── GET /api/get-unsubscribed-subscribers ─────────────────────
router.get('/get-unsubscribed-subscribers', protect, async (req, res) => {
  try {
    const { list_uid, page_number = 1, per_page = 100 } = req.query;
    if (!list_uid) return res.status(400).json({ status: 'error', message: 'list_uid is required' });

    const limit  = parseInt(per_page);
    const offset = (parseInt(page_number) - 1) * limit;

    const countRes = await pool.query("SELECT COUNT(*) FROM subscribers WHERE list_uid = $1 AND status = 'unsubscribed'", [list_uid]);
    const count = parseInt(countRes.rows[0].count);

    const { rows } = await pool.query(
      `SELECT * FROM subscribers WHERE list_uid = $1 AND status = 'unsubscribed' ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [list_uid, limit, offset]
    );
    return res.json({ status: 'success', data: { count, records: rows.map(fmt) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch unsubscribed subscribers' });
  }
});

// ── GET /api/get-unconfirmed-subscribers ──────────────────────
router.get('/get-unconfirmed-subscribers', protect, async (req, res) => {
  try {
    const { list_uid, page_number = 1, per_page = 100 } = req.query;
    if (!list_uid) return res.status(400).json({ status: 'error', message: 'list_uid is required' });

    const limit  = parseInt(per_page);
    const offset = (parseInt(page_number) - 1) * limit;

    const countRes = await pool.query("SELECT COUNT(*) FROM subscribers WHERE list_uid = $1 AND status = 'unconfirmed'", [list_uid]);
    const count = parseInt(countRes.rows[0].count);

    const { rows } = await pool.query(
      `SELECT * FROM subscribers WHERE list_uid = $1 AND status = 'unconfirmed' ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [list_uid, limit, offset]
    );
    return res.json({ status: 'success', data: { count, records: rows.map(fmt) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch unconfirmed subscribers' });
  }
});

module.exports = router;
