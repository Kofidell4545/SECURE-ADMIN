const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload, handleMulterError } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { createReport } = require('../validation/report.validation');

// All routes are protected
router.use(protect);

router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReport);
router.get('/:id/download', reportController.downloadReport);
router.post('/', upload.single('file'), validate(createReport), handleMulterError, reportController.createReport);
router.delete('/:id', reportController.deleteReport);

module.exports = router;
