const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({ message: 'Please provide email, username and password' });
        }

        const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query(
            'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)',
            [email, username, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const payload = { id: user.id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                username: user.username,
                role: user.role,
                two_factor_enabled: !!user.two_factor_enabled
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, email, username, role, two_factor_enabled, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];
        res.json({
            ...user,
            two_factor_enabled: !!user.two_factor_enabled
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ message: 'Server error getting user data' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        await db.query('UPDATE users SET username = ? WHERE id = ?', [username, req.user.id]);
        
        // Fetch updated user
        const [users] = await db.query('SELECT id, email, username, role, two_factor_enabled FROM users WHERE id = ?', [req.user.id]);
        res.json({ 
            message: 'Profile updated successfully', 
            user: {
                ...users[0],
                two_factor_enabled: !!users[0].two_factor_enabled
            } 
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new passwords' });
        }

        const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, req.user.id]);
        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error changing password' });
    }
};

// 2FA Setup
exports.setup2FA = async (req, res) => {
    try {
        const mockSecret = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        await db.query('UPDATE users SET two_factor_secret = ? WHERE id = ?', [mockSecret, req.user.id]);
        res.json({ message: '2FA Setup initiated', secret: mockSecret });
    } catch (error) {
        res.status(500).json({ message: 'Error setting up 2FA' });
    }
};

// 2FA Verify
exports.verify2FA = async (req, res) => {
    try {
        const { code, disable } = req.body;
        
        if (disable) {
            await db.query('UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = ?', [req.user.id]);
            return res.json({ message: '2FA disabled successfully' });
        }

        if (!code) {
            return res.status(400).json({ message: 'Verification code required' });
        }
        
        // Mock verification validation - accept any 6 digit code for demonstration
        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({ message: 'Invalid verification code format (must be 6 digits)' });
        }

        await db.query('UPDATE users SET two_factor_enabled = TRUE WHERE id = ?', [req.user.id]);
        res.json({ message: '2FA verified and enabled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying 2FA' });
    }
};

// OAuth Handlers (Mock logic for demonstration)
exports.googleOAuth = async (req, res) => {
    // In a real scenario, this would redirect to Google's OAuth consent screen
    res.redirect('http://localhost:5173/dashboard?auth_success=google');
};

exports.githubOAuth = async (req, res) => {
    // In a real scenario, this would redirect to GitHub's OAuth consent screen
    res.redirect('http://localhost:5173/dashboard?auth_success=github');
};

