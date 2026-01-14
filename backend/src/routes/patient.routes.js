const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createPatient, updatePatient } = require('../validation/patient.validation');

// All routes are protected
router.use(protect);

router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatient);
router.post('/', validate(createPatient), patientController.createPatient);
router.put('/:id', validate(updatePatient), patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

module.exports = router;
