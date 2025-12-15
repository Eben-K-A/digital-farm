import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export function generateAccessToken(user) {
  const payload = {
    user_id: user.id,
    email: user.email,
    user_type: user.user_type,
    verification_status: user.verification_status,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'farmconnect',
    algorithm: 'HS256',
  });
}

export function generateRefreshToken(user) {
  const payload = {
    user_id: user.id,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    issuer: 'farmconnect',
    algorithm: 'HS256',
  });
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'farmconnect',
    });
    return { valid: true, decoded };
  } catch (error) {
    let code = 'INVALID_TOKEN';
    if (error.name === 'TokenExpiredError') {
      code = 'TOKEN_EXPIRED';
    }
    return { valid: false, code, message: error.message };
  }
}

export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}
