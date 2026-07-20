const express = require('express');
const pool    = require('../config/db');
const { protect }     = require('../middleware/auth');
const { generateUid } = require('../helpers/uid');

const router = express.Router();

const fmt = (r) => ({
  template_uid: r.uid,
  name:         r.name,
  screenshot:   r.screenshot || '',
  category:     r.category || 'general',
  category_name: r.category || 'general',
  is_active:    r.is_active ? 'yes' : 'no',
  date_added:   r.created_at,
  created_at:   r.created_at,
  updated_at:   r.updated_at || r.created_at,
  last_updated: r.updated_at || r.created_at,
  content:      r.content || '',
  plain_text:   r.plain_text || '',
  meta: { content: r.content, plain_text: r.plain_text },
});

// ── GET /api/get-all-templates ─────────────────────────────────
router.get('/get-all-templates', protect, async (req, res) => {
  try {
    const page   = parseInt(req.query.page_number) || 1;
    const limit  = parseInt(req.query.per_page)    || 10;
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT *, COUNT(*) OVER() AS total_count
       FROM templates WHERE user_id = $1 AND is_active = true
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const count = rows.length ? parseInt(rows[0].total_count) : 0;
    return res.json({ status: 'success', data: { count, total_pages: Math.ceil(count / limit), current_page: page, records: rows.map(fmt) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch templates', error: e.message });
  }
});

// ── GET /api/get-one-template & /api/template/get-one-template ──
router.get(['/get-one-template', '/template/get-one-template'], protect, async (req, res) => {
  try {
    const uid = req.query.template_uid || req.query.uid;
    if (!uid) return res.status(400).json({ status: 'error', message: 'template_uid is required' });

    const { rows } = await pool.query('SELECT * FROM templates WHERE uid = $1 AND user_id = $2', [uid, req.user.id]);
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'Template not found' });
    return res.json({ status: 'success', data: { record: fmt(rows[0]) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch template' });
  }
});

// ── POST /api/create-template & /api/template/create-template ──
router.post(['/create-template', '/template/create-template'], protect, async (req, res) => {
  try {
    const { name, content, plain_text, category } = req.body;
    if (!name) return res.status(400).json({ status: 'error', message: 'name is required' });

    const uid = generateUid();
    const { rows } = await pool.query(
      `INSERT INTO templates (uid, user_id, name, content, plain_text, category)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [uid, req.user.id, name.trim(), content || '', plain_text || '', category || 'general']
    );

    return res.status(201).json({ status: 'success', message: 'Template created.', data: { record: fmt(rows[0]) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to create template', error: e.message });
  }
});

// ── PUT /api/update-template & /api/template/update-template ──
router.put(['/update-template', '/template/update-template'], protect, async (req, res) => {
  try {
    const uid = req.query.template_uid || req.body.template_uid;
    const { name, content, plain_text, category } = req.body;

    const { rows } = await pool.query(
      `UPDATE templates SET
         name       = COALESCE($1, name),
         content    = COALESCE($2, content),
         plain_text = COALESCE($3, plain_text),
         category   = COALESCE($4, category),
         updated_at = NOW()
       WHERE uid = $5 AND user_id = $6
       RETURNING *`,
      [name || null, content || null, plain_text || null, category || null, uid, req.user.id]
    );

    if (!rows.length) return res.status(404).json({ status: 'error', message: 'Template not found' });
    return res.json({ status: 'success', message: 'Template updated.', data: { record: fmt(rows[0]) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to update template' });
  }
});

// ── DELETE /api/delete-template & /api/template/delete-template ──
router.delete(['/delete-template', '/template/delete-template'], protect, async (req, res) => {
  try {
    const uid = req.query.template_uid || req.body.template_uid;
    const { rowCount } = await pool.query('DELETE FROM templates WHERE uid = $1 AND user_id = $2', [uid, req.user.id]);
    if (!rowCount) return res.status(404).json({ status: 'error', message: 'Template not found' });
    return res.json({ status: 'success', message: 'Template deleted.' });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to delete template' });
  }
});

module.exports = router;
