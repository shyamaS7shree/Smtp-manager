const express = require('express');
const nodemailer = require('nodemailer');
const pool = require('../config/db');
const { protect } = require('../middleware/auth');
const { generateUid } = require('../helpers/uid');

const { checkRealtimeBlacklist } = require('../helpers/blacklist');

const router = express.Router();

// ── Format campaign row ────────────────────────────────────────
const fmt = (r) => ({
  campaign_uid: r.uid,
  campaign_id: r.id,
  name: r.name,
  type: r.type,
  group: r.group_name || r.group || '',
  send_group: r.send_group || '',
  event: r.event || 'Subscribe',
  time: r.time || 'Immediately',
  status: r.status,
  from_name: r.from_name,
  from_email: r.from_email,
  to_name: r.to_name || '',
  reply_to: r.reply_to,
  subject: r.subject,
  send_at: r.send_at,
  started_at: r.started_at || r.send_at || r.created_at,
  sent_at: r.sent_at,
  list: { list_uid: r.list_uid, name: r.list_name || r.list_display_name || '' },
  segment: r.segment_uid ? { segment_uid: r.segment_uid, name: r.segment_name || '' } : null,
  template: { template_uid: r.template_uid, name: r.template_name || '' },
  content: r.content,
  email_stats: r.email_stats,
  plain_text_email: r.plain_text_email,
  auto_plain_text: r.auto_plain_text,
  plain_text: r.plain_text,
  stats: {
    total_subscribers: r.total_subscribers,
    processed_subscribers: r.processed_subscribers,
    opens_count: r.open_count,
    unique_opens: r.unique_open_count,
    clicks_count: r.click_count,
    unique_clicks: r.unique_click_count,
    bounces_count: r.bounce_count,
    unsubscribes_count: r.unsubscribe_count,
    open_rate: r.total_subscribers > 0 ? `${((r.open_count / r.total_subscribers) * 100).toFixed(2)}%` : '0.00%',
    click_rate: r.total_subscribers > 0 ? `${((r.click_count / r.total_subscribers) * 100).toFixed(2)}%` : '0.00%',
  },
  date_added: r.created_at,
});

