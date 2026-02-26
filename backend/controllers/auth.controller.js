const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const admin = require('../config/firebase');

/**
 * Generate access and refresh tokens
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Register new user
 */
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to user (cleanup expired tokens)
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    user.refreshTokens = user.refreshTokens.filter(
      t => (Date.now() - new Date(t.createdAt).getTime()) < SEVEN_DAYS
    );
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        wishlist: user.wishlist,
        cart: user.cart,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

/**
 * Google authentication via Firebase
 */
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user already exists by firebaseUid or email
    let user = await User.findOne({ 
      $or: [{ firebaseUid: uid }, { email: email }] 
    });

    if (user) {
      // Update firebaseUid if user exists by email but doesn't have firebaseUid
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.authProvider = 'google';
        if (picture && !user.avatar) {
          user.avatar = picture;
        }
        user.emailVerified = true;
        await user.save();
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }
    } else {
      // Create new user from Google data
      const nameParts = (name || 'Google User').split(' ');
      const firstName = nameParts[0] || 'Google';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      user = new User({
        firstName,
        lastName,
        email,
        authProvider: 'google',
        firebaseUid: uid,
        avatar: picture || null,
        isActive: true,
        emailVerified: true,
      });

      await user.save();
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to user (cleanup expired tokens)
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    user.refreshTokens = user.refreshTokens.filter(
      t => (Date.now() - new Date(t.createdAt).getTime()) < SEVEN_DAYS
    );
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.json({
      message: 'Google authentication successful',
      user: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        authProvider: user.authProvider,
        wishlist: user.wishlist,
        cart: user.cart,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Token expired, please try again' });
    }
    if (error.code === 'auth/argument-error') {
      return res.status(400).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({ message: 'Google authentication failed', error: error.message });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user registered via Google (no password)
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ 
        message: 'Цей акаунт зареєстрований через Google. Використовуйте вхід через Google.' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to user (cleanup expired tokens)
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    user.refreshTokens = user.refreshTokens.filter(
      t => (Date.now() - new Date(t.createdAt).getTime()) < SEVEN_DAYS
    );
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        wishlist: user.wishlist,
        cart: user.cart,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

/**
 * Refresh access token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const tokenExists = user.refreshTokens.some(t => t.token === refreshToken);
    
    if (!tokenExists) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Remove old refresh token, cleanup expired, and add new one
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    user.refreshTokens = user.refreshTokens.filter(
      t => t.token !== refreshToken && (Date.now() - new Date(t.createdAt).getTime()) < SEVEN_DAYS
    );
    user.refreshTokens.push({ token: tokens.refreshToken });
    await user.save();

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

/**
 * Logout user
 */
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user._id;

    // Remove refresh token from user
    const user = await User.findById(userId);
    
    if (user && refreshToken) {
      user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);
      await user.save();
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name price images')
      .populate('cart.product', 'name price images stock');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, phone, avatar },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};
