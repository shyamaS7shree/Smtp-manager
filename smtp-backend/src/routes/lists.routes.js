const express = require('express');
const pool    = require('../config/db');
const { protect }     = require('../middleware/auth');
const { generateUid } = require('../helpers/uid');
const { createNotification } = require('../helpers/notifications');

const router = express.Router();

// ── Format a DB row into MailWizz-compatible list shape ────────
const fmt = (r) => ({
  uid: r.uid,
  general: {
    list_uid:     r.uid,
    name:         r.name,
    display_name: r.display_name || r.name,
    description:  r.description,
    opt_in:       r.opt_in,
    opt_out:      r.opt_out,
    from_name:    r.from_name,
    from_email:   r.from_email,
    reply_to:     r.reply_to,
    subject:      r.subject,
    is_archived:  r.is_archived ? 'yes' : 'no',
    notification_subscribe:   r.notification_subscribe,
    notification_unsubscribe: r.notification_unsubscribe,
  },
  company: {
    name:      r.company_name,
    country:   r.company_country,
    address_1: r.company_address1,
    address_2: r.company_address2,
    city:      r.company_city,
    zip_code:  r.company_zip_code,
    phone:     r.company_phone,
    website:   r.company_website,
  },
  stats: {
    subscribers: { total: r.subscribers_count || 0, confirmed: r.confirmed_count || 0 },
  },
  date_added: r.created_at,
  last_updated: r.updated_at || r.created_at,
});

