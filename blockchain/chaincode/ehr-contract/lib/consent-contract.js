/*
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Consent Contract - Patient-controlled access management
 * THE KILLER FEATURE for blockchain in healthcare
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class ConsentContract extends Contract {

    constructor() {
        super('ConsentContract');
    }

    /**
     * Grant consent for a provider to access patient data
     * @param {Context} ctx - Transaction context
     * @param {string} consentId - Unique consent identifier
     * @param {string} consentData - JSON string of consent details
     */
    async grantConsent(ctx, consentId, consentData) {
        console.info('============= START : Grant Consent ===========');

        const consent = JSON.parse(consentData);
        const txId = ctx.stub.getTxID();
        const timestamp = ctx.stub.getTxTimestamp();
        const clientIdentity = ctx.clientIdentity;

        // Validate required fields
        if (!consent.patientId || !consent.providerId || !consent.dataTypes) {
            throw new Error('Missing required consent fields');
        }

        const consentRecord = {
            docType: 'consent',
            consentId: consentId,
            patientId: consent.patientId,
            providerId: consent.providerId,
            providerName: consent.providerName || 'Unknown Provider',
            dataTypes: consent.dataTypes, // Array: ['medical_history', 'lab_results', 'prescriptions']
            purpose: consent.purpose || 'Medical Treatment',
            expiryDate: consent.expiryDate || null, // ISO date string or null for no expiry
            status: 'active',
            grantedBy: clientIdentity.getID(),
            grantedAt: new Date(timestamp.seconds.low * 1000).toISOString(),
            revokedAt: null,
            revokedBy: null,
            txId: txId
        };

        await ctx.stub.putState(consentId, Buffer.from(JSON.stringify(consentRecord)));

        console.info('============= END : Grant Consent ===========');
        return JSON.stringify(consentRecord);
    }

    /**
     * Revoke consent
     * @param {Context} ctx - Transaction context
     * @param {string} consentId - Consent identifier
     * @param {string} reason - Reason for revocation
     */
    async revokeConsent(ctx, consentId, reason) {
        console.info('============= START : Revoke Consent ===========');

        const consentAsBytes = await ctx.stub.getState(consentId);
        if (!consentAsBytes || consentAsBytes.length === 0) {
            throw new Error(`Consent ${consentId} does not exist`);
        }

        const consent = JSON.parse(consentAsBytes.toString());

        if (consent.status === 'revoked') {
            throw new Error(`Consent ${consentId} is already revoked`);
        }

        const timestamp = ctx.stub.getTxTimestamp();
        const clientIdentity = ctx.clientIdentity;

        consent.status = 'revoked';
        consent.revokedAt = new Date(timestamp.seconds.low * 1000).toISOString();
        consent.revokedBy = clientIdentity.getID();
        consent.revocationReason = reason || 'No reason provided';

        await ctx.stub.putState(consentId, Buffer.from(JSON.stringify(consent)));

        console.info('============= END : Revoke Consent ===========');
        return JSON.stringify(consent);
    }

    /**
     * Check if consent exists and is valid
     * @param {Context} ctx - Transaction context
     * @param {string} patientId - Patient identifier
     * @param {string} providerId - Provider identifier
     * @param {string} dataType - Type of data being accessed
     */
    async checkConsent(ctx, patientId, providerId, dataType) {
        console.info('============= START : Check Consent ===========');

        // Query for active consents
        const query = {
            selector: {
                docType: 'consent',
                patientId: patientId,
                providerId: providerId,
                status: 'active',
                dataTypes: {
                    $elemMatch: {
                        $eq: dataType
                    }
                }
            }
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = [];

        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            const consent = JSON.parse(strValue);

            // Check if consent has expired
            if (consent.expiryDate) {
                const expiryDate = new Date(consent.expiryDate);
                const now = new Date();
                if (now > expiryDate) {
                    // Mark as expired
                    consent.status = 'expired';
                    await ctx.stub.putState(consent.consentId, Buffer.from(JSON.stringify(consent)));
                } else {
                    results.push(consent);
                }
            } else {
                results.push(consent);
            }

            result = await iterator.next();
        }

        await iterator.close();

        console.info('============= END : Check Consent ===========');
        return JSON.stringify({
            hasConsent: results.length > 0,
            consents: results
        });
    }

    /**
     * Get consent history for a patient
     * @param {Context} ctx - Transaction context
     * @param {string} patientId - Patient identifier
     */
    async getConsentHistory(ctx, patientId) {
        console.info('============= START : Get Consent History ===========');

        const query = {
            selector: {
                docType: 'consent',
                patientId: patientId
            },
            sort: [{ grantedAt: 'desc' }]
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

        console.info('============= END : Get Consent History ===========');
        return JSON.stringify(results);
    }

    /**
     * Get all active consents for a provider
     * @param {Context} ctx - Transaction context
     * @param {string} providerId - Provider identifier
     */
    async getProviderConsents(ctx, providerId) {
        console.info('============= START : Get Provider Consents ===========');

        const query = {
            selector: {
                docType: 'consent',
                providerId: providerId,
                status: 'active'
            },
            sort: [{ grantedAt: 'desc' }]
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

        console.info('============= END : Get Provider Consents ===========');
        return JSON.stringify(results);
    }

    /**
     * Get a specific consent record
     * @param {Context} ctx - Transaction context
     * @param {string} consentId - Consent identifier
     */
    async getConsent(ctx, consentId) {
        const consentAsBytes = await ctx.stub.getState(consentId);

        if (!consentAsBytes || consentAsBytes.length === 0) {
            throw new Error(`Consent ${consentId} does not exist`);
        }

        return consentAsBytes.toString();
    }

    /**
     * Update consent expiry date
     * @param {Context} ctx - Transaction context
     * @param {string} consentId - Consent identifier
     * @param {string} newExpiryDate - New expiry date (ISO string)
     */
    async updateConsentExpiry(ctx, consentId, newExpiryDate) {
        console.info('============= START : Update Consent Expiry ===========');

        const consentAsBytes = await ctx.stub.getState(consentId);
        if (!consentAsBytes || consentAsBytes.length === 0) {
            throw new Error(`Consent ${consentId} does not exist`);
        }

        const consent = JSON.parse(consentAsBytes.toString());

        if (consent.status !== 'active') {
            throw new Error(`Cannot update expired or revoked consent`);
        }

        consent.expiryDate = newExpiryDate;
        consent.lastModified = new Date().toISOString();

        await ctx.stub.putState(consentId, Buffer.from(JSON.stringify(consent)));

        console.info('============= END : Update Consent Expiry ===========');
        return JSON.stringify(consent);
    }
}

module.exports = ConsentContract;
