const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

// 2FA Routes
router.post('/2fa/setup', authMiddleware, authController.setup2FA);
router.post('/2fa/verify', authMiddleware, authController.verify2FA);

// Mock OAuth Routes
router.get('/google', authController.googleOAuth);
router.get('/github', authController.githubOAuth);

module.exports = router;
