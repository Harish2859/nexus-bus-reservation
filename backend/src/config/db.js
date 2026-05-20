const { Pool } = require('pg');
require('dotenv').config();

let pool;

if (process.env.DATABASE_URL) {
  console.log('Connecting to PRODUCTION cloud database...');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  console.log('Connecting to LOCAL development database...');
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'bus_reservation_db'
  });
}

pool.query('SELECT NOW()', (err) => {
  if (err) console.error('Database connection failed:', err.message);
  else console.log('Database connected successfully.');
});

module.exports = pool;
