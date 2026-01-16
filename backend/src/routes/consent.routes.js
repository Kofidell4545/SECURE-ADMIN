const express = require('express');
const router = express.Router();
const consentController = require('../controllers/consent.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

// Grant consent
router.post('/grant', consentController.grantConsent);

// Revoke consent
router.post('/:consentId/revoke', consentController.revokeConsent);

// Check consent
router.get('/check', consentController.checkConsent);

// Get consent history for a patient
router.get('/patient/:patientId/history', consentController.getConsentHistory);

// Get provider's active consents
router.get('/provider/:providerId', consentController.getProviderConsents);

module.exports = router;
