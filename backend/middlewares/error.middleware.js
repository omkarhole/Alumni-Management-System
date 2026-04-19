const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * 
 * Must be registered as the last middleware (after all other middlewares and routes)
 * Express expects 4 parameters: (err, req, res, next)
 * This tells Express this is an error handling middleware
 * 
 * Features:
 * - Handles Multer file upload errors
 * - Handles Joi validation errors
 * - Logs errors with full context (stack, user, endpoint, etc.)
 * - Hides sensitive info in production
 * - Returns consistent error response format
 */
function errorHandler(err, req, res, next) {
    const isProd = process.env.NODE_ENV === 'production';
    const isDev = !isProd;

    // Default error properties
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'Internal Server Error';
    let errorDetails = null;

    // Handle Multer file upload errors
    if (err?.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File is too large. Maximum size is 8MB.';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected file in request.';
        } else {
            message = `File upload error: ${err.message}`;
        }
    }
    // Handle Joi validation errors
    else if (err?.isJoi || err?.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        errorDetails = isDev ? err.details || err.message : null;
    }
    // Handle MongoDB validation errors
    else if (err?.name === 'ValidationError' && err?.errors) {
        statusCode = 400;
        message = 'Database validation failed';
        errorDetails = isDev ? Object.keys(err.errors) : null;
    }
    // Handle MongoDB duplicate key errors
    else if (err?.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
    }
    // Handle MongoDB cast errors (invalid ObjectId)
    else if (err?.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.kind}`;
    }
    // Handle JWT errors
    else if (err?.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (err?.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Build log context
    const logContext = {
        userId: req.user?.id || req.user?._id || 'anonymous',
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        statusCode,
        errorName: err.name,
        errorType: err.constructor.name,
        ...(isDev && {
            query: req.query,
            body: req.body,
            params: req.params,
        }),
    };

    // Log the error with context
    if (statusCode >= 500) {
        // Log server errors with full stack trace
        logger.logError(err, logContext);
    } else {
        // Log client errors (4xx) as warnings with less detail
        logger.warn(`${statusCode} ${message}`, logContext);
    }

    // Build response object
    const response = {
        error: isProd && statusCode >= 500
            ? 'Internal Server Error'
            : message,
        ...(isDev && { stack: err.stack }),
        ...(errorDetails && { details: errorDetails }),
        status: statusCode,
    };

    // Send error response
    res.status(statusCode).json(response);
}

module.exports = errorHandler;
