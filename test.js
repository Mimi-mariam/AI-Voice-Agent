const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

pool.query('SELECT NOW()').then(res => {
  console.log('Success:', res.rows);
}).catch(err => {
  console.error('Error:', err);
}).finally(() => {
  pool.end();
});
