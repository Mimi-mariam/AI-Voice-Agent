require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

async function main() {
  const bizResult = await pool.query('SELECT id FROM "Business" LIMIT 1');
  if (bizResult.rows.length === 0) {
    console.log('No business found.');
    return;
  }
  const biz = bizResult.rows[0];

  const calApiKey = process.env.CAL_API_KEY;
  const calEventTypeId = '6769213';

  if (!calApiKey) {
    console.error('CAL_API_KEY is missing from .env file.');
    return;
  }

  await pool.query(
    `UPDATE "Business" SET "calApiKeyEncryptedOrSecureReference" = $1, "calEventTypeId" = $2 WHERE id = $3`,
    [calApiKey, calEventTypeId, biz.id]
  );
  
  console.log(`Successfully updated Business with Cal.com details (Event Type ID: ${calEventTypeId}).`);
  
  await pool.end();
}

main().catch(console.error);
