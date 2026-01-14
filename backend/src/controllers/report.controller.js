const Report = require('../models/Report');
const Patient = require('../models/Patient');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

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

        // Prepare report data
        const reportData = { ...req.body };

        // Handle file upload if present
        if (req.file) {
            reportData.fileName = req.file.originalname;
            reportData.fileType = path.extname(req.file.originalname).substring(1);
            reportData.fileUrl = req.file.path;
            reportData.fileSize = req.file.size;
        }

        const report = await Report.create(reportData);

        logger.info(`Report created: ${report.title} for patient ${patient.name}`);

        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        logger.error('Create report error:', error);
        // Delete uploaded file if report creation fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
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

        // Delete associated file if exists
        if (report.fileUrl && fs.existsSync(report.fileUrl)) {
            fs.unlinkSync(report.fileUrl);
            logger.info(`Deleted file: ${report.fileUrl}`);
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

// Download report file
exports.downloadReport = async (req, res, next) => {
    try {
        const report = await Report.findByPk(req.params.id);

        if (!report) {
            return next(new AppError('Report not found', 404));
        }

        if (!report.fileUrl || !fs.existsSync(report.fileUrl)) {
            return next(new AppError('Report file not found', 404));
        }

        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Stream the file
        const fileStream = fs.createReadStream(report.fileUrl);
        fileStream.pipe(res);

        logger.info(`Report downloaded: ${report.title}`);
    } catch (error) {
        logger.error('Download report error:', error);
        next(error);
    }
};
