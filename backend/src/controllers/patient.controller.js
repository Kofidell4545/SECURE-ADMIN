const Patient = require('../models/Patient');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

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
        const patient = await Patient.create(req.body);

        logger.info(`Patient created: ${patient.name}`);

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

        await patient.update(req.body);

        logger.info(`Patient updated: ${patient.name}`);

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
