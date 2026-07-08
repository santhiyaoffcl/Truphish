const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

// Protect all chat routes
router.use(authMiddleware);

router.post('/', chatController.handleChat);

module.exports = router;
