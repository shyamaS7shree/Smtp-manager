const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ── GET /api/track/open/:campaignUid/:subscriberUid ────────────────────────────
// Tracks email opens via 1x1 transparent image pixel
router.get('/open/:campaignUid/:subscriberUid', async (req, res) => {
  try {
    const { campaignUid, subscriberUid } = req.params;
    
    // Increment open count for subscriber
    const { rows: subRows } = await pool.query(
      `UPDATE subscribers SET open_count = COALESCE(open_count, 0) + 1, last_open_date = NOW() WHERE uid = $1 RETURNING open_count`,
      [subscriberUid]
    );

    const isUnique = subRows.length > 0 && subRows[0].open_count === 1;

    // Increment open_count for campaign (and unique_open_count if first time)
    if (isUnique) {
      await pool.query(
        `UPDATE campaigns SET open_count = COALESCE(open_count, 0) + 1, unique_open_count = COALESCE(unique_open_count, 0) + 1 WHERE uid = $1`,
        [campaignUid]
      );
    } else {
      await pool.query(
        `UPDATE campaigns SET open_count = COALESCE(open_count, 0) + 1 WHERE uid = $1`,
        [campaignUid]
      );
    }
    
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

    // Increment click count for subscriber
    const { rows: subRows } = await pool.query(
      `UPDATE subscribers SET click_count = COALESCE(click_count, 0) + 1, last_click_date = NOW() WHERE uid = $1 RETURNING click_count, open_count`,
      [subscriberUid]
    );

    const isUnique = subRows.length > 0 && subRows[0].click_count === 1;

    // Increment click_count for campaign (and unique_click_count if first time)
    if (isUnique) {
      await pool.query(
        `UPDATE campaigns SET click_count = COALESCE(click_count, 0) + 1, unique_click_count = COALESCE(unique_click_count, 0) + 1 WHERE uid = $1`,
        [campaignUid]
      );
    } else {
      await pool.query(
        `UPDATE campaigns SET click_count = COALESCE(click_count, 0) + 1 WHERE uid = $1`,
        [campaignUid]
      );
    }

    // Auto-trigger Open event if not already opened (since they clicked a link inside it)
    if (subRows.length > 0 && (subRows[0].open_count || 0) === 0) {
      await pool.query(
        `UPDATE subscribers SET open_count = 1, last_open_date = NOW() WHERE uid = $1`,
        [subscriberUid]
      );
      await pool.query(
        `UPDATE campaigns SET open_count = COALESCE(open_count, 0) + 1, unique_open_count = COALESCE(unique_open_count, 0) + 1 WHERE uid = $1`,
        [campaignUid]
      );
    }

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
    const { rows: subRows } = await pool.query(
      `SELECT open_count, click_count, status FROM subscribers WHERE uid = $1`,
      [subscriberUid]
    );

    if (subRows.length > 0) {
      const sub = subRows[0];

      // 1. Auto-trigger Open event if not opened yet
      if ((sub.open_count || 0) === 0) {
        await pool.query(
          `UPDATE subscribers SET open_count = 1, last_open_date = NOW() WHERE uid = $1`,
          [subscriberUid]
        );
        await pool.query(
          `UPDATE campaigns SET open_count = COALESCE(open_count, 0) + 1, unique_open_count = COALESCE(unique_open_count, 0) + 1 WHERE uid = $1`,
          [campaignUid]
        );
      }

      // 2. Increment click count (since unsubscribe is a link click)
      const subClicks = sub.click_count || 0;
      await pool.query(
        `UPDATE subscribers SET click_count = COALESCE(click_count, 0) + 1, last_click_date = NOW() WHERE uid = $1`,
        [subscriberUid]
      );
      if (subClicks === 0) {
        await pool.query(
          `UPDATE campaigns SET click_count = COALESCE(click_count, 0) + 1, unique_click_count = COALESCE(unique_click_count, 0) + 1 WHERE uid = $1`,
          [campaignUid]
        );
      } else {
        await pool.query(
          `UPDATE campaigns SET click_count = COALESCE(click_count, 0) + 1 WHERE uid = $1`,
          [campaignUid]
        );
      }

      // 3. Mark as unsubscribed
      if (sub.status !== 'unsubscribed') {
        await pool.query(
          `UPDATE subscribers SET status = 'unsubscribed', updated_at = NOW() WHERE uid = $1`,
          [subscriberUid]
        );
        await pool.query(
          `UPDATE campaigns SET unsubscribe_count = COALESCE(unsubscribe_count, 0) + 1 WHERE uid = $1`,
          [campaignUid]
        );
      }
    }

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
