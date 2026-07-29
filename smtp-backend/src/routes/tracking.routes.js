const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ── GET /api/track/open/:campaignUid/:subscriberUid ────────────────────────────
// Tracks email opens via 1x1 transparent image pixel
router.get('/open/:campaignUid/:subscriberUid', async (req, res) => {
  try {
    const { campaignUid, subscriberUid } = req.params;
    
    // Increment opens count for campaign
    await pool.query(
      `UPDATE campaigns SET opens = COALESCE(opens, 0) + 1 WHERE uid = $1`,
      [campaignUid]
    );

    // Increment open count for subscriber
    await pool.query(
      `UPDATE subscribers SET open_count = COALESCE(open_count, 0) + 1, last_open_date = NOW() WHERE uid = $1`,
      [subscriberUid]
    );
    
  } catch (err) {
    console.error('Error tracking open:', err.message);
  } finally {
    // Always return a 1x1 transparent GIF/PNG
    const transparentPixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': transparentPixel.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    });
    res.end(transparentPixel);
  }
});

// ── GET /api/track/click/:campaignUid/:subscriberUid ───────────────────────────
// Tracks email clicks and redirects to original URL
router.get('/click/:campaignUid/:subscriberUid', async (req, res) => {
  const { campaignUid, subscriberUid } = req.params;
  const { url } = req.query;

  try {
    if (!url) return res.status(400).send('Invalid URL');

    // Increment click count for campaign
    await pool.query(
      `UPDATE campaigns SET clicks = COALESCE(clicks, 0) + 1 WHERE uid = $1`,
      [campaignUid]
    );

    // Decode and redirect to original URL
    const originalUrl = decodeURIComponent(url);
    res.redirect(302, originalUrl);
  } catch (err) {
    console.error('Error tracking click:', err.message);
    if (url) {
      res.redirect(302, decodeURIComponent(url));
    } else {
      res.status(500).send('Error');
    }
  }
});

// ── GET /api/track/unsubscribe/:campaignUid/:subscriberUid ──────────────────────
// Unsubscribes a user
router.get('/unsubscribe/:campaignUid/:subscriberUid', async (req, res) => {
  const { campaignUid, subscriberUid } = req.params;
  
  try {
    // Mark subscriber as unsubscribed
    await pool.query(
      `UPDATE subscribers SET status = 'unsubscribed', updated_at = NOW() WHERE uid = $1`,
      [subscriberUid]
    );

    // Increment unsubs count for campaign
    await pool.query(
      `UPDATE campaigns SET unsubs = COALESCE(unsubs, 0) + 1 WHERE uid = $1`,
      [campaignUid]
    );

    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>You have been successfully unsubscribed.</h2>
          <p>You will no longer receive emails from this list.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error tracking unsubscribe:', err.message);
    res.status(500).send('Failed to process unsubscribe.');
  }
});

module.exports = router;
