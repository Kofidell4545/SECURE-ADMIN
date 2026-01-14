/*
 * Patient Fabric Service
 * Handles patient-related blockchain operations
 */

const fabricGateway = require('./gateway.service');
const logger = require('../../utils/logger');

class PatientFabricService {
    /**
     * Create patient record on blockchain
     */
    async createPatient(patientData) {
        try {
            if (!fabricGateway.isAvailable()) {
                logger.warn('Blockchain unavailable - patient not stored on chain');
                return null;
            }

            const result = await fabricGateway.submitTransaction(
                'PatientContract',
                'createPatient',
                patientData.id.toString(),
                JSON.stringify({
                    npi: patientData.npi,
                    name: patientData.name,
                    bloodType: patientData.bloodType
                })
            );

            logger.info(`Patient ${patientData.id} created on blockchain`);
            return result;
        } catch (error) {
            logger.error('Failed to create patient on blockchain:', error);
            // Don't throw - allow operation to continue
            return null;
        }
    }

    /**
     * Get patient from blockchain
     */
    async getPatient(patientId) {
        try {
            if (!fabricGateway.isAvailable()) {
                return null;
            }

            const result = await fabricGateway.evaluateTransaction(
                'PatientContract',
                'getPatient',
                patientId.toString()
            );

            return result;
        } catch (error) {
            logger.error('Failed to get patient from blockchain:', error);
            return null;
        }
    }

    /**
     * Update patient on blockchain
     */
    async updatePatient(patientId, updates) {
        try {
            if (!fabricGateway.isAvailable()) {
                logger.warn('Blockchain unavailable - patient update not recorded on chain');
                return null;
            }

            const result = await fabricGateway.submitTransaction(
                'PatientContract',
                'updatePatient',
                patientId.toString(),
                JSON.stringify(updates)
            );

            logger.info(`Patient ${patientId} updated on blockchain`);
            return result;
        } catch (error) {
            logger.error('Failed to update patient on blockchain:', error);
            return null;
        }
    }

    /**
     * Get patient history from blockchain
     */
    async getPatientHistory(patientId) {
        try {
            if (!fabricGateway.isAvailable()) {
                return [];
            }

            const result = await fabricGateway.evaluateTransaction(
                'PatientContract',
                'getPatientHistory',
                patientId.toString()
            );

            return result || [];
        } catch (error) {
            logger.error('Failed to get patient history:', error);
            return [];
        }
    }

    /**
     * Grant access to patient record
     */
    async grantAccess(patientId, userId, permissions) {
        try {
            if (!fabricGateway.isAvailable()) {
                return null;
            }

            const result = await fabricGateway.submitTransaction(
                'PatientContract',
                'grantAccess',
                patientId.toString(),
                userId.toString(),
                JSON.stringify(permissions)
            );

            logger.info(`Access granted for patient ${patientId} to user ${userId}`);
            return result;
        } catch (error) {
            logger.error('Failed to grant access:', error);
            return null;
        }
    }

    /**
     * Revoke access to patient record
     */
    async revokeAccess(patientId, userId) {
        try {
            if (!fabricGateway.isAvailable()) {
                return null;
            }

            const result = await fabricGateway.submitTransaction(
                'PatientContract',
                'revokeAccess',
                patientId.toString(),
                userId.toString()
            );

            logger.info(`Access revoked for patient ${patientId} from user ${userId}`);
            return result;
        } catch (error) {
            logger.error('Failed to revoke access:', error);
            return null;
        }
    }
}

module.exports = new PatientFabricService();
