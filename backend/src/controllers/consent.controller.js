/*
 * Consent Controller
 * Manages patient consent for data access
 */

const { consentFabric, accessLogFabric } = require('../services/fabric');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

/**
 * Grant consent for provider to access patient data
 */
exports.grantConsent = async (req, res, next) => {
    try {
        const { patientId, providerId, providerName, dataTypes, purpose, expiryDate } = req.body;

        // Validate required fields
        if (!patientId || !providerId || !dataTypes || !Array.isArray(dataTypes)) {
            return next(new AppError('Missing required fields', 400));
        }

        const consentData = {
            patientId,
            providerId,
            providerName,
            dataTypes,
            purpose,
            expiryDate
        };

        const result = await consentFabric.grantConsent(consentData);

        // Log the consent grant
        accessLogFabric.logAccess({
            userId: req.user?.id || 'system',
            action: 'GRANT_CONSENT',
            resourceType: 'consent',
            resourceId: `patient:${patientId}:provider:${providerId}`
        }).catch(err => logger.warn('Failed to log consent grant:', err.message));

        res.status(201).json({
            success: true,
            message: 'Consent granted successfully',
            data: result
        });
    } catch (error) {
        logger.error('Grant consent error:', error);
        next(error);
    }
};

/**
 * Revoke consent
 */
exports.revokeConsent = async (req, res, next) => {
    try {
        const { consentId } = req.params;
        const { reason } = req.body;

        const result = await consentFabric.revokeConsent(consentId, reason);

        // Log the consent revocation
        accessLogFabric.logAccess({
            userId: req.user?.id || 'system',
            action: 'REVOKE_CONSENT',
            resourceType: 'consent',
            resourceId: consentId
        }).catch(err => logger.warn('Failed to log consent revocation:', err.message));

        res.json({
            success: true,
            message: 'Consent revoked successfully',
            data: result
        });
    } catch (error) {
        logger.error('Revoke consent error:', error);
        next(error);
    }
};

/**
 * Check if provider has consent
 */
exports.checkConsent = async (req, res, next) => {
    try {
        const { patientId, providerId, dataType } = req.query;

        if (!patientId || !providerId || !dataType) {
            return next(new AppError('Missing required parameters', 400));
        }

        const result = await consentFabric.checkConsent(patientId, providerId, dataType);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Check consent error:', error);
        next(error);
    }
};

/**
 * Get consent history for a patient
 */
exports.getConsentHistory = async (req, res, next) => {
    try {
        const { patientId } = req.params;

        const history = await consentFabric.getConsentHistory(patientId);

        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        logger.error('Get consent history error:', error);
        next(error);
    }
};

/**
 * Get provider's active consents
 */
exports.getProviderConsents = async (req, res, next) => {
    try {
        const { providerId } = req.params;

        const consents = await consentFabric.getProviderConsents(providerId);

        res.json({
            success: true,
            count: consents.length,
            data: consents
        });
    } catch (error) {
        logger.error('Get provider consents error:', error);
        next(error);
    }
};

module.exports = exports;
