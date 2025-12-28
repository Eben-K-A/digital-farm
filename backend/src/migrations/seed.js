import bcryptjs from 'bcryptjs';
import pool from '../config/database.js';

async function seedDatabase() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding database with test data...');

    // Test credentials
    const testUsers = [
      {
        email: 'farmer@test.com',
        password: 'TestPassword123',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+233501234567',
        userType: 'farmer',
      },
      {
        email: 'buyer@test.com',
        password: 'TestPassword123',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+233502345678',
        userType: 'buyer',
      },
      {
        email: 'admin@test.com',
        password: 'TestPassword123',
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+233503345679',
        userType: 'admin',
      },
    ];

    // Clear existing test users
    await client.query('DELETE FROM users WHERE email LIKE $1', ['%@test.com']);
    console.log('Cleared existing test users');

    // Insert test users
    for (const user of testUsers) {
      const passwordHash = await bcryptjs.hash(user.password, 10);

      const result = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone_number, user_type, verification_status, email_verified, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, email, user_type`,
        [
          user.email,
          passwordHash,
          user.firstName,
          user.lastName,
          user.phoneNumber,
          user.userType,
          user.userType === 'farmer' ? 'unverified' : 'approved',
          true,
          true,
        ]
      );

      const userId = result.rows[0].id;
      console.log(`✓ Created user: ${user.email} (${user.userType})`);

      // Create farmer record if user is farmer
      if (user.userType === 'farmer') {
        await client.query(
          `INSERT INTO farmers (user_id, farm_name, region, district, is_approved)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, 'Test Farm', 'Greater Accra', 'Accra Metropolitan', false]
        );
        console.log(`  └─ Created farmer profile`);
      }
    }

    // Seed product categories
    const categories = [
      { name: 'Vegetables', slug: 'vegetables', icon: '🥬' },
      { name: 'Fruits', slug: 'fruits', icon: '🍎' },
      { name: 'Grains', slug: 'grains', icon: '🌾' },
      { name: 'Dairy', slug: 'dairy', icon: '🥛' },
      { name: 'Meat & Poultry', slug: 'meat-poultry', icon: '🍗' },
    ];

    await client.query('DELETE FROM product_categories');
    console.log('\nCleared existing categories');

    for (const category of categories) {
      await client.query(
        `INSERT INTO product_categories (name, slug, description, is_active)
         VALUES ($1, $2, $3, $4)`,
        [category.name, category.slug, `${category.name} and related products`, true]
      );
      console.log(`✓ Created category: ${category.name}`);
    }

    // Get farmer ID for product creation
    const farmerResult = await client.query('SELECT id FROM users WHERE email = $1', ['farmer@test.com']);
    const farmerId = farmerResult.rows[0]?.id;

    if (farmerId) {
      // Seed sample products
      const products = [
        // Vegetables
        {
          categorySlug: 'vegetables',
          name: 'Fresh Tomatoes',
          description: 'Ripe, juicy tomatoes picked fresh from the farm',
          price: 8.50,
          unit: 'kg',
          quantity: 100,
          image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&h=500&fit=crop',
        },
        {
          categorySlug: 'vegetables',
          name: 'Organic Lettuce',
          description: 'Crisp, organic lettuce grown without pesticides',
          price: 5.00,
          unit: 'bundle',
          quantity: 50,
          image: 'https://images.unsplash.com/photo-1559181286-d3fee14d55cc?w=500&h=500&fit=crop',
        },
        {
          categorySlug: 'vegetables',
          name: 'Bell Peppers (Mixed)',
          description: 'Colorful bell peppers - red, yellow, and green',
          price: 12.00,
          unit: 'kg',
          quantity: 75,
          image: 'https://images.unsplash.com/photo-1599599810694-b5ac9b1b6fca?w=500&h=500&fit=crop',
        },
        // Fruits
        {
          categorySlug: 'fruits',
          name: 'Organic Bananas',
          description: 'Sweet and nutritious bananas, freshly harvested',
          price: 4.50,
          unit: 'bunch',
          quantity: 80,
          image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=500&fit=crop',
        },
        {
          categorySlug: 'fruits',
          name: 'Mangoes (Alphonso)',
          description: 'Premium Alphonso mangoes - sweet and creamy',
          price: 15.00,
          unit: 'kg',
          quantity: 40,
          image: 'https://images.unsplash.com/photo-1585518419759-20f5e3baa4b6?w=500&h=500&fit=crop',
        },
        {
          categorySlug: 'fruits',
          name: 'Fresh Pineapples',
          description: 'Tropical pineapples, ripe and ready to eat',
          price: 6.00,
          unit: 'each',
          quantity: 35,
          image: 'https://images.unsplash.com/photo-1599599810694-b5ac9b1b6fca?w=500&h=500&fit=crop',
        },
        // Grains
        {
          categorySlug: 'grains',
          name: 'Maize (Corn)',
          description: 'Premium grade maize suitable for various uses',
          price: 3.50,
          unit: 'kg',
          quantity: 200,
          image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=500&h=500&fit=crop',
        },
        {
          categorySlug: 'grains',
          name: 'Brown Rice',
          description: 'Nutritious brown rice with a nutty flavor',
          price: 7.00,
          unit: 'kg',
          quantity: 120,
          image: 'https://images.unsplash.com/photo-1596040299218-5e8f3ce0b069?w=500&h=500&fit=crop',
        },
        // Dairy
        {
          categorySlug: 'dairy',
          name: 'Fresh Milk (1L)',
          description: 'Pure, fresh dairy milk from local farms',
          price: 2.50,
          unit: 'bottle',
          quantity: 150,
          image: 'https://images.unsplash.com/photo-1553531088-df340cf313ce?w=500&h=500&fit=crop',
        },
        {
          categorySlug: 'dairy',
          name: 'Farm Fresh Eggs (Dozen)',
          description: 'Free-range eggs from happy hens',
          price: 3.50,
          unit: 'dozen',
          quantity: 100,
          image: 'https://images.unsplash.com/photo-1585966975990-7003a3699a17?w=500&h=500&fit=crop',
        },
        // Meat & Poultry
        {
          categorySlug: 'meat-poultry',
          name: 'Fresh Chicken Breast',
          description: 'Lean, fresh chicken breast - premium quality',
          price: 14.00,
          unit: 'kg',
          quantity: 60,
          image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500&h=500&fit=crop',
        },
        {
          categorySlug: 'meat-poultry',
          name: 'Free-range Eggs (30ct)',
          description: 'Large free-range eggs, hormone-free',
          price: 8.50,
          unit: 'carton',
          quantity: 50,
          image: 'https://images.unsplash.com/photo-1508737267454-77a47e855e0d?w=500&h=500&fit=crop',
        },
      ];

      console.log('\nSeeding products...');

      for (const product of products) {
        // Get category ID by slug
        const categoryResult = await client.query(
          'SELECT id FROM product_categories WHERE slug = $1',
          [product.categorySlug]
        );

        if (categoryResult.rows.length === 0) {
          console.log(`  ⚠ Category not found: ${product.categorySlug}`);
          continue;
        }

        const categoryId = categoryResult.rows[0].id;
        const slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');

        await client.query(
          `INSERT INTO products (farmer_id, category_id, name, slug, description, long_description, price, unit, quantity_available, main_image_url, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            farmerId,
            categoryId,
            product.name,
            slug,
            product.description,
            product.description,
            product.price,
            product.unit,
            product.quantity,
            product.image,
            true,
          ]
        );

        console.log(`  ✓ Created product: ${product.name}`);
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Farmer Account (with products):');
    console.log('  Email: farmer@test.com');
    console.log('  Password: TestPassword123');
    console.log('\nBuyer Account:');
    console.log('  Email: buyer@test.com');
    console.log('  Password: TestPassword123');
    console.log('\nAdmin Account:');
    console.log('  Email: admin@test.com');
    console.log('  Password: TestPassword123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedDatabase();
