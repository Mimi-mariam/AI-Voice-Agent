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

  await pool.query(
    `UPDATE "Business" SET name = $1, description = $2, slug = $3 WHERE id = $4`,
    ['Luxe Hair Studio', 'Premium hair styling, wig installation, braiding, wig revamps, and hair treatments.', 'luxe-hair-studio', biz.id]
  );
  console.log('Updated business to Luxe Hair Studio.');

  await pool.query('DELETE FROM "KnowledgeItem" WHERE "businessId" = $1', [biz.id]);
  
  const items = [
    { cat: 'SERVICE', title: 'Wig Installation', content: 'Wig installation starts from ₦35,000. Professional wig installation for a polished finish.' },
    { cat: 'SERVICE', title: 'Braids', content: 'Braids start from ₦25,000. Beautiful protective styling tailored to your preferred look.' },
    { cat: 'SERVICE', title: 'Wig Revamp', content: 'Wig revamp starts from ₦20,000. Refresh and restore your wig for a renewed look.' },
    { cat: 'SERVICE', title: 'Hair Treatment', content: 'Hair treatments start from ₦15,000. Hair care treatments designed to keep your hair healthy and refreshed.' },
    { cat: 'FAQ', title: 'Booking Policy', content: 'Appointments can be canceled or rescheduled up to 24 hours in advance.' }
  ];

  for (const item of items) {
    await pool.query(
      `INSERT INTO "KnowledgeItem" (id, "businessId", category, title, content, "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`,
      [biz.id, item.cat, item.title, item.content]
    );
  }
  console.log('Updated knowledge base.');
  await pool.end();
}

main().catch(console.error);
