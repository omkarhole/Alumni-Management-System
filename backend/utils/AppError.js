/**
 * Custom AppError class for consistent error handling
 * Extends the built-in Error class
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        
        // Capture stack trace
        Error.captureStackTrace(this, this.constructor);
    }

    /**
     * Create a validation error (400)
     * @param {string} message - Error message
     * @param {Object} details - Additional validation details
     */
    static validation(message, details = null) {
        const err = new AppError(message, 400);
        err.validationDetails = details;
        return err;
    }

    /**
     * Create a not found error (404)
     * @param {string} resource - Resource name (e.g., 'User', 'Event')
     */
    static notFound(resource) {
        return new AppError(`${resource} not found`, 404);
    }

    /**
     * Create an unauthorized error (401)
     * @param {string} message - Error message
     */
    static unauthorized(message = 'Unauthorized') {
        return new AppError(message, 401);
    }

    /**
     * Create a forbidden error (403)
     * @param {string} message - Error message
     */
    static forbidden(message = 'Forbidden') {
        return new AppError(message, 403);
    }

    /**
     * Create an internal server error (500)
     * @param {string} message - Error message
     */
    static internal(message = 'Internal Server Error') {
        return new AppError(message, 500);
    }
}

module.exports = AppError;
