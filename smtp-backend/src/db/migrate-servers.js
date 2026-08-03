const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const pool = require('../config/db');

async function migrateServers() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create delivery_servers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS delivery_servers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) DEFAULT 'SMTP',
        hostname VARCHAR(255) NOT NULL,
        username VARCHAR(255),
        password VARCHAR(255),
        port INTEGER DEFAULT 587,
        hourly_quota INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create bounce_servers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bounce_servers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        hostname VARCHAR(255) NOT NULL,
        username VARCHAR(255),
        password VARCHAR(255),
        port INTEGER DEFAULT 995,
        protocol VARCHAR(50) DEFAULT 'POP3',
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Server tables migration successful');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Server tables migration failed:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrateServers();
