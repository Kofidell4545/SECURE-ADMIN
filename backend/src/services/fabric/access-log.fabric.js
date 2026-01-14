/*
 * Access Log Fabric Service
 * Handles immutable audit trail logging on blockchain
 */

const fabricGateway = require('./gateway.service');
const logger = require('../../utils/logger');

class AccessLogFabricService {
    /**
     * Log an access event to blockchain
     */
    async logAccess(accessData) {
        try {
            if (!fabricGateway.isAvailable()) {
                logger.warn('Blockchain unavailable - access not logged on chain');
                return null;
            }

            const result = await fabricGateway.submitTransaction(
                'AccessLogContract',
                'logAccess',
                JSON.stringify({
                    userId: accessData.userId,
                    action: accessData.action,
                    resourceType: accessData.resourceType,
                    resourceId: accessData.resourceId
                })
            );

            logger.info(`Access logged: ${accessData.action} on ${accessData.resourceType}:${accessData.resourceId}`);
            return result;
        } catch (error) {
            logger.error('Failed to log access on blockchain:', error);
            return null;
        }
    }

    /**
     * Get audit trail for a resource
     */
    async getAuditTrail(resourceId) {
        try {
            if (!fabricGateway.isAvailable()) {
                return [];
            }

            const result = await fabricGateway.evaluateTransaction(
                'AccessLogContract',
                'getAuditTrail',
                resourceId.toString()
            );

            return result || [];
        } catch (error) {
            logger.error('Failed to get audit trail:', error);
            return [];
        }
    }
}

module.exports = new AccessLogFabricService();
