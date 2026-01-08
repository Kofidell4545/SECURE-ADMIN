const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatient);
router.post('/', patientController.createPatient);
router.put('/:id', patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

module.exports = router;
