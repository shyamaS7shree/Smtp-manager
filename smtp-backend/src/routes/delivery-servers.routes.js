const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

// Get all delivery servers
router.get('/delivery-servers', protect, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM delivery_servers ORDER BY id DESC');
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error('Error fetching delivery servers:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch delivery servers' });
  }
});

// Create a new delivery server
router.post('/delivery-servers', protect, async (req, res) => {
  const { name, type, hostname, username, password, port, hourly_quota, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO delivery_servers (name, type, hostname, username, password, port, hourly_quota, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, type, hostname, username, password, port || 587, hourly_quota || 0, status || 'active']
    );
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating delivery server:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create delivery server' });
  }
});

// Update a delivery server
router.put('/delivery-servers/:id', protect, async (req, res) => {
  const { id } = req.params;
  const { name, type, hostname, username, password, port, hourly_quota, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE delivery_servers 
       SET name = $1, type = $2, hostname = $3, username = $4, password = $5, port = $6, hourly_quota = $7, status = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [name, type, hostname, username, password, port, hourly_quota, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Server not found' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating delivery server:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update delivery server' });
  }
});

// Delete a delivery server
router.delete('/delivery-servers/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM delivery_servers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Server not found' });
    }
    res.json({ status: 'success', message: 'Server deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery server:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete delivery server' });
  }
});

module.exports = router;