// ── Background email sender ────────────────────────────────────
const sendCampaignEmails = async (campaign) => {
  if (!process.env.SMTP_HOST) {
    console.warn('⚠️  SMTP not configured — emails not sent. Add SMTP_HOST to .env to enable.');
    await pool.query(
      "UPDATE campaigns SET status = 'sent', sent_at = NOW() WHERE id = $1",
      [campaign.id]
    );
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const { rows: subscribers } = await pool.query(
      "SELECT * FROM subscribers WHERE list_uid = $1 AND status = 'confirmed'",
      [campaign.list_uid]
    );

    let sent = 0;
    let blockedCount = 0;

    for (const sub of subscribers) {
      // 🛑 Real-Time Check for Email Blacklist, Suppression List & IP Blacklist
      const check = await checkRealtimeBlacklist(campaign.user_id, sub.email, sub.ip_address);
      if (check.blocked) {
        console.warn(`🛑 Real-Time Blocked: Email "${sub.email}" / IP "${sub.ip_address}" in ${check.type} (${check.reason})`);
        blockedCount++;
        continue;
      }

      try {
        let html = (campaign.content || '')
          .replace(/\[FNAME\]/gi, sub.first_name || '')
          .replace(/\[LNAME\]/gi, sub.last_name || '')
          .replace(/\[EMAIL\]/gi, sub.email);

        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        
        // 1. Inject Open Tracking Pixel
        const openPixel = `<img src="${backendUrl}/api/track/open/${campaign.uid}/${sub.uid}" width="1" height="1" style="display:none;" />`;
        html = html.replace('</body>', `${openPixel}</body>`);
        if (!html.includes('</body>')) {
          html += openPixel;
        }

        // 2. Rewrite Links for Click Tracking
        html = html.replace(/href="([^"]+)"/g, (match, url) => {
          if (url.startsWith('http') && !url.includes('/api/track/')) {
            return `href="${backendUrl}/api/track/click/${campaign.uid}/${sub.uid}?url=${encodeURIComponent(url)}"`;
          }
          return match;
        });

        // 3. Inject Unsubscribe Link (replace a placeholder if it exists, otherwise append)
        const unsubLink = `${backendUrl}/api/track/unsubscribe/${campaign.uid}/${sub.uid}`;
        if (html.includes('[UNSUBSCRIBE]')) {
          html = html.replace(/\[UNSUBSCRIBE\]/gi, unsubLink);
        } else {
          html += `<br><br><p style="font-size: 12px; color: #666; text-align: center;"><a href="${unsubLink}">Unsubscribe</a> from this list.</p>`;
        }


        const mailOptions = {
          from: `"${campaign.from_name}" <${campaign.from_email}>`,
          to: sub.email,
          subject: campaign.subject,
          html,
          text: campaign.plain_text_email || '',
          replyTo: campaign.reply_to || campaign.from_email,
        };

        // If bounce IMAP is configured, set the Return-Path (envelope from) to catch bounces
        if (process.env.BOUNCE_IMAP_USER) {
          mailOptions.envelope = {
            from: process.env.BOUNCE_IMAP_USER,
            to: sub.email
          };
        }

        await transporter.sendMail(mailOptions);
        sent++;
        
        // Increment delivered count since sendMail succeeded
        await pool.query(
          `UPDATE campaigns SET delivered = COALESCE(delivered, 0) + 1 WHERE id = $1`,
          [campaign.id]
        );
      } catch (err) {
        console.error(`❌ Failed to send to ${sub.email}:`, err.message);
      }
    }

    await pool.query(
      `UPDATE campaigns SET status = 'sent', sent_at = NOW(),
         total_subscribers = $1, processed_subscribers = $2, updated_at = NOW()
       WHERE id = $3`,
      [subscribers.length, sent, campaign.id]
    );
    console.log(`✅ Campaign "${campaign.name}" sent to ${sent}/${subscribers.length} subscribers. (Blocked by Real-Time Blacklists: ${blockedCount})`);
  } catch (err) {
    console.error('💥 sendCampaignEmails error:', err);
    await pool.query("UPDATE campaigns SET status = 'blocked' WHERE id = $1", [campaign.id]);
  }
};

const getFullCampaign = async (uid, userId) => {
  const { rows } = await pool.query(
    `SELECT c.*,
            l.name AS list_name, l.display_name AS list_display_name,
            t.name AS template_name,
            s.name AS segment_name
     FROM campaigns c
     LEFT JOIN lists l ON c.list_uid = l.uid
     LEFT JOIN templates t ON c.template_uid = t.uid
     LEFT JOIN list_segments s ON c.segment_uid = s.uid
     WHERE (c.uid = $1 OR c.id::text = $1) AND c.user_id = $2`,
    [uid, userId]
  );
  return rows.length ? fmt(rows[0]) : null;
};

