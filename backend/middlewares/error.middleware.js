const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Logs errors with full context and sends sanitized response to clients
 */
function errorHandler(err, req, res, next) {
    const isMulterError = err?.name === 'MulterError';
    const status = err.status || err.statusCode || (isMulterError ? 400 : 500);
    
    const message = isMulterError && err.code === 'LIMIT_FILE_SIZE'
        ? 'Image is too large. Maximum size is 8MB.'
        : err.message || 'Internal Server Error';

    // Log error with full context
    logger.logError(err, {
        userId: req.user?.id || 'anonymous',
        endpoint: req.path,
        method: req.method,
        ip: req.ip,
        query: req.query,
        status,
        isMulterError,
        errorType: err?.name,
    });

    // Send sanitized error response to client
    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

module.exports = errorHandler;
