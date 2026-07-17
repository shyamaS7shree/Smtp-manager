const express = require('express');
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/user
router.get('/user', protect, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, uid, name, email, first_name, last_name, timezone, language, birth_date, phone, avatar_url,
       company_name, company_website, company_country, company_zone, company_address, company_address2,
       company_zone_name, company_city, company_zip_code, company_phone, company_fax, company_type_industry, company_vat_number
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    return res.json({ status: 'success', data: rows[0] });
  } catch (error) {
    console.error('💥 GET /api/user error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch user' });
  }
});

// PUT /api/user
router.put('/user', protect, async (req, res) => {
  try {
    const {
      first_name, last_name, timezone, language, birth_date, phone, avatar_url,
      company_name, company_website, company_country, company_zone, company_address, company_address2,
      company_zone_name, company_city, company_zip_code, company_phone, company_fax, company_type_industry, company_vat_number
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE users SET
       first_name = COALESCE($1, first_name),
       last_name = COALESCE($2, last_name),
       timezone = COALESCE($3, timezone),
       language = COALESCE($4, language),
       birth_date = COALESCE($5, birth_date),
       phone = COALESCE($6, phone),
       avatar_url = COALESCE($7, avatar_url),
       company_name = COALESCE($8, company_name),
       company_website = COALESCE($9, company_website),
       company_country = COALESCE($10, company_country),
       company_zone = COALESCE($11, company_zone),
       company_address = COALESCE($12, company_address),
       company_address2 = COALESCE($13, company_address2),
       company_zone_name = COALESCE($14, company_zone_name),
       company_city = COALESCE($15, company_city),
       company_zip_code = COALESCE($16, company_zip_code),
       company_phone = COALESCE($17, company_phone),
       company_fax = COALESCE($18, company_fax),
       company_type_industry = COALESCE($19, company_type_industry),
       company_vat_number = COALESCE($20, company_vat_number)
       WHERE id = $21
       RETURNING *`,
      [
        first_name || null, last_name || null, timezone || null, language || null, birth_date || null, phone || null, avatar_url || null,
        company_name || null, company_website || null, company_country || null, company_zone || null, company_address || null, company_address2 || null,
        company_zone_name || null, company_city || null, company_zip_code || null, company_phone || null, company_fax || null, company_type_industry || null, company_vat_number || null,
        req.user.id
      ]
    );

    return res.json({ status: 'success', message: 'User updated successfully', data: rows[0] });
  } catch (error) {
    console.error('💥 PUT /api/user error:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update user' });
  }
});

module.exports = router;
