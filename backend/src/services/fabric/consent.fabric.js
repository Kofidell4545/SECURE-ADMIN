/*
 * Consent Fabric Service
 * Handles patient consent management on blockchain
 */

const fabricGateway = require('./gateway.service');
const logger = require('../../utils/logger');

class ConsentFabricService {
    /**
     * Grant consent for provider to access patient data
     */
    async grantConsent(consentData) {
        try {
            if (!fabricGateway.isAvailable()) {
                logger.warn('Blockchain unavailable - consent not stored on chain');
                return null;
            }

            const consentId = `CONSENT_${consentData.patientId}_${consentData.providerId}_${Date.now()}`;

            const result = await fabricGateway.submitTransaction(
                'ConsentContract',
                'grantConsent',
                consentId,
                JSON.stringify({
                    patientId: consentData.patientId,
                    providerId: consentData.providerId,
                    providerName: consentData.providerName,
                    dataTypes: consentData.dataTypes,
                    purpose: consentData.purpose,
                    expiryDate: consentData.expiryDate
                })
            );

            logger.info(`Consent granted: Patient ${consentData.patientId} to Provider ${consentData.providerId}`);
            return result;
        } catch (error) {
            logger.error('Failed to grant consent on blockchain:', error);
            return null;
        }
    }

    /**
     * Revoke consent
     */
    async revokeConsent(consentId, reason) {
        try {
            if (!fabricGateway.isAvailable()) {
                logger.warn('Blockchain unavailable - consent revocation not recorded');
                return null;
            }

            const result = await fabricGateway.submitTransaction(
                'ConsentContract',
                'revokeConsent',
                consentId,
                reason || 'Revoked by patient'
            );

            logger.info(`Consent revoked: ${consentId}`);
            return result;
        } catch (error) {
            logger.error('Failed to revoke consent on blockchain:', error);
            return null;
        }
    }

    /**
     * Check if provider has consent to access patient data
     */
    async checkConsent(patientId, providerId, dataType) {
        try {
            if (!fabricGateway.isAvailable()) {
                return { hasConsent: false, reason: 'Blockchain unavailable' };
            }

            const result = await fabricGateway.evaluateTransaction(
                'ConsentContract',
                'checkConsent',
                patientId.toString(),
                providerId.toString(),
                dataType
            );

            return result;
        } catch (error) {
            logger.error('Failed to check consent:', error);
            return { hasConsent: false, reason: error.message };
        }
    }

    /**
     * Get consent history for a patient
     */
    async getConsentHistory(patientId) {
        try {
            if (!fabricGateway.isAvailable()) {
                return [];
            }

            const result = await fabricGateway.evaluateTransaction(
                'ConsentContract',
                'getConsentHistory',
                patientId.toString()
            );

            return result || [];
        } catch (error) {
            logger.error('Failed to get consent history:', error);
            return [];
        }
    }

    /**
     * Get all active consents for a provider
     */
    async getProviderConsents(providerId) {
        try {
            if (!fabricGateway.isAvailable()) {
                return [];
            }

            const result = await fabricGateway.evaluateTransaction(
                'ConsentContract',
                'getProviderConsents',
                providerId.toString()
            );

            return result || [];
        } catch (error) {
            logger.error('Failed to get provider consents:', error);
            return [];
        }
    }

    /**
     * Update consent expiry date
     */
    async updateConsentExpiry(consentId, newExpiryDate) {
        try {
            if (!fabricGateway.isAvailable()) {
                return null;
            }

            const result = await fabricGateway.submitTransaction(
                'ConsentContract',
                'updateConsentExpiry',
                consentId,
                newExpiryDate
            );

            logger.info(`Consent expiry updated: ${consentId}`);
            return result;
        } catch (error) {
            logger.error('Failed to update consent expiry:', error);
            return null;
        }
    }
}

module.exports = new ConsentFabricService();
