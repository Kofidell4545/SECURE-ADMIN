/*
 * Fabric Gateway Service
 * Manages connection to Hyperledger Fabric network
 */

const grpc = require('@grpc/grpc-js');
const { connect, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

class FabricGatewayService {
    constructor() {
        this.gateway = null;
        this.network = null;
        this.isConnected = false;
        this.channelName = 'ehr-channel';
    }

    /**
     * Initialize connection to Fabric network
     */
    async connect() {
        if (this.isConnected) {
            return;
        }

        try {
            logger.info('Connecting to Hyperledger Fabric network...');

            // For development, we'll use a simplified connection
            // In production, load actual crypto materials
            const peerEndpoint = process.env.FABRIC_PEER_ENDPOINT || 'localhost:7051';
            const peerHostAlias = process.env.FABRIC_PEER_HOST_ALIAS || 'peer0.hospital.ehr.com';

            // Create gRPC client
            const client = new grpc.Client(
                peerEndpoint,
                grpc.credentials.createInsecure() // Use TLS in production
            );

            // For now, create a mock identity
            // In production, load from wallet
            const identity = {
                mspId: 'HospitalMSP',
                credentials: Buffer.from('mock-cert')
            };

            const signer = signers.newPrivateKeySigner(
                crypto.generateKeyPairSync('ec', {
                    namedCurve: 'P-256'
                }).privateKey
            );

            // Connect to gateway
            this.gateway = connect({
                client,
                identity,
                signer,
                evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
                endorseOptions: () => ({ deadline: Date.now() + 15000 }),
                submitOptions: () => ({ deadline: Date.now() + 5000 }),
                commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
            });

            this.network = this.gateway.getNetwork(this.channelName);
            this.isConnected = true;

            logger.info('✅ Connected to Fabric network');
        } catch (error) {
            logger.error('Failed to connect to Fabric network:', error);
            // Don't throw - allow app to run without blockchain in development
            this.isConnected = false;
        }
    }

    /**
     * Get contract instance
     */
    getContract(contractName) {
        if (!this.isConnected || !this.network) {
            throw new Error('Not connected to Fabric network');
        }
        return this.network.getContract('ehr-contract', contractName);
    }

    /**
     * Submit transaction (writes to ledger)
     */
    async submitTransaction(contractName, functionName, ...args) {
        try {
            if (!this.isConnected) {
                logger.warn('Blockchain not connected - skipping transaction');
                return null;
            }

            const contract = this.getContract(contractName);
            const result = await contract.submitTransaction(functionName, ...args);
            return JSON.parse(result.toString());
        } catch (error) {
            logger.error(`Fabric transaction error (${contractName}.${functionName}):`, error);
            throw error;
        }
    }

    /**
     * Evaluate transaction (reads from ledger)
     */
    async evaluateTransaction(contractName, functionName, ...args) {
        try {
            if (!this.isConnected) {
                logger.warn('Blockchain not connected - skipping query');
                return null;
            }

            const contract = this.getContract(contractName);
            const result = await contract.evaluateTransaction(functionName, ...args);
            return JSON.parse(result.toString());
        } catch (error) {
            logger.error(`Fabric query error (${contractName}.${functionName}):`, error);
            throw error;
        }
    }

    /**
     * Disconnect from network
     */
    async disconnect() {
        if (this.gateway) {
            this.gateway.close();
            this.isConnected = false;
            logger.info('Disconnected from Fabric network');
        }
    }

    /**
     * Check if blockchain is available
     */
    isAvailable() {
        return this.isConnected;
    }
}

// Export singleton instance
const fabricGateway = new FabricGatewayService();

module.exports = fabricGateway;
