const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');
const authMiddleware = require('../middleware/auth');

// Protect all scan routes
router.use(authMiddleware);

router.post('/url', scanController.scanUrl);
router.post('/text', scanController.scanText);
router.get('/stream/url', scanController.streamUrl);
router.get('/stream/text', scanController.streamText);
router.get('/history', scanController.getHistory);
router.delete('/history', scanController.clearHistory);

module.exports = router;
