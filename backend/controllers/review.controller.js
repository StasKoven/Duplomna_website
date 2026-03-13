const Review = require('../models/Review.model');
const Product = require('../models/Product.model');
const Order = require('../models/Order.model');

/**
 * Create review
 */
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, images } = req.body;
    const userId = req.user._id;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Only users who purchased and received the product can leave a review
    const hasPurchased = await Order.findOne({
      user: userId,
      'items.product': productId,
      orderStatus: 'delivered'
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: 'Тільки покупці, які отримали товар, можуть залишати відгук' });
    }

    const review = new Review({
      product: productId,
      user: userId,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase: true
    });

    await review.save();

    res.status(201).json({
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Failed to create review', error: error.message });
  }
};

/**
 * Get product reviews
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: productId, isApproved: true })
      .populate('user', 'firstName lastName avatar')
      .sort(sort)
      .limit(Number(limit))
      .skip(skip)
      .lean();

    const total = await Review.countDocuments({ product: productId, isApproved: true });

    res.json({
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

/**
 * Mark review as helpful
 */
exports.markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const index = review.helpful.indexOf(userId);
    
    if (index > -1) {
      review.helpful.splice(index, 1);
    } else {
      review.helpful.push(userId);
    }

    await review.save();

    res.json({ 
      message: 'Review updated',
      helpfulCount: review.helpful.length
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
};

/**
 * Delete review (Admin or owner)
 */
/**
 * Check if user can review a product
 */
exports.canReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.json({ canReview: false, reason: 'already_reviewed' });
    }

    const hasPurchased = await Order.findOne({
      user: userId,
      'items.product': productId,
      orderStatus: 'delivered'
    });

    if (!hasPurchased) {
      return res.json({ canReview: false, reason: 'not_purchased' });
    }

    return res.json({ canReview: true });
  } catch (error) {
    console.error('Can review check error:', error);
    res.status(500).json({ message: 'Failed to check review eligibility' });
  }
};

/**
 * Delete review (Admin or owner)
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (!isAdmin && review.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(id);

    // Recalculate product rating after deletion
    const Product = require('../models/Product.model');
    const stats = await Review.aggregate([
      { $match: { product: productId, isApproved: true } },
      { $group: { _id: '$product', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
    ]);
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        'rating.average': Math.round(stats[0].averageRating * 10) / 10,
        'rating.count': stats[0].reviewCount
      });
    } else {
      await Product.findByIdAndUpdate(productId, { 'rating.average': 0, 'rating.count': 0 });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
};
