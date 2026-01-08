const Transfer = require('../models/Transfer');
const Patient = require('../models/Patient');
const logger = require('../utils/logger');

// Get all transfers
exports.getAllTransfers = async (req, res) => {
    try {
        const { status, patientId } = req.query;

        let where = {};

        // Apply status filter
        if (status && status !== 'All') {
            where.status = status;
        }

        // Apply patient filter
        if (patientId) {
            where.patientId = patientId;
        }

        const transfers = await Transfer.findAll({
            where,
            order: [['requestedAt', 'DESC']]
        });

        res.json({
            success: true,
            count: transfers.length,
            data: transfers
        });
    } catch (error) {
        logger.error('Get transfers error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single transfer
exports.getTransfer = async (req, res) => {
    try {
        const transfer = await Transfer.findByPk(req.params.id);

        if (!transfer) {
            return res.status(404).json({ error: 'Transfer not found' });
        }

        res.json({
            success: true,
            data: transfer
        });
    } catch (error) {
        logger.error('Get transfer error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create transfer
exports.createTransfer = async (req, res) => {
    try {
        // Verify patient exists
        const patient = await Patient.findByPk(req.body.patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const transfer = await Transfer.create(req.body);

        logger.info(`Transfer created: ${transfer.type} for patient ${patient.name}`);

        res.status(201).json({
            success: true,
            data: transfer
        });
    } catch (error) {
        logger.error('Create transfer error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update transfer status (approve/deny)
exports.updateTransferStatus = async (req, res) => {
    try {
        const { status, reviewedBy } = req.body;

        const transfer = await Transfer.findByPk(req.params.id);

        if (!transfer) {
            return res.status(404).json({ error: 'Transfer not found' });
        }

        await transfer.update({
            status,
            reviewedBy,
            reviewedAt: new Date()
        });

        logger.info(`Transfer ${status.toLowerCase()}: ${transfer.type} by ${reviewedBy}`);

        res.json({
            success: true,
            data: transfer
        });
    } catch (error) {
        logger.error('Update transfer status error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete transfer
exports.deleteTransfer = async (req, res) => {
    try {
        const transfer = await Transfer.findByPk(req.params.id);

        if (!transfer) {
            return res.status(404).json({ error: 'Transfer not found' });
        }

        await transfer.destroy();

        logger.info(`Transfer deleted: ${transfer.type}`);

        res.json({
            success: true,
            message: 'Transfer deleted successfully'
        });
    } catch (error) {
        logger.error('Delete transfer error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