// ── GET /api/get-all-campaigns ────────────────────────────────
router.get('/get-all-campaigns', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page_number) || 1;
    const limit = parseInt(req.query.per_page) || 10;
    const offset = (page - 1) * limit;
    const typeFilter = req.query.type;
    const listUidFilter = req.query.list_uid;

    let query = `
      SELECT c.*,
             l.name AS list_name, l.display_name AS list_display_name,
             t.name AS template_name,
             s.name AS segment_name,
             COUNT(*) OVER() AS total_count
      FROM campaigns c
      LEFT JOIN lists l ON c.list_uid = l.uid
      LEFT JOIN templates t ON c.template_uid = t.uid
      LEFT JOIN list_segments s ON c.segment_uid = s.uid
      WHERE c.user_id = $1
    `;
    const params = [req.user.id];

    if (typeFilter && typeFilter !== 'all') {
      params.push(typeFilter);
      query += ` AND c.type = $${params.length}`;
    }

    if (listUidFilter) {
      params.push(listUidFilter);
      query += ` AND c.list_uid = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY c.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const { rows } = await pool.query(query, params);

    const count = rows.length ? parseInt(rows[0].total_count) : 0;
    return res.json({ status: 'success', data: { count, total_pages: Math.ceil(count / limit), current_page: page, records: rows.map(fmt) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch campaigns', error: e.message });
  }
});

// ── GET /api/get-one-campaign?campaign_uid= ───────────────────
router.get('/get-one-campaign', protect, async (req, res) => {
  try {
    const uid = req.query.campaign_uid || req.query.uid;
    if (!uid) return res.status(400).json({ status: 'error', message: 'campaign_uid is required' });

    const record = await getFullCampaign(uid, req.user.id);
    if (!record) return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    return res.json({ status: 'success', data: { record } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch campaign' });
  }
});

// ── GET /api/get-campaign-stats?campaign_uid= ─────────────────
router.get('/get-campaign-stats', protect, async (req, res) => {
  try {
    const uid = req.query.campaign_uid;
    if (!uid) return res.status(400).json({ status: 'error', message: 'campaign_uid is required' });

    const record = await getFullCampaign(uid, req.user.id);
    if (!record) return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    return res.json({ status: 'success', data: { record } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to fetch campaign stats' });
  }
});

// ── POST /api/create-a-campaign ───────────────────────────────
router.post('/create-a-campaign', protect, async (req, res) => {
  try {
    const b = req.body;
    const required = ['name', 'from_name', 'from_email', 'subject', 'send_at', 'list_uid'];
    const missing = required.filter(k => !b[k]);
    if (missing.length) return res.status(400).json({ status: 'error', message: `Missing: ${missing.join(', ')}` });

    const uid = generateUid();
    await pool.query(
      `INSERT INTO campaigns
         (uid, user_id, name, type, from_name, from_email, reply_to, subject, status,
          list_uid, segment_uid, template_uid, content, plain_text_email, email_stats,
          send_at, url_tracking, inline_css, archive, auto_plain_text, json_feed, xml_feed)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'draft',$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [
        uid, req.user.id,
        b.name, b.type || 'regular',
        b.from_name, b.from_email, b.reply_to || b.from_email, b.subject,
        b.list_uid, b.segment_uid || '', b.template_uid || '',
        b.content || '', b.plain_text_email || '', b.email_stats || '',
        new Date(b.send_at),
        b.url_tracking || 'yes', b.inline_css || 'yes',
        b.archive || 'no', b.auto_plain_text || 'yes',
        b.json_feed || 'no', b.xml_feed || 'no',
      ]
    );

    const record = await getFullCampaign(uid, req.user.id);
    return res.status(201).json({ status: 'success', message: 'Campaign created.', data: { record } });
  } catch (e) {
    console.error('💥 create-a-campaign:', e);
    return res.status(500).json({ status: 'error', message: 'Failed to create campaign', error: e.message });
  }
});

