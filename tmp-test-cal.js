require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: true });

async function main() {
  const biz = await pool.query('SELECT "calApiKeyEncryptedOrSecureReference" AS key, "calEventTypeId" AS etype FROM "Business" LIMIT 1');
  await pool.end();
  const { key, etype } = biz.rows[0];

  const now = new Date();
  const start = now.toISOString();
  const end = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();
  const url = `https://api.cal.com/v1/availability?apiKey=${key}&eventTypeId=${etype}&startTime=${encodeURIComponent(start)}&endTime=${encodeURIComponent(end)}`;

  console.log('Calling:', url.replace(key, '***KEY***'));
  const res = await fetch(url);
  console.log('Status:', res.status, res.statusText);
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    console.log('Body keys:', Object.keys(json));
    if (json.slots) {
      for (const [d, slots] of Object.entries(json.slots)) {
        console.log(d, '->', Array.isArray(slots) ? `${slots.length} slots` : slots);
      }
      const firstDay = Object.values(json.slots)[0];
      if (Array.isArray(firstDay) && firstDay[0]) console.log('Sample slot object:', JSON.stringify(firstDay[0]));
    } else {
      console.log('Body:', text.slice(0, 800));
    }
  } catch {
    console.log('Non-JSON body:', text.slice(0, 500));
  }
}
main().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
