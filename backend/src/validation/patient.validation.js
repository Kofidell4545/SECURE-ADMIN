const Joi = require('joi');

// Create patient validation schema
const createPatient = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
    }),
    age: Joi.number().integer().min(0).max(150).required().messages({
        'number.base': 'Age must be a number',
        'number.min': 'Age cannot be negative',
        'number.max': 'Age cannot exceed 150',
        'any.required': 'Age is required',
    }),
    gender: Joi.string().valid('Male', 'Female', 'Other').required().messages({
        'any.only': 'Gender must be Male, Female, or Other',
        'any.required': 'Gender is required',
    }),
    bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').required().messages({
        'any.only': 'Invalid blood type',
        'any.required': 'Blood type is required',
    }),
    npi: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
        'string.length': 'NPI must be exactly 10 digits',
        'string.pattern.base': 'NPI must contain only numbers',
        'any.required': 'NPI is required',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
    }),
    phone: Joi.string().max(50).allow('', null).messages({
        'string.max': 'Phone number cannot exceed 50 characters',
    }),
    address: Joi.string().allow('', null),
    medicalHistory: Joi.string().allow('', null),
    allergies: Joi.array().items(Joi.string()).default([]),
    currentMedications: Joi.array().items(Joi.string()).default([]),
    status: Joi.string().valid('Active', 'Inactive').default('Active'),
});

// Update patient validation schema (all fields optional except ID)
const updatePatient = Joi.object({
    name: Joi.string().min(2).max(100).messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
    }),
    age: Joi.number().integer().min(0).max(150).messages({
        'number.base': 'Age must be a number',
        'number.min': 'Age cannot be negative',
        'number.max': 'Age cannot exceed 150',
    }),
    gender: Joi.string().valid('Male', 'Female', 'Other').messages({
        'any.only': 'Gender must be Male, Female, or Other',
    }),
    bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').messages({
        'any.only': 'Invalid blood type',
    }),
    npi: Joi.string().length(10).pattern(/^[0-9]+$/).messages({
        'string.length': 'NPI must be exactly 10 digits',
        'string.pattern.base': 'NPI must contain only numbers',
    }),
    email: Joi.string().email().messages({
        'string.email': 'Please provide a valid email address',
    }),
    phone: Joi.string().max(50).allow('', null),
    address: Joi.string().allow('', null),
    medicalHistory: Joi.string().allow('', null),
    allergies: Joi.array().items(Joi.string()),
    currentMedications: Joi.array().items(Joi.string()),
    status: Joi.string().valid('Active', 'Inactive'),
}).min(1); // At least one field must be provided

module.exports = {
    createPatient,
    updatePatient,
};
