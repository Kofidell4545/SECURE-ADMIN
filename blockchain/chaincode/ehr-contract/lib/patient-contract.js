/*
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Patient Contract - Manages patient records on the blockchain
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class PatientContract extends Contract {

    constructor() {
        super('PatientContract');
    }

    /**
     * Initialize the ledger with sample data (optional)
     */
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        console.info('============= END : Initialize Ledger ===========');
    }

    /**
     * Create a new patient record on the blockchain
     * @param {Context} ctx - Transaction context
     * @param {string} patientId - Unique patient identifier
     * @param {string} patientData - JSON string of patient data
     */
    async createPatient(ctx, patientId, patientData) {
        console.info('============= START : Create Patient ===========');

        // Parse patient data
        const patient = JSON.parse(patientData);

        // Get transaction metadata
        const txId = ctx.stub.getTxID();
        const timestamp = ctx.stub.getTxTimestamp();
        const clientIdentity = ctx.clientIdentity;

        // Create patient record
        const patientRecord = {
            docType: 'patient',
            patientId: patientId,
            npi: patient.npi,
            name: patient.name,
            bloodType: patient.bloodType,
            createdBy: clientIdentity.getID(),
            createdAt: new Date(timestamp.seconds.low * 1000).toISOString(),
            updatedAt: new Date(timestamp.seconds.low * 1000).toISOString(),
            txId: txId,
            history: []
        };

        // Store on ledger
        await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patientRecord)));

        console.info('============= END : Create Patient ===========');
        return JSON.stringify(patientRecord);
    }

    /**
     * Read a patient record from the blockchain
     * @param {Context} ctx - Transaction context
     * @param {string} patientId - Patient identifier
     */
    async getPatient(ctx, patientId) {
        const patientAsBytes = await ctx.stub.getState(patientId);

        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`Patient ${patientId} does not exist`);
        }

        return patientAsBytes.toString();
    }

    /**
     * Update patient record
     * @param {Context} ctx - Transaction context
     * @param {string} patientId - Patient identifier
     * @param {string} updates - JSON string of updates
     */
    async updatePatient(ctx, patientId, updates) {
        console.info('============= START : Update Patient ===========');

        // Get existing patient
        const patientAsBytes = await ctx.stub.getState(patientId);
        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`Patient ${patientId} does not exist`);
        }

        const patient = JSON.parse(patientAsBytes.toString());
        const updateData = JSON.parse(updates);

        // Get transaction metadata
        const txId = ctx.stub.getTxID();
        const timestamp = ctx.stub.getTxTimestamp();
        const clientIdentity = ctx.clientIdentity;

        // Add current state to history
        patient.history.push({
            ...patient,
            modifiedBy: clientIdentity.getID(),
            modifiedAt: new Date(timestamp.seconds.low * 1000).toISOString(),
            txId: txId
        });

        // Apply updates
        Object.keys(updateData).forEach(key => {
            if (key !== 'patientId' && key !== 'history') {
                patient[key] = updateData[key];
            }
        });

        patient.updatedAt = new Date(timestamp.seconds.low * 1000).toISOString();
        patient.txId = txId;

        // Store updated record
        await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));

        console.info('============= END : Update Patient ===========');
        return JSON.stringify(patient);
    }

    /**
     * Get patient history (all modifications)
     * @param {Context} ctx - Transaction context
     * @param {string} patientId - Patient identifier
     */
    async getPatientHistory(ctx, patientId) {
        const iterator = await ctx.stub.getHistoryForKey(patientId);
        const history = [];

        let result = await iterator.next();
        while (!result.done) {
            const record = {
                txId: result.value.txId,
                timestamp: new Date(result.value.timestamp.seconds.low * 1000).toISOString(),
                isDelete: result.value.isDelete,
                value: result.value.value.toString('utf8')
            };
            history.push(record);
            result = await iterator.next();
        }

        await iterator.close();
        return JSON.stringify(history);
    }

    /**
     * Grant access to a patient record
     * @param {Context} ctx - Transaction context
     * @param {string} patientId - Patient identifier
     * @param {string} userId - User to grant access to
     * @param {string} permissions - JSON string of permissions
     */
    async grantAccess(ctx, patientId, userId, permissions) {
        console.info('============= START : Grant Access ===========');

        const patientAsBytes = await ctx.stub.getState(patientId);
        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`Patient ${patientId} does not exist`);
        }

        const patient = JSON.parse(patientAsBytes.toString());

        if (!patient.accessControl) {
            patient.accessControl = {};
        }

        patient.accessControl[userId] = JSON.parse(permissions);

        await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));

        console.info('============= END : Grant Access ===========');
        return JSON.stringify({ success: true, userId, permissions });
    }

    /**
     * Revoke access to a patient record
     * @param {Context} ctx - Transaction context
     * @param {string} patientId - Patient identifier
     * @param {string} userId - User to revoke access from
     */
    async revokeAccess(ctx, patientId, userId) {
        console.info('============= START : Revoke Access ===========');

        const patientAsBytes = await ctx.stub.getState(patientId);
        if (!patientAsBytes || patientAsBytes.length === 0) {
            throw new Error(`Patient ${patientId} does not exist`);
        }

        const patient = JSON.parse(patientAsBytes.toString());

        if (patient.accessControl && patient.accessControl[userId]) {
            delete patient.accessControl[userId];
        }

        await ctx.stub.putState(patientId, Buffer.from(JSON.stringify(patient)));

        console.info('============= END : Revoke Access ===========');
        return JSON.stringify({ success: true, userId });
    }

    /**
     * Query all patients (for admin/authorized users)
     * @param {Context} ctx - Transaction context
     */
    async queryAllPatients(ctx) {
        const startKey = '';
        const endKey = '';
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        let result = await iterator.next();

        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                if (record.docType === 'patient') {
                    allResults.push(record);
                }
            } catch (err) {
                console.log(err);
            }
            result = await iterator.next();
        }

        await iterator.close();
        return JSON.stringify(allResults);
    }
}

module.exports = PatientContract;
