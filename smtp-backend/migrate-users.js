const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.yttcylhaqpzoysvehjqu:smtp-master@123@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
});

async function alterUsersTable() {
  try {
    const query = `
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS timezone VARCHAR(100),
      ADD COLUMN IF NOT EXISTS language VARCHAR(50),
      ADD COLUMN IF NOT EXISTS birth_date DATE,
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS company_name VARCHAR(150),
      ADD COLUMN IF NOT EXISTS company_website VARCHAR(255),
      ADD COLUMN IF NOT EXISTS company_country VARCHAR(100),
      ADD COLUMN IF NOT EXISTS company_zone VARCHAR(100),
      ADD COLUMN IF NOT EXISTS company_address VARCHAR(255),
      ADD COLUMN IF NOT EXISTS company_address2 VARCHAR(255),
      ADD COLUMN IF NOT EXISTS company_zone_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS company_city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS company_zip_code VARCHAR(50),
      ADD COLUMN IF NOT EXISTS company_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS company_fax VARCHAR(50),
      ADD COLUMN IF NOT EXISTS company_type_industry VARCHAR(100),
      ADD COLUMN IF NOT EXISTS company_vat_number VARCHAR(100);
    `;
    await pool.query(query);
    console.log("Database altered successfully!");
  } catch (err) {
    console.error("Error altering database:", err);
  } finally {
    await pool.end();
  }
}

alterUsersTable();
