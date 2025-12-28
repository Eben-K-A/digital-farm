import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { validateEmail, validatePassword } from '../utils/validators.js';

export async function registerUser(email, password, firstName, lastName, phoneNumber, userType) {
  // Validate email
  if (!validateEmail(email)) {
    const error = new Error('Invalid email format');
    error.status = 400;
    error.code = 'INVALID_EMAIL';
    throw error;
  }

  // Validate password
  if (!validatePassword(password)) {
    const error = new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
    error.status = 422;
    error.code = 'WEAK_PASSWORD';
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert user
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone_number, user_type, verification_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, user_type, verification_status, created_at`,
    [email, passwordHash, firstName, lastName, phoneNumber, userType, userType === 'farmer' ? 'unverified' : 'approved']
  );

  const user = result.rows[0];

  // If farmer, create farmer record
  if (userType === 'farmer') {
    await pool.query(
      `INSERT INTO farmers (user_id, farm_name)
       VALUES ($1, $2)`,
      [user.id, 'Pending Setup']
    );
  }

  return user;
}

export async function loginUser(email, password) {
  // Find user by email
  const userResult = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
    [email]
  );

  if (userResult.rows.length === 0) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const user = userResult.rows[0];

  // Check if account is locked
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const error = new Error('Account is locked. Try again later.');
    error.status = 429;
    error.code = 'ACCOUNT_LOCKED';
    throw error;
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    // Increment login attempts
    const newAttempts = user.login_attempts + 1;
    const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

    await pool.query(
      'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3',
      [newAttempts, lockedUntil, user.id]
    );

    const error = new Error('Invalid email or password');
    error.status = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  // Reset login attempts
  await pool.query(
    'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = $1',
    [user.id]
  );

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      user_type: user.user_type,
      verification_status: user.verification_status,
    },
    accessToken,
    refreshToken,
  };
}

export async function getUserById(userId) {
  const result = await pool.query(
    'SELECT id, email, first_name, last_name, phone_number, user_type, verification_status, created_at FROM users WHERE id = $1 AND deleted_at IS NULL',
    [userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return result.rows[0];
}
