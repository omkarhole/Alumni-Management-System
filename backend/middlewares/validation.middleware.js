/**
 * Input Validation Middleware using Joi
 * 
 * Usage:
 *   const { validateRequest } = require('../middlewares/validation.middleware');
 *   const schema = Joi.object({
 *       name: Joi.string().required(),
 *       email: Joi.string().email().required(),
 *   });
 *   router.post('/endpoint', validateRequest(schema), controllerFunction);
 */

const Joi = require('joi');
const AppError = require('../utils/AppError');

/**
 * Validate request body against a Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
function validateRequest(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            // Format validation errors
            const details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                type: detail.type,
            }));

            const err = AppError.validation('Input validation failed', details);
            return next(err);
        }

        // Replace req.body with validated data
        req.body = value;
        next();
    };
}

/**
 * Validate request query parameters
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
function validateQuery(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                type: detail.type,
            }));

            const err = AppError.validation('Query validation failed', details);
            return next(err);
        }

        req.query = value;
        next();
    };
}

/**
 * Validate request parameters
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware
 */
function validateParams(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                type: detail.type,
            }));

            const err = AppError.validation('Parameter validation failed', details);
            return next(err);
        }

        req.params = value;
        next();
    };
}

module.exports = {
    validateRequest,
    validateQuery,
    validateParams,
};
