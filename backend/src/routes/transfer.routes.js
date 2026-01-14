const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transfer.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createTransfer, updateTransferStatus } = require('../validation/transfer.validation');

// All routes are protected
router.use(protect);

router.get('/', transferController.getAllTransfers);
router.get('/:id', transferController.getTransfer);
router.post('/', validate(createTransfer), transferController.createTransfer);
router.put('/:id/status', validate(updateTransferStatus), transferController.updateTransferStatus);
router.delete('/:id', transferController.deleteTransfer);

module.exports = router;
