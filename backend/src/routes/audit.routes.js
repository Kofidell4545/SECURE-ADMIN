const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// Get audit trail for a resource
router.get('/trail/:resourceId', auditController.getAuditTrail);

// Get patient history from blockchain
router.get('/patient/:patientId/history', auditController.getPatientHistory);

// Get blockchain status
router.get('/blockchain/status', auditController.getBlockchainStatus);

module.exports = router;
