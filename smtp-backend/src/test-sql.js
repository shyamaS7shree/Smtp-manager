const pool = require('./config/db');

async function test() {
  try {
    const userId = 1; // Assuming user ID 1 exists, or we can just run a query without user ID filter if possible. We can check recentActivity.
    
    // Test recent activity query
    const res = await pool.query(`
        (SELECT 'campaign' as type, name, created_at FROM campaigns)
        UNION ALL
        (SELECT 'list' as type, name, created_at FROM lists)
        UNION ALL
        (SELECT 'template' as type, name, created_at FROM templates)
        ORDER BY created_at DESC LIMIT 5
    `);
    console.log("Recent Activity:", res.rows);
    
    // Test chart data query
    const chart = await pool.query(`
        SELECT 
          TO_CHAR(created_at, 'Mon DD') as name,
          COUNT(uid) as sent,
          SUM(COALESCE(open_count, 0)) as opens,
          SUM(COALESCE(click_count, 0)) as clicks,
          SUM(COALESCE(unsubscribe_count, 0)) as bounces
        FROM campaigns 
        GROUP BY TO_CHAR(created_at, 'Mon DD'), DATE(created_at)
        ORDER BY DATE(created_at) ASC
    `);
    console.log("Chart Data:", chart.rows);
    
    process.exit(0);
  } catch (err) {
    console.error("SQL Error:", err);
    process.exit(1);
  }
}

test();
