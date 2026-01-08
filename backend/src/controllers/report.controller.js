const Report = require('../models/Report');
const Patient = require('../models/Patient');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

// Get all reports
exports.getAllReports = async (req, res) => {
    try {
        const { search, category, patientId } = req.query;

        let where = {};

        // Apply category filter
        if (category && category !== 'All') {
            where.category = category;
        }

        // Apply patient filter
        if (patientId) {
            where.patientId = patientId;
        }

        // Apply search filter
        if (search) {
            where.title = { [Op.iLike]: `%${search}%` };
        }

        const reports = await Report.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        logger.error('Get reports error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single report
exports.getReport = async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        logger.error('Get report error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create report
exports.createReport = async (req, res) => {
    try {
        // Verify patient exists
        const patient = await Patient.findByPk(req.body.patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const report = await Report.create(req.body);

        logger.info(`Report created: ${report.title} for patient ${patient.name}`);

        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        logger.error('Create report error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete report
exports.deleteReport = async (req, res) => {
    try {
        const report = await Report.findByPk(req.params.id);

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        await report.destroy();

        logger.info(`Report deleted: ${report.title}`);

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        logger.error('Delete report error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
