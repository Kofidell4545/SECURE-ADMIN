const Patient = require('../models/Patient');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { patientFabric, accessLogFabric } = require('../services/fabric');

// Get all patients
exports.getAllPatients = async (req, res) => {
    try {
        const { search, status } = req.query;

        let where = {};

        // Apply search filter
        if (search) {
            where = {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${search}%` } },
                    { email: { [Op.iLike]: `%${search}%` } },
                    { npi: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        // Apply status filter
        if (status && status !== 'All') {
            where.status = status;
        }

        const patients = await Patient.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: patients.length,
            data: patients
        });
    } catch (error) {
        logger.error('Get patients error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single patient
exports.getPatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Log access on blockchain
        accessLogFabric.logAccess({
            userId: req.user?.id || 'system',
            action: 'VIEW_PATIENT',
            resourceType: 'patient',
            resourceId: patient.id
        }).catch(err => logger.warn('Failed to log access on blockchain:', err.message));

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        logger.error('Get patient error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create patient
exports.createPatient = async (req, res) => {
    try {
        // 1. Create in PostgreSQL (for fast queries)
        const patient = await Patient.create(req.body);

        logger.info(`Patient created: ${patient.name}`);

        // 2. Store immutable record on blockchain
        patientFabric.createPatient({
            id: patient.id,
            npi: patient.npi,
            name: patient.name,
            bloodType: patient.bloodType
        }).catch(err => logger.warn('Failed to create patient on blockchain:', err.message));

        // 3. Log access on blockchain
        accessLogFabric.logAccess({
            userId: req.user?.id || 'system',
            action: 'CREATE_PATIENT',
            resourceType: 'patient',
            resourceId: patient.id
        }).catch(err => logger.warn('Failed to log access on blockchain:', err.message));

        res.status(201).json({
            success: true,
            data: patient
        });
    } catch (error) {
        logger.error('Create patient error:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Patient with this NPI already exists' });
        }

        res.status(500).json({ error: 'Server error' });
    }
};

// Update patient
exports.updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        // 1. Update in PostgreSQL
        await patient.update(req.body);

        logger.info(`Patient updated: ${patient.name}`);

        // 2. Update on blockchain with history tracking
        patientFabric.updatePatient(patient.id, {
            name: patient.name,
            bloodType: patient.bloodType
        }).catch(err => logger.warn('Failed to update patient on blockchain:', err.message));

        // 3. Log access on blockchain
        accessLogFabric.logAccess({
            userId: req.user?.id || 'system',
            action: 'UPDATE_PATIENT',
            resourceType: 'patient',
            resourceId: patient.id
        }).catch(err => logger.warn('Failed to log access on blockchain:', err.message));

        res.json({
            success: true,
            data: patient
        });
    } catch (error) {
        logger.error('Update patient error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete patient
exports.deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        await patient.destroy();

        logger.info(`Patient deleted: ${patient.name}`);

        res.json({
            success: true,
            message: 'Patient deleted successfully'
        });
    } catch (error) {
        logger.error('Delete patient error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
