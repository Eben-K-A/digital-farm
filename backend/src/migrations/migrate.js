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

    // Create product categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
    `);

    console.log('✓ Product Categories table created');

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES product_categories(id),

        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        long_description TEXT,

        price DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50) NOT NULL DEFAULT 'kg',
        quantity_available INT NOT NULL DEFAULT 0,

        image_urls JSONB DEFAULT '[]',
        main_image_url VARCHAR(500),

        rating DECIMAL(3, 2) DEFAULT 0.0,
        rating_count INT DEFAULT 0,
        total_sold INT DEFAULT 0,

        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,

        UNIQUE(farmer_id, slug)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
    `);

    console.log('✓ Products table created');

    // Create product reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,

        is_verified_purchase BOOLEAN DEFAULT FALSE,
        helpful_count INT DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(product_id, buyer_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_product_reviews_buyer_id ON product_reviews(buyer_id);
    `);

    console.log('✓ Product Reviews table created');

    // Create user addresses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        address_type VARCHAR(50) NOT NULL DEFAULT 'residential',
        street_address VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        region VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20),
        gps_address VARCHAR(255),

        recipient_name VARCHAR(255) NOT NULL,
        recipient_phone VARCHAR(20) NOT NULL,

        is_default BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
    `);

    console.log('✓ User Addresses table created');

    // Create user favorites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(user_id, product_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
    `);

    console.log('✓ User Favorites table created');

    // Create shopping cart table
    await client.query(`
      CREATE TABLE IF NOT EXISTS shopping_carts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_shopping_carts_user_id ON shopping_carts(user_id);
    `);

    console.log('✓ Shopping Carts table created');

    // Create cart items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cart_id UUID NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,

        quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
        unit_price DECIMAL(10, 2) NOT NULL,

        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(cart_id, product_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
    `);

    console.log('✓ Cart Items table created');

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(50) NOT NULL UNIQUE,

        buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        delivery_address_id UUID REFERENCES user_addresses(id),

        subtotal DECIMAL(10, 2) NOT NULL,
        delivery_fee DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,

        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),

        special_instructions TEXT,

        ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP,
        dispatched_at TIMESTAMP,
        delivered_at TIMESTAMP,
        cancelled_at TIMESTAMP,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
    `);

    console.log('✓ Orders table created');

    // Create order items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id),
        farmer_id UUID NOT NULL REFERENCES farmers(id),

        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_items_farmer_id ON order_items(farmer_id);
    `);

    console.log('✓ Order Items table created');

    // Create order tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_tracking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,

        current_location VARCHAR(255),
        last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        delivery_partner_id UUID REFERENCES users(id),

        estimated_delivery TIMESTAMP,
        actual_delivery TIMESTAMP,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON order_tracking(order_id);
    `);

    console.log('✓ Order Tracking table created');

    // Create delivery partners table
    await client.query(`
      CREATE TABLE IF NOT EXISTS delivery_partners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

        vehicle_type VARCHAR(50),
        vehicle_registration VARCHAR(50),
        license_number VARCHAR(100),

        current_location VARCHAR(255),
        is_available BOOLEAN DEFAULT FALSE,

        total_deliveries INT DEFAULT 0,
        completed_deliveries INT DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 0.0,

        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_delivery_partners_user_id ON delivery_partners(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_delivery_partners_is_available ON delivery_partners(is_available);
    `);

    console.log('✓ Delivery Partners table created');

    // Create delivery routes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS delivery_routes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        delivery_partner_id UUID NOT NULL REFERENCES delivery_partners(id),

        route_name VARCHAR(255),
        start_location VARCHAR(255),
        end_location VARCHAR(255),
        estimated_distance DECIMAL(10, 2),
        estimated_duration_minutes INT,

        status VARCHAR(50) DEFAULT 'pending',
        assigned_at TIMESTAMP,
        completed_at TIMESTAMP,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_delivery_routes_delivery_partner_id ON delivery_routes(delivery_partner_id);
    `);

    console.log('✓ Delivery Routes table created');

    // Create route waypoints table
    await client.query(`
      CREATE TABLE IF NOT EXISTS route_waypoints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        route_id UUID NOT NULL REFERENCES delivery_routes(id) ON DELETE CASCADE,
        order_id UUID REFERENCES orders(id),

        sequence_number INT NOT NULL,
        location VARCHAR(255) NOT NULL,
        gps_coordinates JSONB,

        arrival_time TIMESTAMP,
        departure_time TIMESTAMP,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_route_waypoints_route_id ON route_waypoints(route_id);
    `);

    console.log('✓ Route Waypoints table created');

    // Create warehouse locations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS warehouse_locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL UNIQUE,
        location VARCHAR(255) NOT NULL,
        region VARCHAR(100),

        capacity INT,
        current_stock_value DECIMAL(15, 2) DEFAULT 0,

        manager_id UUID REFERENCES users(id),
        is_active BOOLEAN DEFAULT TRUE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_warehouse_locations_region ON warehouse_locations(region);
    `);

    console.log('✓ Warehouse Locations table created');

    // Create warehouse inventory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS warehouse_inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        warehouse_id UUID NOT NULL REFERENCES warehouse_locations(id),
        product_id UUID NOT NULL REFERENCES products(id),

        quantity_on_hand INT DEFAULT 0,
        quantity_reserved INT DEFAULT 0,
        quantity_damaged INT DEFAULT 0,

        last_counted TIMESTAMP,
        reorder_level INT DEFAULT 50,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(warehouse_id, product_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_warehouse_id ON warehouse_inventory(warehouse_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_product_id ON warehouse_inventory(product_id);
    `);

    console.log('✓ Warehouse Inventory table created');

    // Create stock movements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        warehouse_id UUID REFERENCES warehouse_locations(id),
        product_id UUID NOT NULL REFERENCES products(id),

        movement_type VARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        reference_id UUID,
        notes TEXT,

        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_stock_movements_warehouse_id ON stock_movements(warehouse_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
    `);

    console.log('✓ Stock Movements table created');

    // Create notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,

        related_resource_type VARCHAR(100),
        related_resource_id UUID,

        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    `);

    console.log('✓ Notifications table created');

    // Create email logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recipient_email VARCHAR(255) NOT NULL,

        template VARCHAR(100),
        subject VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',

        sent_at TIMESTAMP,
        error_message TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON email_logs(recipient_email);
    `);

    console.log('✓ Email Logs table created');

    // Create payment transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id),
        user_id UUID NOT NULL REFERENCES users(id),

        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'GHS',

        payment_method VARCHAR(50),
        payment_provider VARCHAR(100),
        provider_transaction_id VARCHAR(255),

        status VARCHAR(50) DEFAULT 'pending',

        customer_phone VARCHAR(20),
        customer_name VARCHAR(255),

        initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
    `);

    console.log('✓ Payment Transactions table created');

    // Create payment methods table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        payment_type VARCHAR(50),
        phone_number VARCHAR(20),
        account_name VARCHAR(255),

        is_default BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
    `);

    console.log('✓ Payment Methods table created');

    // Create seller ratings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS seller_ratings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
        buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(farmer_id, buyer_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_seller_ratings_farmer_id ON seller_ratings(farmer_id);
    `);

    console.log('✓ Seller Ratings table created');

    // Create admin approvals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_approvals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        resource_type VARCHAR(100) NOT NULL,
        resource_id UUID NOT NULL,

        requester_id UUID REFERENCES users(id),
        approver_id UUID REFERENCES users(id),

        status VARCHAR(50) DEFAULT 'pending',
        reason TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_approvals_resource_type ON admin_approvals(resource_type);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_approvals_status ON admin_approvals(status);
    `);

    console.log('✓ Admin Approvals table created');

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
