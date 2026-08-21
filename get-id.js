require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

async function main() {
  const result = await pool.query('SELECT id, name, email FROM "Business" LIMIT 1');
  if (result.rows.length === 0) {
    console.log('No business found in database.');
  } else {
    const b = result.rows[0];
    console.log(`Business Name: ${b.name}`);
    console.log(`Business Email: ${b.email}`);
    console.log(`Business ID: ${b.id}`);
  }
  await pool.end();
}

main().catch(console.error);
