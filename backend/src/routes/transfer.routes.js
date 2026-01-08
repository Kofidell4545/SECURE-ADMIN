const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transfer.controller');
const { protect } = require('../middleware/auth.middleware');

// All routes are protected
router.use(protect);

router.get('/', transferController.getAllTransfers);
router.get('/:id', transferController.getTransfer);
router.post('/', transferController.createTransfer);
router.put('/:id/status', transferController.updateTransferStatus);
router.delete('/:id', transferController.deleteTransfer);

module.exports = router;
