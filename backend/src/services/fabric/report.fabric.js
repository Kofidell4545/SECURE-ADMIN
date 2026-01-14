/*
 * Report Fabric Service
 * Handles report-related blockchain operations with file integrity
 */

const fabricGateway = require('./gateway.service');
const crypto = require('crypto');
const fs = require('fs');
const logger = require('../../utils/logger');

class ReportFabricService {
    /**
     * Calculate SHA-256 hash of a file
     */
    calculateFileHash(filePath) {
        try {
            const fileBuffer = fs.readFileSync(filePath);
            const hashSum = crypto.createHash('sha256');
            hashSum.update(fileBuffer);
            return hashSum.digest('hex');
        } catch (error) {
            logger.error('Failed to calculate file hash:', error);
            return null;
        }
    }

    /**
     * Create report record on blockchain
     */
    async createReport(reportData, filePath = null) {
        try {
            if (!fabricGateway.isAvailable()) {
                logger.warn('Blockchain unavailable - report not stored on chain');
                return null;
            }

            // Calculate file hash if file exists
            let fileHash = null;
            if (filePath && fs.existsSync(filePath)) {
                fileHash = this.calculateFileHash(filePath);
            }

            const result = await fabricGateway.submitTransaction(
                'ReportContract',
                'createReport',
                reportData.id.toString(),
                JSON.stringify({
                    patientId: reportData.patientId,
                    title: reportData.title,
                    category: reportData.category,
                    date: reportData.date,
                    author: reportData.author,
                    fileHash: fileHash
                })
            );

            logger.info(`Report ${reportData.id} created on blockchain${fileHash ? ' with file hash' : ''}`);
            return result;
        } catch (error) {
            logger.error('Failed to create report on blockchain:', error);
            return null;
        }
    }

    /**
     * Get report from blockchain
     */
    async getReport(reportId) {
        try {
            if (!fabricGateway.isAvailable()) {
                return null;
            }

            const result = await fabricGateway.evaluateTransaction(
                'ReportContract',
                'getReport',
                reportId.toString()
            );

            return result;
        } catch (error) {
            logger.error('Failed to get report from blockchain:', error);
            return null;
        }
    }

    /**
     * Add or update file hash for a report
     */
    async addReportHash(reportId, filePath) {
        try {
            if (!fabricGateway.isAvailable()) {
                return null;
            }

            const fileHash = this.calculateFileHash(filePath);
            if (!fileHash) {
                return null;
            }

            const result = await fabricGateway.submitTransaction(
                'ReportContract',
                'addReportHash',
                reportId.toString(),
                fileHash
            );

            logger.info(`File hash added for report ${reportId}`);
            return result;
        } catch (error) {
            logger.error('Failed to add report hash:', error);
            return null;
        }
    }

    /**
     * Verify file integrity against blockchain
     */
    async verifyFileIntegrity(reportId, filePath) {
        try {
            if (!fabricGateway.isAvailable()) {
                return { verified: false, reason: 'Blockchain unavailable' };
            }

            const currentHash = this.calculateFileHash(filePath);
            if (!currentHash) {
                return { verified: false, reason: 'Cannot calculate file hash' };
            }

            const result = await fabricGateway.evaluateTransaction(
                'ReportContract',
                'verifyReportIntegrity',
                reportId.toString(),
                currentHash
            );

            if (result && result.isValid) {
                logger.info(`File integrity verified for report ${reportId}`);
                return { verified: true, hash: currentHash };
            } else {
                logger.warn(`File integrity check FAILED for report ${reportId}`);
                return {
                    verified: false,
                    reason: 'File has been modified',
                    storedHash: result?.storedHash,
                    currentHash: currentHash
                };
            }
        } catch (error) {
            logger.error('Failed to verify file integrity:', error);
            return { verified: false, reason: error.message };
        }
    }

    /**
     * Get all reports for a patient
     */
    async getReportsByPatient(patientId) {
        try {
            if (!fabricGateway.isAvailable()) {
                return [];
            }

            const result = await fabricGateway.evaluateTransaction(
                'ReportContract',
                'getReportsByPatient',
                patientId.toString()
            );

            return result || [];
        } catch (error) {
            logger.error('Failed to get reports by patient:', error);
            return [];
        }
    }
}

module.exports = new ReportFabricService();
