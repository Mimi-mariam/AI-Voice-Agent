require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

const VAPI_ASSISTANT_ID = '8aeeacf6-77b4-443a-b77c-bf954ab24479';
const CAL_API_KEY = process.env.CAL_API_KEY;

async function main() {
  // Find the business first
  const bizResult = await pool.query('SELECT id, name, email FROM "Business" LIMIT 1');
  if (bizResult.rows.length === 0) {
    console.log('No business found.');
    return;
  }

  const business = bizResult.rows[0];
  console.log(`Updating business: ${business.name} (${business.email})`);

  // Update with Vapi assistant ID and Cal.com API key
  await pool.query(
    `UPDATE "Business" 
     SET "vapiAssistantId" = $1, 
         "calApiKeyEncryptedOrSecureReference" = $2
     WHERE id = $3`,
    [VAPI_ASSISTANT_ID, CAL_API_KEY, business.id]
  );

  // Verify
  const updated = await pool.query(
    'SELECT "vapiAssistantId", "calApiKeyEncryptedOrSecureReference" FROM "Business" WHERE id = $1',
    [business.id]
  );
  
  console.log('✅ Updated successfully!');
  console.log('  vapiAssistantId:', updated.rows[0].vapiAssistantId);
  console.log('  calApiKey set:', !!updated.rows[0].calApiKeyEncryptedOrSecureReference);

  await pool.end();
}

main().catch(console.error);
