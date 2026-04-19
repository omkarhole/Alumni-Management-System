const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Define console format for readable output
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
            metaStr = JSON.stringify(meta, null, 2);
        }
        return `[${timestamp}] ${level}: ${message} ${metaStr}`;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'alumni-management-api' },
    transports: [
        // Error log file - logs errors only
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: logFormat,
            maxsize: 10485760, // 10MB
            maxFiles: 5,
        }),
        // Combined log file - logs everything
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            format: logFormat,
            maxsize: 10485760, // 10MB
            maxFiles: 5,
        }),
    ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
    }));
} else {
    // In production, add console transport with minimal output (errors only)
    logger.add(new winston.transports.Console({
        level: 'error',
        format: consoleFormat,
    }));
}

/**
 * Log an error with contextual information
 * @param {Error|string} error - Error object or error message
 * @param {Object} context - Additional context (userId, endpoint, method, etc.)
 */
logger.logError = function(error, context = {}) {
    const errorInfo = {
        message: error?.message || String(error),
        stack: error?.stack || '',
        ...context,
    };
    
    this.error(errorInfo.message, {
        ...errorInfo,
        stack: errorInfo.stack,
    });
};

/**
 * Log a request with details
 * @param {string} message - Log message
 * @param {Object} context - Request context (userId, endpoint, method, etc.)
 */
logger.logInfo = function(message, context = {}) {
    this.info(message, context);
};

/**
 * Log a warning
 * @param {string} message - Warning message
 * @param {Object} context - Additional context
 */
logger.logWarn = function(message, context = {}) {
    this.warn(message, context);
};

/**
 * Log debug information
 * @param {string} message - Debug message
 * @param {Object} context - Additional context
 */
logger.logDebug = function(message, context = {}) {
    this.debug(message, context);
};

module.exports = logger;
