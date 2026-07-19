const pool = require('../config/db');

/**
 * Real-time check if an email or IP address is blacklisted or suppressed.
 * @param {number|string} userId
 * @param {string} email
 * @param {string} [ipAddress]
 * @returns {Promise<{ blocked: boolean, type?: string, reason?: string }>}
 */
async function checkRealtimeBlacklist(userId, email, ipAddress = null) {
  const emailLower = (email || '').toLowerCase().trim();
  const ipClean = (ipAddress || '').trim();

  if (emailLower) {
    // 1. Email Blacklist Check
    const eb = await pool.query(
      "SELECT reason FROM email_blacklist WHERE user_id = $1 AND LOWER(email) = $2 LIMIT 1",
      [userId, emailLower]
    );
    if (eb.rows.length > 0) {
      return { blocked: true, type: 'email_blacklist', reason: eb.rows[0].reason || 'Email is blacklisted' };
    }

    // 2. Suppression List Check
    const sl = await pool.query(
      "SELECT reason FROM suppression_list WHERE user_id = $1 AND LOWER(email) = $2 LIMIT 1",
      [userId, emailLower]
    );
    if (sl.rows.length > 0) {
      return { blocked: true, type: 'suppression_list', reason: sl.rows[0].reason || 'Email is suppressed' };
    }
  }

  if (ipClean) {
    // 3. IP Blacklist Check
    const ipb = await pool.query(
      "SELECT reason FROM ip_blacklist WHERE user_id = $1 AND ip_address = $2 LIMIT 1",
      [userId, ipClean]
    );
    if (ipb.rows.length > 0) {
      return { blocked: true, type: 'ip_blacklist', reason: ipb.rows[0].reason || 'IP address is blacklisted' };
    }
  }

  return { blocked: false };
}

module.exports = { checkRealtimeBlacklist };
