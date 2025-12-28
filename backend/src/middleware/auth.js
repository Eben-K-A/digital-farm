import { verifyToken } from '../utils/jwt.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header',
      },
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const verification = verifyToken(token);

  if (!verification.valid) {
    const statusCode = verification.code === 'TOKEN_EXPIRED' ? 401 : 401;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: verification.code,
        message: verification.message,
      },
    });
  }

  req.user = verification.decoded;
  next();
}

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }

    if (!allowedRoles.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    }

    next();
  };
}
