const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

// Get all bounce servers
router.get('/bounce-servers', protect, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bounce_servers ORDER BY id DESC');
    res.json({ status: 'success', data: result.rows });
  } catch (error) {
    console.error('Error fetching bounce servers:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch bounce servers' });
  }
});

// Create a new bounce server
router.post('/bounce-servers', protect, async (req, res) => {
  const { name, hostname, username, password, port, protocol, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bounce_servers (name, hostname, username, password, port, protocol, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, hostname, username, password, port || 995, protocol || 'POP3', status || 'active']
    );
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating bounce server:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create bounce server' });
  }
});

// Update a bounce server
router.put('/bounce-servers/:id', protect, async (req, res) => {
  const { id } = req.params;
  const { name, hostname, username, password, port, protocol, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE bounce_servers 
       SET name = $1, hostname = $2, username = $3, password = $4, port = $5, protocol = $6, status = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, hostname, username, password, port, protocol, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Server not found' });
    }
    res.json({ status: 'success', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating bounce server:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update bounce server' });
  }
});

// Delete a bounce server
router.delete('/bounce-servers/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM bounce_servers WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Server not found' });
    }
    res.json({ status: 'success', message: 'Server deleted successfully' });
  } catch (error) {
    console.error('Error deleting bounce server:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete bounce server' });
  }
});

module.exports = router;
