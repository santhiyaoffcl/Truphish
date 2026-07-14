const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            return res.status(400).json({ message: 'Please provide email, username and password' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            email,
            username,
            password_hash: hashedPassword
        });
        const savedUser = await user.save();

        res.status(201).json({ message: 'User registered successfully', userId: savedUser.id });
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

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

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
        const user = await User.findById(req.user.id).select('id email username role two_factor_enabled created_at');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
            two_factor_enabled: !!user.two_factor_enabled,
            created_at: user.created_at
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ message: 'Server error getting user data' });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { username },
            { new: true }
        ).select('id email username role two_factor_enabled');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json({ 
            message: 'Profile updated successfully', 
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                two_factor_enabled: !!user.two_factor_enabled
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

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password_hash = hashedPassword;
        await user.save();

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
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { two_factor_secret: mockSecret },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
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
            await User.findByIdAndUpdate(req.user.id, {
                two_factor_enabled: false,
                two_factor_secret: null
            });
            return res.json({ message: '2FA disabled successfully' });
        }

        if (!code) {
            return res.status(400).json({ message: 'Verification code required' });
        }
        
        if (!/^\d{6}$/.test(code)) {
            return res.status(400).json({ message: 'Invalid verification code format (must be 6 digits)' });
        }

        await User.findByIdAndUpdate(req.user.id, {
            two_factor_enabled: true
        });
        res.json({ message: '2FA verified and enabled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying 2FA' });
    }
};

// OAuth Handlers (Mock logic for demonstration)
exports.googleOAuth = async (req, res) => {
    res.redirect('http://localhost:5173/dashboard?auth_success=google');
};

exports.githubOAuth = async (req, res) => {
    res.redirect('http://localhost:5173/dashboard?auth_success=github');
};
