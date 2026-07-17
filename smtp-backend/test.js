require('dotenv').config();
const pool = require('./src/config/db');

async function test() {
  try {
    const { rows } = await pool.query('SELECT uid, name, conditions FROM list_segments');
    console.log(JSON.stringify(rows, null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
test();
