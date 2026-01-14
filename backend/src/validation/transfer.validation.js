const Joi = require('joi');

// Create transfer validation schema
const createTransfer = Joi.object({
    patientId: Joi.number().integer().positive().required().messages({
        'number.base': 'Patient ID must be a number',
        'number.positive': 'Patient ID must be positive',
        'any.required': 'Patient ID is required',
    }),
    fromFacility: Joi.string().min(2).max(200).required().messages({
        'string.empty': 'From facility is required',
        'string.min': 'From facility must be at least 2 characters',
        'string.max': 'From facility cannot exceed 200 characters',
    }),
    toFacility: Joi.string().min(2).max(200).required().messages({
        'string.empty': 'To facility is required',
        'string.min': 'To facility must be at least 2 characters',
        'string.max': 'To facility cannot exceed 200 characters',
    }),
    reason: Joi.string().min(10).max(500).required().messages({
        'string.empty': 'Reason is required',
        'string.min': 'Reason must be at least 10 characters',
        'string.max': 'Reason cannot exceed 500 characters',
    }),
    urgency: Joi.string().valid('Low', 'Medium', 'High', 'Critical').required().messages({
        'any.only': 'Urgency must be Low, Medium, High, or Critical',
        'any.required': 'Urgency is required',
    }),
    requestedBy: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Requested by is required',
        'string.min': 'Requested by must be at least 2 characters',
        'string.max': 'Requested by cannot exceed 100 characters',
    }),
    notes: Joi.string().max(1000).allow('', null).messages({
        'string.max': 'Notes cannot exceed 1000 characters',
    }),
});

// Update transfer status validation schema
const updateTransferStatus = Joi.object({
    status: Joi.string().valid('Pending', 'Approved', 'Denied', 'Completed').required().messages({
        'any.only': 'Status must be Pending, Approved, Denied, or Completed',
        'any.required': 'Status is required',
    }),
    reviewedBy: Joi.string().min(2).max(100).required().messages({
        'string.empty': 'Reviewed by is required',
        'string.min': 'Reviewed by must be at least 2 characters',
        'string.max': 'Reviewed by cannot exceed 100 characters',
    }),
});

module.exports = {
    createTransfer,
    updateTransferStatus,
};
