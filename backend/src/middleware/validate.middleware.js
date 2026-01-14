const AppError = require('../utils/AppError');

// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true, // Remove unknown fields
        });

        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(', ');
            return next(new AppError(errorMessage, 400));
        }

        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};

module.exports = validate;
