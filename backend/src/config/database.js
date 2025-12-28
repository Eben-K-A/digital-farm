import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Check your .env file.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 30000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err.message);
});

pool.on('connect', () => {
  console.log('✅ New database connection established');
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Pool initialized and database is accessible');
  })
  .catch((err) => {
    console.error('❌ Failed to initialize pool:', err.message);
  });

export default pool;
