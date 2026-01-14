const Joi = require('joi');

// Create report validation schema
const createReport = Joi.object({
    patientId: Joi.number().integer().positive().required().messages({
        'number.base': 'Patient ID must be a number',
        'number.positive': 'Patient ID must be positive',
        'any.required': 'Patient ID is required',
    }),
    title: Joi.string().min(3).max(200).required().messages({
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least 3 characters',
        'string.max': 'Title cannot exceed 200 characters',
    }),
    category: Joi.string().valid(
        'Clinical Reports',
        'Lab Results',
        'Imaging',
        'Prescriptions',
        'Discharge Summary',
        'Other'
    ).required().messages({
        'any.only': 'Invalid category',
        'any.required': 'Category is required',
    }),
    date: Joi.date().max('now').required().messages({
        'date.base': 'Invalid date format',
        'date.max': 'Date cannot be in the future',
        'any.required': 'Date is required',
    }),
    author: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Author is required',
        'string.min': 'Author must be at least 2 characters',
        'string.max': 'Author cannot exceed 100 characters',
    }),
    notes: Joi.string().max(1000).allow('', null).messages({
        'string.max': 'Notes cannot exceed 1000 characters',
    }),
});

module.exports = {
    createReport,
};