// ── GET /api/get-all-lists ─────────────────────────────────────
router.get('/get-all-lists', protect, async (req, res) => {
  try {
    const page  = parseInt(req.query.page_number) || 1;
    const limit = parseInt(req.query.per_page)    || 10;
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT *, COUNT(*) OVER() AS total_count
       FROM lists WHERE user_id = $1 AND is_archived = false
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const count = rows.length ? parseInt(rows[0].total_count) : 0;
    return res.json({ status: 'success', data: { count, total_pages: Math.ceil(count / limit), current_page: page, records: rows.map(fmt) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch lists', error: e.message });
  }
});

// ── GET /api/get-archived-lists ────────────────────────────────
router.get('/get-archived-lists', protect, async (req, res) => {
  try {
    const page  = parseInt(req.query.page_number) || 1;
    const limit = parseInt(req.query.per_page)    || 10;
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(
      `SELECT *, COUNT(*) OVER() AS total_count
       FROM lists WHERE user_id = $1 AND is_archived = true
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const count = rows.length ? parseInt(rows[0].total_count) : 0;
    return res.json({ status: 'success', data: { count, total_pages: Math.ceil(count / limit), current_page: page, records: rows.map(fmt) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch archived lists' });
  }
});

// ── GET /api/get-one-list?list_uid= ───────────────────────────
router.get('/get-one-list', protect, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM lists WHERE uid = $1 AND user_id = $2',
      [req.query.list_uid, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'List not found' });
    return res.json({ status: 'success', data: { record: fmt(rows[0]) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch list' });
  }
});

// ── POST /api/create-list ──────────────────────────────────────
router.post('/create-list', protect, async (req, res) => {
  try {
    const b = req.body;
    if (!b.list_name) return res.status(400).json({ status: 'error', message: 'list_name is required' });

    const uid = generateUid();
    const { rows } = await pool.query(
      `INSERT INTO lists (uid, user_id, name, display_name, description,
         from_name, from_email, reply_to, subject,
         opt_in, opt_out, notification_subscribe, notification_unsubscribe,
         company_name, company_country, company_country_id, company_zone_id,
         company_zone_name, company_address1, company_address2,
         company_city, company_zip_code, company_phone, company_website)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
       RETURNING *`,
      [
        uid, req.user.id,
        b.list_name, b.list_display_name || b.list_name, b.list_description || '',
        b.from_name || 'Default Sender', b.from_email || '', b.reply_to || '', b.subject || '',
        b.list_opt_in || 'single', b.list_opt_out || 'single',
        b.subscribe || 'no', b.unsubscribe || 'no',
        b.company_name || '', b.company_country || '',
        parseInt(b.company_country_id) || 1, parseInt(b.company_zone_id) || 1,
        b.company_zone_name || '', b.company_address1 || '', b.company_address2 || '',
        b.company_city || '', b.company_zip_code || '', b.company_phone || '', b.company_website || '',
      ]
    );

    await pool.query(
      `INSERT INTO list_custom_fields (list_uid, label, tag, required, sort_order, type_identifier)
       VALUES 
        ($1, 'Email', 'EMAIL', 'yes', 0, 'text'),
        ($1, 'First name', 'FNAME', 'no', 1, 'text'),
        ($1, 'Last name', 'LNAME', 'no', 2, 'text')`,
      [uid]
    );

    await createNotification(req.user.id, 'List Created', `You successfully created the list "${b.list_name}".`);
    return res.status(201).json({ status: 'success', message: 'List created successfully.', data: { record: fmt(rows[0]) } });
  } catch (e) {
    console.error('💥 create-list:', e);
    return res.status(500).json({ status: 'error', message: 'Failed to create list', error: e.message });
  }
});

// ── POST /api/copy-list ────────────────────────────────────────
router.post('/copy-list', protect, async (req, res) => {
  try {
    const listUid = req.body.list_uid;
    if (!listUid) return res.status(400).json({ status: 'error', message: 'list_uid is required' });

    // 1. Find the existing list
    const { rows: existingRows } = await pool.query(
      `SELECT * FROM lists WHERE uid = $1 AND user_id = $2`,
      [listUid, req.user.id]
    );

    if (!existingRows.length) {
      return res.status(404).json({ status: 'error', message: 'List not found' });
    }

    const oldList = existingRows[0];
    const newUid = generateUid();
    const newName = oldList.name + ' (Copy)';

    // 2. Insert the duplicate
    const { rows: newRows } = await pool.query(
      `INSERT INTO lists (uid, user_id, name, display_name, description,
         from_name, from_email, reply_to, subject,
         opt_in, opt_out, notification_subscribe, notification_unsubscribe,
         company_name, company_country, company_country_id, company_zone_id,
         company_zone_name, company_address1, company_address2,
         company_city, company_zip_code, company_phone, company_website)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
       RETURNING *`,
      [
        newUid, req.user.id,
        newName, oldList.display_name, oldList.description,
        oldList.from_name, oldList.from_email, oldList.reply_to, oldList.subject,
        oldList.opt_in, oldList.opt_out, oldList.notification_subscribe, oldList.notification_unsubscribe,
        oldList.company_name, oldList.company_country, oldList.company_country_id, oldList.company_zone_id,
        oldList.company_zone_name, oldList.company_address1, oldList.company_address2,
        oldList.company_city, oldList.company_zip_code, oldList.company_phone, oldList.company_website
      ]
    );

    await pool.query(
      `INSERT INTO list_custom_fields (list_uid, type_identifier, label, tag, required, visibility, sort_order, default_value, help_text, description)
       SELECT $1, type_identifier, label, tag, required, visibility, sort_order, default_value, help_text, description 
       FROM list_custom_fields WHERE list_uid = $2`,
      [newUid, listUid]
    );

    await createNotification(req.user.id, 'List Copied', `You duplicated the list "${oldList.name}".`);
    return res.status(201).json({ status: 'success', message: 'List copied successfully.', data: { record: fmt(newRows[0]) } });
  } catch (e) {
    console.error('💥 copy-list:', e);
    return res.status(500).json({ status: 'error', message: 'Failed to copy list', error: e.message });
  }
});

// ── PUT /api/update-list ───────────────────────────────────────
router.put('/update-list', protect, async (req, res) => {
  try {
    const b = req.body;
    const listUid = b.list_uid;
    if (!listUid) return res.status(400).json({ status: 'error', message: 'list_uid is required' });

    const { rows } = await pool.query(
      `UPDATE lists SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         notification_subscribe   = COALESCE($3, notification_subscribe),
         notification_unsubscribe = COALESCE($4, notification_unsubscribe),
         company_name = COALESCE($5, company_name),
         company_country = COALESCE($6, company_country),
         company_country_id = COALESCE($7, company_country_id),
         company_zone_id = COALESCE($8, company_zone_id),
         company_zone_name = COALESCE($9, company_zone_name),
         company_address1 = COALESCE($10, company_address1),
         company_address2 = COALESCE($11, company_address2),
         company_city = COALESCE($12, company_city),
         company_zip_code = COALESCE($13, company_zip_code),
         updated_at = NOW()
       WHERE uid = $14 AND user_id = $15
       RETURNING *`,
      [
        b.list_name || null, b.list_description || null,
        b.notification_subscribe || null, b.notification_unsubscribe || null,
        b.company_name || null, b.company_country || null,
        b.company_country_id ? parseInt(b.company_country_id) : null,
        b.company_zone_id    ? parseInt(b.company_zone_id)    : null,
        b.company_zone_name || b.zone || null,
        b.company_address1 || null, b.company_address2 || null,
        b.company_city || null, b.company_zip_code || null,
        listUid, req.user.id,
      ]
    );

    if (!rows.length) return res.status(404).json({ status: 'error', message: 'List not found' });
    await createNotification(req.user.id, 'List Updated', `Your list "${rows[0].name}" was successfully updated.`);
    return res.json({ status: 'success', message: 'List updated.', data: { record: fmt(rows[0]) } });
  } catch (e) {
    console.error('💥 update-list:', e);
    return res.status(500).json({ status: 'error', message: 'Failed to update list' });
  }
});

// ── DELETE /api/delete-list?list_uid= ─────────────────────────
router.delete('/delete-list', protect, async (req, res) => {
  try {
    const listUid = req.query.list_uid || req.body.list_uid;
    if (!listUid) return res.status(400).json({ status: 'error', message: 'list_uid is required' });

    await pool.query('DELETE FROM subscribers WHERE list_uid = $1', [listUid]);
    const { rowCount } = await pool.query(
      'DELETE FROM lists WHERE uid = $1 AND user_id = $2',
      [listUid, req.user.id]
    );

    if (!rowCount) return res.status(404).json({ status: 'error', message: 'List not found' });
    await createNotification(req.user.id, 'List Deleted', `You successfully deleted the list.`);
    return res.json({ status: 'success', message: 'List deleted.' });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to delete list' });
  }
});

// ── PUT /api/archive-list?list_uid= ───────────────────────────
router.put('/archive-list', protect, async (req, res) => {
  try {
    const listUid = req.query.list_uid || req.body.list_uid;
    const { rows } = await pool.query(
      'UPDATE lists SET is_archived = true, updated_at = NOW() WHERE uid = $1 AND user_id = $2 RETURNING *',
      [listUid, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'List not found' });
    await createNotification(req.user.id, 'List Archived', `Your list "${rows[0].name}" has been archived.`);
    return res.json({ status: 'success', message: 'List archived.', data: { record: fmt(rows[0]) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to archive list' });
  }
});

// ── PUT /api/unarchive-list?list_uid= ─────────────────────────
router.put('/unarchive-list', protect, async (req, res) => {
  try {
    const listUid = req.query.list_uid || req.body.list_uid;
    const { rows } = await pool.query(
      'UPDATE lists SET is_archived = false, updated_at = NOW() WHERE uid = $1 AND user_id = $2 RETURNING *',
      [listUid, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'List not found' });
    await createNotification(req.user.id, 'List Unarchived', `Your list "${rows[0].name}" has been unarchived.`);
    return res.json({ status: 'success', message: 'List unarchived.', data: { record: fmt(rows[0]) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to unarchive list' });
  }
});

const { Country, State } = require('country-state-city');

// ── GET /api/get-all-countries ─────────────────────────────────
router.get('/get-all-countries', protect, (req, res) => {
  try {
    const countries = Country.getAllCountries().map((c) => ({
      country_id: c.isoCode, // Using ISO code as ID (e.g., 'US', 'IN')
      country_name: c.name,
      country_code: c.isoCode
    }));
    return res.json({ status: 'success', data: { records: countries, count: countries.length } });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch countries' });
  }
});

// ── GET /api/get-country-zone/:id ──────────────────────
router.get('/get-country-zone/:country_id', protect, (req, res) => {
  try {
    const isoCode = req.params.country_id;
    const states = State.getStatesOfCountry(isoCode).map((s) => ({
      zone_id: s.isoCode,
      zone_name: s.name,
    }));
    return res.json({ status: 'success', data: { records: states, count: states.length } });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch zones' });
  }
});



// ── GET /api/get-all-segments ──────────────────────────────────
router.get('/get-all-segments', protect, async (req, res) => {
  try {
    const list_uid = req.query.list_uid;
    if (!list_uid) return res.status(400).json({ status: 'error', message: 'Missing list_uid' });
    const { rows } = await pool.query('SELECT * FROM list_segments WHERE list_uid = $1 AND user_id = $2 ORDER BY created_at DESC', [list_uid, req.user.id]);
    const mapped = rows.map(r => ({
      segment_uid: r.uid,
      name: r.name,
      operator_match: r.operator_match,
      conditions: r.conditions,
      date_added: r.created_at,
      last_updated: r.updated_at
    }));
    return res.json({ status: 'success', data: { records: mapped } });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch segments' });
  }
});

// ── GET /api/get-all-list-field-types ─────────────────────────
router.get('/get-all-list-field-types', protect, async (req, res) => {
  try {
    const fieldTypes = [
      { identifier: "text", name: "Text", description: "A simple text field" },
      { identifier: "textarea", name: "Text Area", description: "A multi-line text area" },
      { identifier: "dropdown", name: "Dropdown", description: "A dropdown select box" },
      { identifier: "multiselect", name: "Multi Select", description: "A multiple selection box" },
      { identifier: "checkbox", name: "Checkbox", description: "A checkbox input" },
      { identifier: "radio", name: "Radio", description: "A radio button group" },
      { identifier: "date", name: "Date", description: "A date picker" },
      { identifier: "datetime", name: "Date Time", description: "A date and time picker" }
    ];
    return res.json({ status: 'success', data: { records: fieldTypes } });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch field types' });
  }
});

// ── POST /api/create-list-field ───────────────────────────────
router.post('/create-list-field', protect, async (req, res) => {
  try {
    const { list_uid, type, label, tag, required, visibility, default_value, help_text, description, sort_order } = req.body;
    const listCheck = await pool.query('SELECT uid FROM lists WHERE uid = $1 AND user_id = $2', [list_uid, req.user.id]);
    if (!listCheck.rows.length) return res.status(404).json({ status: 'error', message: 'List not found' });

    const { rows } = await pool.query(
      `INSERT INTO list_custom_fields (list_uid, type_identifier, label, tag, required, visibility, sort_order, default_value, help_text, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [list_uid, type || 'text', label, tag, required || 'no', visibility || 'visible', sort_order || 0, default_value, help_text, description]
    );
    return res.json({ status: 'success', message: 'Field created successfully.', data: { record: rows[0] } });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to create field' });
  }
});

// ── PUT /api/update-list-field ────────────────────────────────
router.put('/update-list-field', protect, async (req, res) => {
  try {
    const { list_uid, field_id, label, tag, required, visibility, default_value, help_text, description, sort_order } = req.body;
    const listCheck = await pool.query('SELECT uid FROM lists WHERE uid = $1 AND user_id = $2', [list_uid, req.user.id]);
    if (!listCheck.rows.length) return res.status(404).json({ status: 'error', message: 'List not found' });

    const { rows } = await pool.query(
      `UPDATE list_custom_fields SET
         label = COALESCE($1, label), tag = COALESCE($2, tag), required = COALESCE($3, required),
         visibility = COALESCE($4, visibility), sort_order = COALESCE($5, sort_order),
         default_value = COALESCE($6, default_value), help_text = COALESCE($7, help_text),
         description = COALESCE($8, description), updated_at = NOW()
       WHERE field_id = $9 AND list_uid = $10 RETURNING *`,
      [label, tag, required, visibility, sort_order, default_value, help_text, description, field_id, list_uid]
    );
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'Field not found' });
    return res.json({ status: 'success', message: 'Field updated successfully.', data: { record: rows[0] } });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to update field' });
  }
});

// ── DELETE /api/delete-list-field ─────────────────────────────
router.delete('/delete-list-field', protect, async (req, res) => {
  try {
    const list_uid = req.query.list_uid || req.body.list_uid;
    const field_id = req.query.field_id || req.body.field_id;
    const listCheck = await pool.query('SELECT uid FROM lists WHERE uid = $1 AND user_id = $2', [list_uid, req.user.id]);
    if (!listCheck.rows.length) return res.status(404).json({ status: 'error', message: 'List not found' });

    const { rowCount } = await pool.query('DELETE FROM list_custom_fields WHERE field_id = $1 AND list_uid = $2', [field_id, list_uid]);
    if (rowCount === 0) return res.status(404).json({ status: 'error', message: 'Field not found' });
    return res.json({ status: 'success', message: 'Field deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to delete field' });
  }
});

// ── GET /api/get-segment-conditions ───────────────────────────
router.get('/get-segment-conditions', protect, async (req, res) => {
  try {
    return res.json({ status: 'success', data: { records: [] } });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch segment conditions' });
  }
});

// ── POST /api/create-segment ───────────────────────────────
router.post('/create-segment', protect, async (req, res) => {
  try {
    const { 
      list_uid, name, operator_match, conditions
    } = req.body;
    
    if (!list_uid || !name) return res.status(400).json({ status: 'error', message: 'Missing fields' });
    
    const segment_uid = generateUid();
    await pool.query(
      `INSERT INTO list_segments (uid, list_uid, user_id, name, operator_match, conditions) VALUES ($1, $2, $3, $4, $5, $6)`,
      [segment_uid, list_uid, req.user.id, name, operator_match || 'any', JSON.stringify(conditions || {})]
    );

    return res.json({ status: 'success', message: 'Segment created successfully.', data: { segment_uid } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to create segment' });
  }
});

// ── PUT /api/update-segment ────────────────────────────────
router.put('/update-segment', protect, async (req, res) => {
  try {
    const { 
      segment_uid, name, operator_match, conditions
    } = req.body;
    
    if (!segment_uid || !name) return res.status(400).json({ status: 'error', message: 'Missing fields' });

    const { rowCount } = await pool.query(
      `UPDATE list_segments SET name = $1, operator_match = $2, conditions = $3, updated_at = CURRENT_TIMESTAMP WHERE uid = $4 AND user_id = $5`,
      [name, operator_match || 'any', JSON.stringify(conditions || {}), segment_uid, req.user.id]
    );

    if (rowCount === 0) return res.status(404).json({ status: 'error', message: 'Segment not found' });

    return res.json({ status: 'success', message: 'Segment updated successfully.' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to update segment' });
  }
});

// ── DELETE /api/delete-segment ─────────────────────────────
router.delete('/delete-segment', protect, async (req, res) => {
  try {
    const segment_uid = req.query.segment_uid || req.body.segment_uid;
    const { rowCount } = await pool.query('DELETE FROM list_segments WHERE uid = $1 AND user_id = $2', [segment_uid, req.user.id]);
    if (rowCount === 0) return res.status(404).json({ status: 'error', message: 'Segment not found' });
    return res.json({ status: 'success', message: 'Segment deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to delete segment' });
  }
});

// ── GET /api/copy-one-segment ──────────────────────────────
router.get('/copy-one-segment', protect, async (req, res) => {
  try {
    const segment_uid = req.query.segment_uid;
    const { rows } = await pool.query('SELECT * FROM list_segments WHERE uid = $1 AND user_id = $2', [segment_uid, req.user.id]);
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'Segment not found' });
    
    const original = rows[0];
    const new_uid = generateUid();
    const new_name = original.name + ' - Copy';
    
    await pool.query(
      `INSERT INTO list_segments (uid, list_uid, user_id, name, operator_match, conditions) VALUES ($1, $2, $3, $4, $5, $6)`,
      [new_uid, original.list_uid, req.user.id, new_name, original.operator_match, original.conditions]
    );

    return res.json({ status: 'success', message: 'Segment copied successfully.' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to copy segment' });
  }
});

// ── GET /api/get-one-segment ───────────────────────────────
router.get('/get-one-segment', protect, async (req, res) => {
  try {
    const segment_uid = req.query.segment_uid;
    const { rows } = await pool.query('SELECT * FROM list_segments WHERE uid = $1 AND user_id = $2', [segment_uid, req.user.id]);
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'Segment not found' });
    
    const r = rows[0];
    const record = {
      segment_uid: r.uid,
      name: r.name,
      operator_match: r.operator_match,
      conditions: r.conditions,
      date_added: r.created_at,
      last_updated: r.updated_at
    };
    return res.json({ status: 'success', data: { record } });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to get segment' });
  }
});

// ── GET /api/get-all-fields ────────────────────────────────────
router.get('/get-all-fields', protect, async (req, res) => {
  try {
    const list_uid = req.query.list_uid;
    const listCheck = await pool.query('SELECT uid FROM lists WHERE uid = $1 AND user_id = $2', [list_uid, req.user.id]);
    if (!listCheck.rows.length) return res.status(404).json({ status: 'error', message: 'List not found' });

    const { rows } = await pool.query('SELECT * FROM list_custom_fields WHERE list_uid = $1 ORDER BY sort_order ASC, field_id ASC', [list_uid]);
    const mapped = rows.map(r => ({
      ...r,
      type: {
        identifier: r.type_identifier,
        name: r.type_identifier.charAt(0).toUpperCase() + r.type_identifier.slice(1),
        description: r.type_identifier + ' field'
      }
    }));
    return res.json({ status: 'success', data: { data: { records: mapped } } });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch custom fields' });
  }
});

module.exports = router;
