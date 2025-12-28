import bcryptjs from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function createAdminUser() {
  const client = await pool.connect();
  
  try {
    const email = 'clementprempehfarms@gmail.com';
    const password = 'ClementFarms@2025';
    const firstName = 'Clement';
    const lastName = 'Prempe';
    const phoneNumber = '+233501234567';

    console.log('🔐 Creating admin user...');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${firstName} ${lastName}`);

    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  User already exists. Updating...');
      await client.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [passwordHash, email]
      );
      console.log('✅ Password updated successfully');
    } else {
      // Insert user
      const result = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone_number, user_type, verification_status, email_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, email, user_type`,
        [
          email,
          passwordHash,
          firstName,
          lastName,
          phoneNumber,
          'admin',
          'approved',
          true,
          true,
        ]
      );

      console.log('✅ Admin user created successfully!');
      console.log(`📝 User ID: ${result.rows[0].id}`);
    }

    console.log('\n🎉 You can now login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

createAdminUser();
