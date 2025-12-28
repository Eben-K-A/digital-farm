export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  let errorCode = 'INTERNAL_SERVER_ERROR';

  if (err.code === '23505') {
    // PostgreSQL unique violation
    errorCode = 'DUPLICATE_EMAIL';
  } else if (err.name === 'ValidationError') {
    errorCode = 'VALIDATION_ERROR';
  } else if (err.name === 'JsonWebTokenError') {
    errorCode = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    errorCode = 'TOKEN_EXPIRED';
  }

  res.status(status).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
      details: err.details || {},
      timestamp: new Date().toISOString(),
    },
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
