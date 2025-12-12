require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL tidak ditemukan!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Gagal koneksi ke PostgreSQL:', err.message);
  } else {
    console.log('Database PostgreSQL terhubung.');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