// ── PUT /api/update-a-campaign?campaign_uid= ─────────────────
router.put('/update-a-campaign', protect, async (req, res) => {
  try {
    const uid = req.query.campaign_uid || req.body.campaign_uid;
    const b = req.body;

    const { rows } = await pool.query(
      `UPDATE campaigns SET
         name           = COALESCE($1, name),
         from_name      = COALESCE($2, from_name),
         from_email     = COALESCE($3, from_email),
         subject        = COALESCE($4, subject),
         reply_to       = COALESCE($5, reply_to),
         list_uid       = COALESCE($6, list_uid),
         template_uid   = COALESCE($7, template_uid),
         content        = COALESCE($8, content),
         plain_text_email = COALESCE($9, plain_text_email),
         send_at        = COALESCE($10, send_at),
         segment_uid    = COALESCE($13, segment_uid),
         email_stats    = COALESCE($14, email_stats),
         auto_plain_text= COALESCE($15, auto_plain_text),
         type           = COALESCE($16, type),
         updated_at     = NOW()
       WHERE uid = $11 AND user_id = $12
       RETURNING *`,
      [
        b.name || null, b.from_name || null, b.from_email || null,
        b.subject || null, b.reply_to || null,
        b.list_uid || null, b.template_uid || null,
        b.content || null, b.plain_text_email || null,
        b.send_at ? new Date(b.send_at) : null,
        uid, req.user.id,
        b.segment_uid !== undefined ? b.segment_uid : null,
        b.email_stats !== undefined ? b.email_stats : null,
        b.auto_plain_text || null,
        b.type || null,
      ]
    );

    if (!rows.length) return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    const record = await getFullCampaign(uid, req.user.id);
    return res.json({ status: 'success', message: 'Campaign updated.', data: { record } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to update campaign' });
  }
});

// ── DELETE /api/delete-a-campaign?campaign_uid= ───────────────
router.delete('/delete-a-campaign', protect, async (req, res) => {
  try {
    const uid = req.query.campaign_uid || req.body.campaign_uid;
    const { rowCount } = await pool.query('DELETE FROM campaigns WHERE uid = $1 AND user_id = $2', [uid, req.user.id]);
    if (!rowCount) return res.status(404).json({ status: 'error', message: 'Campaign not found' });
    return res.json({ status: 'success', message: 'Campaign deleted.' });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to delete campaign' });
  }
});

// ── POST /api/copy-a-campaign?campaign_uid= ───────────────────
router.post('/copy-a-campaign', protect, async (req, res) => {
  try {
    const uid = req.query.campaign_uid || req.body.campaign_uid;
    const { rows: orig } = await pool.query('SELECT * FROM campaigns WHERE uid = $1 AND user_id = $2', [uid, req.user.id]);
    if (!orig.length) return res.status(404).json({ status: 'error', message: 'Campaign not found' });

    const o = orig[0];
    const newUid = generateUid();

    await pool.query(
      `INSERT INTO campaigns
         (uid, user_id, name, type, from_name, from_email, reply_to, subject, status,
          list_uid, segment_uid, template_uid, content, plain_text_email,
          send_at, url_tracking, inline_css, archive, auto_plain_text)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'draft',$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [
        newUid, req.user.id,
        `${o.name} (Copy)`, o.type,
        o.from_name, o.from_email, o.reply_to, o.subject,
        o.list_uid, o.segment_uid, o.template_uid,
        o.content, o.plain_text_email,
        o.send_at, o.url_tracking, o.inline_css, o.archive, o.auto_plain_text,
      ]
    );

    const record = await getFullCampaign(newUid, req.user.id);
    return res.status(201).json({ status: 'success', message: 'Campaign copied.', data: { record } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to copy campaign' });
  }
});

// ── PUT /api/mark-a-campaign-as-sent?campaign_uid= ────────────
router.put('/mark-a-campaign-as-sent', protect, async (req, res) => {
  try {
    const uid = req.query.campaign_uid || req.body.campaign_uid;
    const { rows } = await pool.query(
      "UPDATE campaigns SET status = 'pending-sending', updated_at = NOW() WHERE uid = $1 AND user_id = $2 RETURNING *",
      [uid, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ status: 'error', message: 'Campaign not found' });

    // Send in background (non-blocking)
    sendCampaignEmails(rows[0]).catch(console.error);

    return res.json({ status: 'success', message: 'Campaign queued for sending.', data: { record: fmt(rows[0]) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to send campaign' });
  }
});

// ── PUT /api/pause-unpause-a-campaign?campaign_uid= ───────────
router.put('/pause-unpause-a-campaign', protect, async (req, res) => {
  try {
    const uid = req.query.campaign_uid || req.body.campaign_uid;
    const curr = await pool.query('SELECT status FROM campaigns WHERE uid = $1 AND user_id = $2', [uid, req.user.id]);
    if (!curr.rows.length) return res.status(404).json({ status: 'error', message: 'Campaign not found' });

    const newStatus = curr.rows[0].status === 'paused' ? 'sending' : 'paused';
    const { rows } = await pool.query(
      'UPDATE campaigns SET status = $1, updated_at = NOW() WHERE uid = $2 AND user_id = $3 RETURNING *',
      [newStatus, uid, req.user.id]
    );

    return res.json({ status: 'success', message: `Campaign ${newStatus}.`, data: { record: fmt(rows[0]) } });
  } catch (e) {
    return res.status(500).json({ status: 'error', message: 'Failed to toggle campaign' });
  }
});

module.exports = router;
