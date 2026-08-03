const express = require('express');
const pool = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/dashboard/stats ───────────────────────────────────
router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [userId];

    if (startDate && endDate) {
      dateFilter = ' AND created_at >= $2 AND created_at <= $3';
      params.push(startDate, endDate);
    }

    const [
      campaigns, lists, templates, subscribers,
      recentActivity, deliveryStats, chartData
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM campaigns WHERE user_id = $1${dateFilter}`, params),
      pool.query(`SELECT COUNT(*) FROM lists WHERE user_id = $1 AND is_archived = false${dateFilter}`, params),
      pool.query(`SELECT COUNT(*) FROM templates WHERE user_id = $1 AND is_active = true${dateFilter}`, params),
      pool.query(`SELECT COUNT(*) FROM subscribers
                  WHERE list_uid IN (SELECT uid FROM lists WHERE user_id = $1)
                  AND status = 'confirmed'`, [userId]),
      pool.query(`
        (SELECT 'campaign' as type, name, created_at FROM campaigns WHERE user_id = $1)
        UNION ALL
        (SELECT 'list' as type, name, created_at FROM lists WHERE user_id = $1)
        UNION ALL
        (SELECT 'template' as type, name, created_at FROM templates WHERE user_id = $1)
        ORDER BY created_at DESC LIMIT 5
      `, [userId]),
      pool.query(`
        SELECT 
          SUM(COALESCE(open_count, 0)) as total_opens, 
          SUM(COALESCE(click_count, 0)) as total_clicks,
          SUM(COALESCE(unsubscribe_count, 0)) as total_bounces,
          COUNT(uid) as total_sent
        FROM campaigns WHERE user_id = $1${dateFilter}
      `, params),
      pool.query(`
        SELECT 
          TO_CHAR(created_at, 'Mon DD') as name,
          COUNT(uid) as sent,
          SUM(COALESCE(open_count, 0)) as opens,
          SUM(COALESCE(click_count, 0)) as clicks,
          SUM(COALESCE(unsubscribe_count, 0)) as bounces
        FROM campaigns 
        WHERE user_id = $1 ${dateFilter ? dateFilter : "AND created_at >= NOW() - INTERVAL '7 days'"}
        GROUP BY TO_CHAR(created_at, 'Mon DD'), DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `, params)
    ]);

    return res.json({
      status: 'success',
      data: {
        campaigns: parseInt(campaigns.rows[0].count),
        lists: parseInt(lists.rows[0].count),
        templates: parseInt(templates.rows[0].count),
        subscribers: parseInt(subscribers.rows[0].count),
        recentActivity: recentActivity.rows,
        deliveryStats: {
          sent: parseInt(deliveryStats.rows[0]?.total_sent || 0),
          opens: parseInt(deliveryStats.rows[0]?.total_opens || 0),
          clicks: parseInt(deliveryStats.rows[0]?.total_clicks || 0),
          bounces: parseInt(deliveryStats.rows[0]?.total_bounces || 0),
        },
        chartData: chartData.rows.map(row => ({
          name: row.name,
          sent: parseInt(row.sent || 0),
          opens: parseInt(row.opens || 0),
          clicks: parseInt(row.clicks || 0),
          bounces: parseInt(row.bounces || 0),
        }))
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
