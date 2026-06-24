const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500
  };

  // Supabase specific errors
  if (err.code) {
    switch (err.code) {
      case 'PGRST116':
        error.message = 'Resource not found';
        error.statusCode = 404;
        break;
      case '23505': // Unique constraint violation
        error.message = 'Resource already exists';
        error.statusCode = 409;
        break;
      case '23503': // Foreign key constraint violation
        error.message = 'Referenced resource does not exist';
        error.statusCode = 400;
        break;
      case '23502': // Not null constraint violation
        error.message = 'Required field is missing';
        error.statusCode = 400;
        break;
      case '42P01': // Undefined table
        error.message = 'Database table not found';
        error.statusCode = 500;
        break;
      default:
        error.message = 'Database error occurred';
        error.statusCode = 500;
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(val => val.message).join(', ');
    error.statusCode = 400;
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File too large';
    error.statusCode = 413;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Unexpected file field';
    error.statusCode = 400;
  }

  // Rate limit errors
  if (err.status === 429) {
    error.message = 'Too many requests';
    error.statusCode = 429;
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && error.statusCode === 500) {
    error.message = 'Something went wrong';
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
