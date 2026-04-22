/**
 * Validation Schemas for Common Endpoints
 * 
 * These schemas can be imported and used with validateRequest middleware
 * 
 * Usage:
 *   const { createUserSchema, updateUserSchema } = require('./validators');
 *   const { validateRequest } = require('../middlewares/validation.middleware');
 *   
 *   router.post('/users', validateRequest(createUserSchema), userController.createUser);
 */

const Joi = require('joi');

/**
 * MongoDB ObjectId validation
 */
const mongoId = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
        'string.pattern.base': 'Invalid ID format'
    });

// ==================== USER SCHEMAS ====================

const createUserSchema = Joi.object({
    name: Joi.string()
        .required()
        .trim()
        .min(2)
        .max(100)
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters',
        }),
    email: Joi.string()
        .required()
        .email()
        .lowercase()
        .messages({
            'string.email': 'Please provide a valid email',
        }),
    password: Joi.string()
        .required()
        .min(8)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/)
        .messages({
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.base': 'Password must contain letters, numbers, and special characters',
        }),
    type: Joi.string()
        .valid('admin', 'alumnus', 'student')
        .default('student'),
});

const updateUserSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100),
    email: Joi.string()
        .email()
        .lowercase(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]/),
    type: Joi.string()
        .valid('admin', 'alumnus', 'student'),
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

const userIdSchema = Joi.object({
    id: mongoId.required(),
});

// ==================== EVENT SCHEMAS ====================

const createEventSchema = Joi.object({
    title: Joi.string()
        .required()
        .trim()
        .min(3)
        .max(200),
    description: Joi.string()
        .required()
        .trim()
        .min(10)
        .max(2000),
    schedule: Joi.date()
        .required()
        .greater('now')
        .messages({
            'date.greater': 'Event date must be in the future',
        }),
    location: Joi.string()
        .trim()
        .max(500),
    maxParticipants: Joi.number()
        .integer()
        .min(1)
        .max(10000),
});

const updateEventSchema = Joi.object({
    title: Joi.string().trim().min(3).max(200),
    description: Joi.string().trim().min(10).max(2000),
    schedule: Joi.date().greater('now'),
    location: Joi.string().trim().max(500),
    maxParticipants: Joi.number().integer().min(1).max(10000),
}).min(1);

const eventIdSchema = Joi.object({
    id: mongoId.required(),
});

// ==================== PAGINATION SCHEMAS ====================

const paginationSchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),
    sort: Joi.string()
        .default('createdAt'),
});

// ==================== LOGIN SCHEMA ====================

const loginSchema = Joi.object({
    email: Joi.string()
        .required()
        .email()
        .lowercase(),
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required',
        }),
});

// ==================== COURSE SCHEMAS ====================

const createCourseSchema = Joi.object({
    course: Joi.string()
        .required()
        .trim()
        .min(2)
        .max(200),
    about: Joi.string()
        .trim()
        .max(1000),
});

const updateCourseSchema = Joi.object({
    course: Joi.string().trim().min(2).max(200),
    about: Joi.string().trim().max(1000),
}).min(1);

// ==================== FORUM SCHEMAS ====================

const createForumTopicSchema = Joi.object({
    title: Joi.string()
        .required()
        .trim()
        .min(5)
        .max(300),
    content: Joi.string()
        .required()
        .trim()
        .min(10)
        .max(5000),
});

const updateForumTopicSchema = Joi.object({
    title: Joi.string().trim().min(5).max(300),
    content: Joi.string().trim().min(10).max(5000),
}).min(1);

const addCommentSchema = Joi.object({
    comment: Joi.string()
        .required()
        .trim()
        .min(1)
        .max(2000),
});

// ==================== EXPORTS ====================

module.exports = {
    // User
    createUserSchema,
    updateUserSchema,
    userIdSchema,
    
    // Event
    createEventSchema,
    updateEventSchema,
    eventIdSchema,
    
    // Pagination
    paginationSchema,
    
    // Auth
    loginSchema,
    
    // Course
    createCourseSchema,
    updateCourseSchema,
    
    // Forum
    createForumTopicSchema,
    updateForumTopicSchema,
    addCommentSchema,
    
    // Utils
    mongoId,
};
