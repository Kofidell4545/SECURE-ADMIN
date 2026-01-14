/*
 * Audit Trail Controller
 * Provides endpoints for accessing blockchain audit trails
 */

const { accessLogFabric, patientFabric } = require('../services/fabric');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

/**
 * Get audit trail for a specific resource
 */
exports.getAuditTrail = async (req, res, next) => {
    try {
        const { resourceId } = req.params;

        const auditTrail = await accessLogFabric.getAuditTrail(resourceId);

        res.json({
            success: true,
            count: auditTrail.length,
            data: auditTrail
        });
    } catch (error) {
        logger.error('Get audit trail error:', error);
        next(error);
    }
};

/**
 * Get patient history from blockchain
 */
exports.getPatientHistory = async (req, res, next) => {
    try {
        const { patientId } = req.params;

        const history = await patientFabric.getPatientHistory(patientId);

        res.json({
            success: true,
            count: history.length,
            data: history
        });
    } catch (error) {
        logger.error('Get patient history error:', error);
        next(error);
    }
};

/**
 * Get blockchain status
 */
exports.getBlockchainStatus = async (req, res, next) => {
    try {
        const { fabricGateway } = require('../services/fabric');

        res.json({
            success: true,
            data: {
                connected: fabricGateway.isAvailable(),
                channel: fabricGateway.channelName || 'ehr-channel',
                status: fabricGateway.isAvailable() ? 'online' : 'offline'
            }
        });
    } catch (error) {
        logger.error('Get blockchain status error:', error);
        next(error);
    }
};

module.exports = exports;
