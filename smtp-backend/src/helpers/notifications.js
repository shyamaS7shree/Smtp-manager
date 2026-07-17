const pool = require('../config/db');

/**
 * Creates a notification in the database for a specific user
 * @param {number} userId - The ID of the user receiving the notification
 * @param {string} title - The title of the notification
 * @param {string} message - The HTML/text content of the notification
 * @param {number} hoursToExpire - Number of hours before the notification expires (default 24)
 * @returns {Promise<object|null>} The created notification record or null on error
 */
const createNotification = async (userId, title, message, hoursToExpire = 24) => {
  try {
    if (!userId) {
      console.warn('createNotification: Missing userId');
      return null;
    }

    const { rows } = await pool.query(
      `INSERT INTO notifications (user_id, title, message, expires_at)
       VALUES ($1, $2, $3, NOW() + interval '1 hour' * $4)
       RETURNING *`,
      [userId, title, message, hoursToExpire]
    );
    
    return rows[0];
  } catch (error) {
    console.error('💥 Error creating notification:', error);
    return null;
  }
};

module.exports = {
  createNotification
};
