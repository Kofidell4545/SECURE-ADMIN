const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { login, register } = require('../validation/auth.validation');

// Public routes
router.post('/register', validate(register), authController.register);
router.post('/login', validate(login), authController.login);

// Protected routes
router.get('/me', protect, authController.getMe);

module.exports = router;
