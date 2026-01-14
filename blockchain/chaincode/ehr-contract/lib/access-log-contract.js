/*
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Access Log Contract - Immutable audit trail for all data access
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AccessLogContract extends Contract {

    constructor() {
        super('AccessLogContract');
    }

    /**
     * Log an access event
     */
    async logAccess(ctx, logData) {
        const log = JSON.parse(logData);
        const txId = ctx.stub.getTxID();
        const timestamp = ctx.stub.getTxTimestamp();
        const clientIdentity = ctx.clientIdentity;

        const logId = `LOG_${txId}`;
        const accessLog = {
            docType: 'accessLog',
            logId,
            userId: log.userId || clientIdentity.getID(),
            action: log.action,
            resourceType: log.resourceType,
            resourceId: log.resourceId,
            timestamp: new Date(timestamp.seconds.low * 1000).toISOString(),
            txId
        };

        await ctx.stub.putState(logId, Buffer.from(JSON.stringify(accessLog)));
        return JSON.stringify(accessLog);
    }

    /**
     * Get audit trail for a resource
     */
    async getAuditTrail(ctx, resourceId) {
        const query = {
            selector: {
                docType: 'accessLog',
                resourceId: resourceId
            },
            sort: [{ timestamp: 'desc' }]
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

module.exports = AccessLogContract;
