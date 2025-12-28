import bcryptjs from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000, // Increased timeout
  statement_timeout: 30000,
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err);
});

async function addAdminUser() {
  let client;
  try {
    console.log('🔑 Connecting to database...');
    client = await pool.connect();
    console.log('✅ Connected to database');

    const email = 'clementprempehfarms@gmail.com';
    const password = 'ClementFarms@2025';
    const firstName = 'Clement';
    const lastName = 'Prempe';
    const phoneNumber = '+233501234567';

    console.log('\n📝 Creating admin user...');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${firstName} ${lastName}`);

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcryptjs.hash(password, 10);

    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const existingUser = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  User already exists. Updating password...');
      const updateResult = await client.query(
        'UPDATE users SET password_hash = $1, user_type = $2, verification_status = $3, email_verified = true, is_active = true WHERE email = $4 RETURNING id, email, user_type',
        [passwordHash, 'admin', 'approved', email]
      );
      console.log('✅ User updated successfully');
      console.log(`   User ID: ${updateResult.rows[0].id}`);
    } else {
      // Insert new user
      console.log('➕ Creating new user...');
      const result = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone_number, user_type, verification_status, email_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, true)
         RETURNING id, email, user_type`,
        [
          email,
          passwordHash,
          firstName,
          lastName,
          phoneNumber,
          'admin',
          'approved',
        ]
      );

      console.log('✅ Admin user created successfully!');
      console.log(`   User ID: ${result.rows[0].id}`);
      console.log(`   Email: ${result.rows[0].email}`);
      console.log(`   Role: ${result.rows[0].user_type}`);
    }

    console.log('\n✨ You can now login with:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.detail) {
      console.error(`   Details: ${error.detail}`);
    }
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

addAdminUser().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
