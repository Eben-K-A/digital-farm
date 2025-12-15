import pool from '../config/database.js';

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Running database migrations...');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone_number VARCHAR(20),
        profile_picture_url VARCHAR(500),
        user_type VARCHAR(50) NOT NULL DEFAULT 'farmer',
        
        is_verified BOOLEAN DEFAULT FALSE,
        verification_status VARCHAR(50) DEFAULT 'unverified',
        
        email_verified BOOLEAN DEFAULT FALSE,
        email_verified_at TIMESTAMP NULL,
        phone_verified BOOLEAN DEFAULT FALSE,
        phone_verified_at TIMESTAMP NULL,
        
        last_login TIMESTAMP NULL,
        login_attempts INT DEFAULT 0,
        locked_until TIMESTAMP NULL,
        
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL
      );
    `);

    // Create index on email
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Create index on user_type
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
    `);

    // Create index on verification_status
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_verification_status ON users(verification_status);
    `);

    console.log('✓ Users table created');

    // Create farmers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        
        farm_name VARCHAR(255) NOT NULL,
        farm_size DECIMAL(10, 2),
        years_of_experience INT,
        
        region VARCHAR(100),
        district VARCHAR(100),
        
        rating DECIMAL(3, 2) DEFAULT 0.0,
        rating_count INT DEFAULT 0,
        total_products_listed INT DEFAULT 0,
        total_sales INT DEFAULT 0,
        
        is_approved BOOLEAN DEFAULT FALSE,
        suspension_reason VARCHAR(500) NULL,
        suspended_until TIMESTAMP NULL,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on user_id
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_farmers_user_id ON farmers(user_id);
    `);

    // Create index on region
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_farmers_region ON farmers(region);
    `);

    console.log('✓ Farmers table created');

    // Create farmer_verifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS farmer_verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        
        full_name VARCHAR(255) NOT NULL,
        date_of_birth DATE NOT NULL,
        national_id_number VARCHAR(100) NOT NULL UNIQUE,
        national_id_type VARCHAR(50) NOT NULL,
        photograph_url VARCHAR(500),
        
        farm_name VARCHAR(255) NOT NULL,
        region VARCHAR(100) NOT NULL,
        district VARCHAR(100) NOT NULL,
        town_community VARCHAR(100) NOT NULL,
        gps_address VARCHAR(255) NOT NULL,
        farming_types JSONB NOT NULL DEFAULT '[]',
        produce_categories JSONB NOT NULL DEFAULT '[]',
        farm_size VARCHAR(50),
        years_of_experience INT,
        
        mobile_money_name VARCHAR(255) NOT NULL,
        mobile_money_number VARCHAR(20) NOT NULL,
        account_holder_name VARCHAR(255) NOT NULL,
        preferred_payment_method VARCHAR(50),
        
        ghana_card_front_url VARCHAR(500),
        ghana_card_back_url VARCHAR(500),
        farm_photo_1_url VARCHAR(500),
        farm_photo_2_url VARCHAR(500),
        business_registration_url VARCHAR(500),
        
        confirm_ownership BOOLEAN DEFAULT FALSE,
        agree_to_terms BOOLEAN DEFAULT FALSE,
        consent_to_verification BOOLEAN DEFAULT FALSE,
        
        status VARCHAR(50) DEFAULT 'pending',
        current_step INT DEFAULT 0,
        
        level_1_status VARCHAR(50) DEFAULT 'pending',
        otp_verified BOOLEAN DEFAULT FALSE,
        otp_verified_at TIMESTAMP,
        id_format_valid BOOLEAN DEFAULT FALSE,
        mobile_money_name_matched BOOLEAN DEFAULT FALSE,
        level_1_completed_at TIMESTAMP,
        
        level_2_status VARCHAR(50) DEFAULT 'pending',
        reviewed_by_admin_id UUID REFERENCES users(id),
        manual_verification_completed_at TIMESTAMP,
        admin_notes TEXT,
        
        submitted_at TIMESTAMP,
        approved_at TIMESTAMP,
        rejected_at TIMESTAMP,
        rejection_reason TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(farmer_id)
      );
    `);

    // Create indexes on farmer_verifications
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_farmer_verifications_farmer_id ON farmer_verifications(farmer_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_farmer_verifications_user_id ON farmer_verifications(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_farmer_verifications_status ON farmer_verifications(status);
    `);

    console.log('✓ Farmer Verifications table created');

    // Create OTP verification table
    await client.query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        verification_id UUID REFERENCES farmer_verifications(id) ON DELETE CASCADE,
        
        phone_number VARCHAR(20) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        
        is_verified BOOLEAN DEFAULT FALSE,
        verified_at TIMESTAMP,
        
        attempts INT DEFAULT 0,
        max_attempts INT DEFAULT 5,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes'),
        
        used BOOLEAN DEFAULT FALSE
      );
    `);

    // Create indexes on OTP
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_otp_verifications_user_id ON otp_verifications(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone_number ON otp_verifications(phone_number);
    `);

    console.log('✓ OTP Verifications table created');

    // Create audit logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        
        action VARCHAR(255) NOT NULL,
        resource_type VARCHAR(100),
        resource_id UUID,
        
        old_values JSONB,
        new_values JSONB,
        
        ip_address VARCHAR(50),
        user_agent TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes on audit logs
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
    `);

    console.log('✓ Audit Logs table created');

    console.log('\n✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

runMigrations();
