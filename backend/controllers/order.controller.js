const Order = require('../models/Order.model');
const Product = require('../models/Product.model');

/**
 * Create new order
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user._id;

    // Validate and calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    // Calculate totals
    const shippingCost = subtotal > 1000 ? 0 : 50; // Free shipping over 1000
    const tax = subtotal * 0.2; // 20% tax
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      total
    });

    await order.save();

    // Atomically decrement stock with guard to prevent overselling
    for (const item of items) {
      const result = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!result) {
        // Rollback: delete the order and restore already decremented items
        await Order.findByIdAndDelete(order._id);
        return res.status(400).json({ 
          message: 'Stock changed during order creation. Please try again.' 
        });
      }
    }

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

/**
 * Get user orders
 */
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name images')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip)
      .lean();

    const total = await Order.countDocuments({ user: userId });

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

/**
 * Get all orders (Admin only)
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentStatus 
    } = req.query;

    const filter = {};
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip)
      .lean();

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

/**
 * Get single order
 */
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const query = { _id: id };
    if (!isAdmin) query.user = userId;

    const order = await Order.findOne(query)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

/**
 * Update order status (Admin only)
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, trackingNumber, note } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
    }

    if (orderStatus === 'cancelled' && previousStatus !== 'cancelled') {
      order.cancelledAt = new Date();
      if (note) order.cancellationReason = note;

      // Restore product stock (only on first cancellation)
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    await order.save();

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};

/**
 * Get order statistics (Admin only)
 */
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({ stats: stats[0] || {} });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({ message: 'Failed to fetch order statistics' });
  }
};
