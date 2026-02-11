const Coupon = require('../models/Coupon.model');
const User = require('../models/User.model');

/**
 * @desc    Get all coupons (admin)
 * @route   GET /api/coupons
 * @access  Private (Admin)
 */
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate('applicableCategories', 'name')
      .populate('applicableProducts', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: coupons.length,
      coupons
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Get public active coupons
 * @route   GET /api/coupons/public
 * @access  Public
 */
exports.getPublicCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      isPublic: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).select('code description type value minPurchase endDate');

    res.status(200).json({
      success: true,
      coupons
    });
  } catch (error) {
    console.error('Get public coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Validate coupon
 * @route   POST /api/coupons/validate
 * @access  Private
 */
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal, cart } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() })
      .populate('applicableProducts')
      .populate('applicableCategories');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if valid
    const validCheck = coupon.isValid();
    if (!validCheck.valid) {
      return res.status(400).json({
        success: false,
        message: validCheck.message
      });
    }

    // Check if user already used it (if single use per user)
    if (coupon.usedBy.some(u => u.user.toString() === req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon'
      });
    }

    // Calculate discount
    const { discount, message } = coupon.calculateDiscount(subtotal, cart);

    if (discount === 0) {
      return res.status(400).json({
        success: false,
        message
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon is valid',
      coupon: {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        discount
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Apply coupon to order
 * @route   POST /api/coupons/apply
 * @access  Private
 */
exports.applyCoupon = async (req, res) => {
  try {
    const { code, orderId } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Validate coupon before applying
    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'Coupon is not active' });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    if (coupon.usedBy.some(u => u.user.toString() === req.user.id)) {
      return res.status(400).json({ success: false, message: 'You have already used this coupon' });
    }

    // Increment usage
    coupon.usageCount += 1;
    coupon.usedBy.push({
      user: req.user.id,
      usedAt: new Date()
    });

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully'
    });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Create coupon (admin)
 * @route   POST /api/coupons
 * @access  Private (Admin)
 */
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Update coupon (admin)
 * @route   PUT /api/coupons/:id
 * @access  Private (Admin)
 */
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * @desc    Delete coupon (admin)
 * @route   DELETE /api/coupons/:id
 * @access  Private (Admin)
 */
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
