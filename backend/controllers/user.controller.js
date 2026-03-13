const User = require('../models/User.model');

/**
 * Get user loyalty points and history
 */
exports.getLoyaltyPoints = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('loyaltyPoints loyaltyHistory').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sort history by date descending
    const history = (user.loyaltyHistory || []).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json({
      loyaltyPoints: user.loyaltyPoints || 0,
      history
    });
  } catch (error) {
    console.error('Get loyalty points error:', error);
    res.status(500).json({ message: 'Failed to fetch loyalty points' });
  }
};

/**
 * Get all users (Admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    console.log('📋 Get all users request:', {
      user: req.user?.email,
      role: req.user?.role,
      query: req.query
    });

    const { page = 1, limit = 20, role, search } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { firstName: new RegExp(escapedSearch, 'i') },
        { lastName: new RegExp(escapedSearch, 'i') },
        { email: new RegExp(escapedSearch, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password -refreshTokens')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip)
      .lean();

    const total = await User.countDocuments(filter);

    console.log(`✅ Found ${users.length} users (total: ${total})`);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get all users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

/**
 * Get single user (Admin only)
 */
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

/**
 * Update user (Admin only)
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { role, isActive },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

/**
 * Delete user (Admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

/**
 * Add to wishlist
 */
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({ message: 'Product added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
};

/**
 * Remove from wishlist
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    res.json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Failed to remove from wishlist' });
  }
};

/**
 * Manage cart
 */
exports.updateCart = async (req, res) => {
  try {
    const { cart } = req.body;
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { cart },
      { new: true }
    ).populate('cart.product', 'name price images stock');

    res.json({ message: 'Cart updated', cart: user.cart });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Failed to update cart' });
  }
};
