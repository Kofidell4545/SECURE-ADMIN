const Report = require('../models/Report');
const Patient = require('../models/Patient');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

// Get all reports
exports.getAllReports = async (req, res, next) => {
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
        next(error);
    }
};

// Get single report
exports.getReport = async (req, res, next) => {
    try {
        const report = await Report.findByPk(req.params.id);

        if (!report) {
            return next(new AppError('Report not found', 404));
        }

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        logger.error('Get report error:', error);
        next(error);
    }
};

// Create report
exports.createReport = async (req, res, next) => {
    try {
        // Verify patient exists
        const patient = await Patient.findByPk(req.body.patientId);
        if (!patient) {
            return next(new AppError('Patient not found', 404));
        }

        const report = await Report.create(req.body);

        logger.info(`Report created: ${report.title} for patient ${patient.name}`);

        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        logger.error('Create report error:', error);
        next(error);
    }
};

// Delete report
exports.deleteReport = async (req, res, next) => {
    try {
        const report = await Report.findByPk(req.params.id);

        if (!report) {
            return next(new AppError('Report not found', 404));
        }

        await report.destroy();

        logger.info(`Report deleted: ${report.title}`);

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        logger.error('Delete report error:', error);
        next(error);
    }
};
