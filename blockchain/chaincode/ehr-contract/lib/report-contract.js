/*
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Report Contract - Manages medical reports with file integrity verification
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class ReportContract extends Contract {

    constructor() {
        super('ReportContract');
    }

    /**
     * Create a new report record
     * @param {Context} ctx - Transaction context
     * @param {string} reportId - Unique report identifier
     * @param {string} reportData - JSON string of report data
     */
    async createReport(ctx, reportId, reportData) {
        console.info('============= START : Create Report ===========');

        const report = JSON.parse(reportData);
        const txId = ctx.stub.getTxID();
        const timestamp = ctx.stub.getTxTimestamp();
        const clientIdentity = ctx.clientIdentity;

        const reportRecord = {
            docType: 'report',
            reportId: reportId,
            patientId: report.patientId,
            title: report.title,
            category: report.category,
            date: report.date,
            author: report.author,
            fileHash: report.fileHash || null, // SHA-256 hash of file
            createdBy: clientIdentity.getID(),
            createdAt: new Date(timestamp.seconds.low * 1000).toISOString(),
            txId: txId
        };

        await ctx.stub.putState(reportId, Buffer.from(JSON.stringify(reportRecord)));

        console.info('============= END : Create Report ===========');
        return JSON.stringify(reportRecord);
    }

    /**
     * Get a report record
     * @param {Context} ctx - Transaction context
     * @param {string} reportId - Report identifier
     */
    async getReport(ctx, reportId) {
        const reportAsBytes = await ctx.stub.getState(reportId);

        if (!reportAsBytes || reportAsBytes.length === 0) {
            throw new Error(`Report ${reportId} does not exist`);
        }

        return reportAsBytes.toString();
    }

    /**
     * Add or update file hash for integrity verification
     * @param {Context} ctx - Transaction context
     * @param {string} reportId - Report identifier
     * @param {string} fileHash - SHA-256 hash of the file
     */
    async addReportHash(ctx, reportId, fileHash) {
        console.info('============= START : Add Report Hash ===========');

        const reportAsBytes = await ctx.stub.getState(reportId);
        if (!reportAsBytes || reportAsBytes.length === 0) {
            throw new Error(`Report ${reportId} does not exist`);
        }

        const report = JSON.parse(reportAsBytes.toString());
        report.fileHash = fileHash;
        report.hashUpdatedAt = new Date().toISOString();

        await ctx.stub.putState(reportId, Buffer.from(JSON.stringify(report)));

        console.info('============= END : Add Report Hash ===========');
        return JSON.stringify({ success: true, fileHash });
    }

    /**
     * Verify file integrity
     * @param {Context} ctx - Transaction context
     * @param {string} reportId - Report identifier
     * @param {string} fileHash - Hash to verify against
     */
    async verifyReportIntegrity(ctx, reportId, fileHash) {
        const reportAsBytes = await ctx.stub.getState(reportId);
        if (!reportAsBytes || reportAsBytes.length === 0) {
            throw new Error(`Report ${reportId} does not exist`);
        }

        const report = JSON.parse(reportAsBytes.toString());
        const isValid = report.fileHash === fileHash;

        return JSON.stringify({
            reportId,
            isValid,
            storedHash: report.fileHash,
            providedHash: fileHash
        });
    }

    /**
     * Get all reports for a patient
     * @param {Context} ctx - Transaction context
     * @param {string} patientId - Patient identifier
     */
    async getReportsByPatient(ctx, patientId) {
        const query = {
            selector: {
                docType: 'report',
                patientId: patientId
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = [];

        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            results.push(JSON.parse(strValue));
            result = await iterator.next();
        }

        await iterator.close();
        return JSON.stringify(results);
    }
}

module.exports = ReportContract;
