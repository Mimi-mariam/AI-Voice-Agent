const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({
  connectionString,
  ssl: true
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const res = await prisma.business.findFirst();
    console.log('Success:', res);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}
test();
