/*
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Transfer Contract - Manages patient transfer requests
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class TransferContract extends Contract {

    constructor() {
        super('TransferContract');
    }

    /**
     * Create a transfer request
     */
    async createTransferRequest(ctx, transferId, transferData) {
        const transfer = JSON.parse(transferData);
        const txId = ctx.stub.getTxID();
        const timestamp = ctx.stub.getTxTimestamp();

        const transferRecord = {
            docType: 'transfer',
            transferId,
            patientId: transfer.patientId,
            fromFacility: transfer.fromFacility,
            toFacility: transfer.toFacility,
            reason: transfer.reason,
            urgency: transfer.urgency,
            status: 'Pending',
            requestedBy: transfer.requestedBy,
            createdAt: new Date(timestamp.seconds.low * 1000).toISOString(),
            txId
        };

        await ctx.stub.putState(transferId, Buffer.from(JSON.stringify(transferRecord)));
        return JSON.stringify(transferRecord);
    }

    /**
     * Approve transfer
     */
    async approveTransfer(ctx, transferId, approver) {
        const transferAsBytes = await ctx.stub.getState(transferId);
        if (!transferAsBytes || transferAsBytes.length === 0) {
            throw new Error(`Transfer ${transferId} does not exist`);
        }

        const transfer = JSON.parse(transferAsBytes.toString());
        transfer.status = 'Approved';
        transfer.reviewedBy = approver;
        transfer.reviewedAt = new Date().toISOString();

        await ctx.stub.putState(transferId, Buffer.from(JSON.stringify(transfer)));
        return JSON.stringify(transfer);
    }

    /**
     * Deny transfer
     */
    async denyTransfer(ctx, transferId, reason) {
        const transferAsBytes = await ctx.stub.getState(transferId);
        if (!transferAsBytes || transferAsBytes.length === 0) {
            throw new Error(`Transfer ${transferId} does not exist`);
        }

        const transfer = JSON.parse(transferAsBytes.toString());
        transfer.status = 'Denied';
        transfer.denialReason = reason;
        transfer.reviewedAt = new Date().toISOString();

        await ctx.stub.putState(transferId, Buffer.from(JSON.stringify(transfer)));
        return JSON.stringify(transfer);
    }
}

module.exports = TransferContract;
