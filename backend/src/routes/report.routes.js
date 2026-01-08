const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

router.get('/', reportController.getAllReports);
router.get('/:id', reportController.getReport);
router.post('/', reportController.createReport);
router.delete('/:id', reportController.deleteReport);

module.exports = router;
