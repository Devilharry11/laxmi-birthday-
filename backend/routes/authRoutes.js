const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db/db');
const { requireAdminAuth, JWT_SECRET } = require('../auth/authMiddleware');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const admin = db.getAdminUser(email);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    db.updateLastLogin(email);

    // Create JWT
    const token = jwt.sign(
      { email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Welcome back, Aryan!',
      token,
      user: {
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return res.status(500).json({ error: 'Login failed due to a server error.' });
  }
});

// GET /api/auth/me (check active session)
router.get('/me', requireAdminAuth, (req, res) => {
  return res.json({
    authenticated: true,
    user: req.user
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Stateless JWT logout is handled on client by clearing token, but endpoint confirms session terminated
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// POST /api/auth/request-reset
router.post('/request-reset', (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const result = db.createPasswordResetToken(email);
    if (!result) {
      // Don't leak if account exists or not for public security, but return generic success
      return res.json({
        success: true,
        message: 'If the admin email matches our records, a reset token has been generated.'
      });
    }

    console.log(`[Auth] Password reset token generated for ${email}: ${result.token}`);

    return res.json({
      success: true,
      message: 'Password reset token generated.',
      // Providing resetToken in response makes testing and local recovery seamless without mandatory SMTP
      resetToken: result.token,
      expiresIn: '1 hour'
    });
  } catch (err) {
    console.error('[Auth] Request reset error:', err);
    return res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashed = await bcrypt.hash(newPassword, salt);

    const success = await db.resetPasswordWithToken(token, newHashed);
    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    return res.json({
      success: true,
      message: 'Password has been successfully updated. You may now log in.'
    });
  } catch (err) {
    console.error('[Auth] Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// POST /api/auth/change-password (Authenticated)
router.post('/change-password', requireAdminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const admin = db.getAdminUser(req.user.email);
    if (!admin) {
      return res.status(404).json({ error: 'Admin user not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password does not match.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashed = await bcrypt.hash(newPassword, salt);

    await db.updateAdminPassword(req.user.email, newHashed);

    return res.json({ success: true, message: 'Password updated successfully!' });
  } catch (err) {
    console.error('[Auth] Change password error:', err);
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

module.exports = router;
