const express = require('express');
const pool    = require('../config/db');
const { protect }     = require('../middleware/auth');
const { generateUid } = require('../helpers/uid');

const router = express.Router();

// Helper to update list counts
const updateCounts = async (listUid) => {
  await pool.query(`
    UPDATE lists SET
      subscribers_count = (SELECT COUNT(*) FROM subscribers WHERE list_uid = $1),
      confirmed_count   = (SELECT COUNT(*) FROM subscribers WHERE list_uid = $1 AND status = 'confirmed'),
      updated_at = NOW()
    WHERE uid = $1`, [listUid]);
};

// ── POST /sync-list ──────────────────────────────────────────
router.post('/sync-list', protect, async (req, res) => {
  try {
    const { primary_list_uid, secondary_list_uid, missing_action, duplicate_action, distinct_action } = req.body;
    
    if (!primary_list_uid || !secondary_list_uid) {
      return res.status(400).json({ status: 'error', message: 'Primary and secondary list UIDs are required.' });
    }
    
    if (primary_list_uid === secondary_list_uid) {
      return res.status(400).json({ status: 'error', message: 'Primary and secondary lists must be different.' });
    }

    // Get secondary list id for insertions
    const secRes = await pool.query('SELECT id FROM lists WHERE uid = $1 AND user_id = $2', [secondary_list_uid, req.user.id]);
    if (!secRes.rows.length) return res.status(404).json({ status: 'error', message: 'Secondary list not found or unauthorized.' });
    const secListId = secRes.rows[0].id;

    // Fetch primary subscribers
    const { rows: pSubs } = await pool.query('SELECT email, first_name, last_name, status, ip_address, source FROM subscribers WHERE list_uid = $1', [primary_list_uid]);
    // Fetch secondary subscribers
    const { rows: sSubs } = await pool.query('SELECT email, status FROM subscribers WHERE list_uid = $1', [secondary_list_uid]);

    const pMap = new Map(pSubs.map(s => [s.email.toLowerCase(), s]));
    const sMap = new Map(sSubs.map(s => [s.email.toLowerCase(), s]));

    let added = 0;
    let deleted = 0;

    // Process missing (in primary, not in secondary)
    if (missing_action === 'Create subscriber in secondary list') {
      const missing = pSubs.filter(s => !sMap.has(s.email.toLowerCase()));
      for (const sub of missing) {
        await pool.query(
          `INSERT INTO subscribers (uid, list_id, list_uid, email, first_name, last_name, status, ip_address, source)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [generateUid(), secListId, secondary_list_uid, sub.email.toLowerCase(), sub.first_name, sub.last_name, sub.status, sub.ip_address, sub.source]
        );
        added++;
      }
    }

    // Process duplicate (in both)
    if (duplicate_action === 'Delete subscriber from secondary list') {
      const duplicates = pSubs.filter(s => sMap.has(s.email.toLowerCase()));
      for (const sub of duplicates) {
        await pool.query('DELETE FROM subscribers WHERE list_uid = $1 AND email = $2', [secondary_list_uid, sub.email.toLowerCase()]);
        deleted++;
      }
    }

    await updateCounts(secondary_list_uid);

    return res.json({ status: 'success', message: `Sync completed. Added: ${added}, Deleted: ${deleted}` });
  } catch (e) {
    console.error('💥 tools/sync-list error:', e);
    return res.status(500).json({ status: 'error', message: 'Failed to sync lists.' });
  }
});

// ── POST /split-list ─────────────────────────────────────────
router.post('/split-list', protect, async (req, res) => {
  try {
    const { list_uid, split_count } = req.body;
    
    if (!list_uid || !split_count || split_count < 2) {
      return res.status(400).json({ status: 'error', message: 'Valid list UID and split count (>= 2) required.' });
    }

    // Fetch parent list details
    const listRes = await pool.query('SELECT * FROM lists WHERE uid = $1 AND user_id = $2', [list_uid, req.user.id]);
    if (!listRes.rows.length) return res.status(404).json({ status: 'error', message: 'Source list not found.' });
    const parentList = listRes.rows[0];

    // Fetch all subscribers
    const { rows: subs } = await pool.query('SELECT * FROM subscribers WHERE list_uid = $1', [list_uid]);
    
    if (subs.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Cannot split an empty list.' });
    }

    // Calculate chunks
    const numSplits = parseInt(split_count, 10);
    const chunkSize = Math.ceil(subs.length / numSplits);
    
    let createdLists = [];

    for (let i = 0; i < numSplits; i++) {
      const chunk = subs.slice(i * chunkSize, (i + 1) * chunkSize);
      if (chunk.length === 0) continue;

      const newListUid = generateUid();
      const newListName = `${parentList.name} (Part ${i + 1})`;
      
      // Create new list
      const insertListRes = await pool.query(
        `INSERT INTO lists (uid, user_id, name, display_name, description, opt_in, opt_out, company_name, country_id, zone_id, address_1, address_2, city, zip_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
        [newListUid, req.user.id, newListName, newListName, parentList.description, parentList.opt_in, parentList.opt_out, parentList.company_name, parentList.country_id, parentList.zone_id, parentList.address_1, parentList.address_2, parentList.city, parentList.zip_code]
      );
      
      const newListId = insertListRes.rows[0].id;
      createdLists.push(newListName);

      // Insert chunk
      for (const sub of chunk) {
        await pool.query(
          `INSERT INTO subscribers (uid, list_id, list_uid, email, first_name, last_name, status, ip_address, source)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [generateUid(), newListId, newListUid, sub.email, sub.first_name, sub.last_name, sub.status, sub.ip_address, sub.source]
        );
      }
      
      await updateCounts(newListUid);
    }

    return res.json({ status: 'success', message: `List split into ${createdLists.length} parts successfully.` });
  } catch (e) {
    console.error('💥 tools/split-list error:', e);
    return res.status(500).json({ status: 'error', message: 'Failed to split list.' });
  }
});

module.exports = router;
