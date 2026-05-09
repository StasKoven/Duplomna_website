const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const Coupon = require('../models/Coupon.model');
const User = require('../models/User.model');
const { createNotification } = require('./notification.controller');

/**
 * Create new order
 */
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;
    const userId = req.user._id;

    // Validate and calculate order totals
    let subtotal = 0;
    const orderItems = [];
    const productMap = new Map(); // Store full product docs for coupon calculation

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
      productMap.set(product._id.toString(), product);

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
    let discount = 0;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() })
        .populate('applicableProducts')
        .populate('applicableCategories');

      if (coupon) {
        const validCheck = coupon.isValid();
        if (validCheck.valid && !coupon.usedBy.some(u => u.user.toString() === userId.toString())) {
          // Build cart with populated product data for correct category/product filtering
          const cartForCoupon = orderItems.map(oi => {
            const fullProduct = productMap.get(oi.product.toString());
            return {
              product: { _id: oi.product, price: oi.price, category: fullProduct?.category },
              quantity: oi.quantity
            };
          });
          const result = coupon.calculateDiscount(subtotal, cartForCoupon);
          discount = result.discount || 0;

          // Mark coupon as used
          coupon.usageCount += 1;
          coupon.usedBy.push({ user: userId, usedAt: new Date() });
          await coupon.save();
        }
      }
    }

    // Atomically decrement stock with guard to prevent overselling
    const decrementedItems = [];
    for (const item of items) {
      const result = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!result) {
        // Rollback: restore stock for all previously decremented items
        for (const dec of decrementedItems) {
          await Product.findByIdAndUpdate(dec.product, {
            $inc: { stock: dec.quantity }
          });
        }
        return res.status(400).json({ 
          message: 'Stock changed during order creation. Please try again.' 
        });
      }
      decrementedItems.push({ product: item.product, quantity: item.quantity });
    }

    const total = subtotal + shippingCost + tax - discount;

    // Generate order number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const orderNumber = `ORD-${year}${month}${day}-${timestamp}${random}`;

    // Create order
    const order = new Order({
      orderNumber,
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      discount,
      total
    });

    await order.save();

    // Clear user's cart after successful order
    await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

    createNotification({
      userId,
      type: 'order_status',
      title: 'Замовлення створено',
      message: `Ваше замовлення #${order.orderNumber} успішно оформлено!`,
      link: `/orders/${order._id}`,
    });

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      message: 'Failed to create order',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
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
    const { orderStatus, trackingNumber, note, paymentStatus } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;

    if (paymentStatus && ['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
      const previousPayment = order.paymentStatus;
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid' && previousPayment !== 'paid') {
        order.paymentDetails = order.paymentDetails || {};
        order.paymentDetails.paidAt = new Date();
      }
    }

    // Manually push status history with admin info (pre-save hook also pushes, so disable it)
    order.statusHistory.push({
      status: orderStatus,
      date: new Date(),
      note: note || undefined,
      changedBy: req.user._id
    });
    order._skipStatusHistory = true;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();

      // Award loyalty points: 1 point per 10 UAH spent
      const pointsToAward = Math.floor(order.total / 10);
      if (pointsToAward > 0) {
        await User.findByIdAndUpdate(order.user, {
          $inc: { loyaltyPoints: pointsToAward },
          $push: {
            loyaltyHistory: {
              amount: pointsToAward,
              type: 'earned',
              description: `Замовлення #${order.orderNumber}`,
              orderId: order._id,
              date: new Date()
            }
          }
        });
      }
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

    // Send notification to user about order status change
    const STATUS_MESSAGES = {
      processing: { title: 'Замовлення обробляється', message: `Ваше замовлення #${order.orderNumber} прийнято в обробку.` },
      shipped: { title: 'Замовлення відправлено', message: `Ваше замовлення #${order.orderNumber} відправлено.${trackingNumber ? ` ТТН: ${trackingNumber}` : ''}` },
      delivered: { title: 'Замовлення доставлено', message: `Ваше замовлення #${order.orderNumber} доставлено. Дякуємо за покупку!` },
      cancelled: { title: 'Замовлення скасовано', message: `Ваше замовлення #${order.orderNumber} було скасовано.${note ? ` Причина: ${note}` : ''}` },
    };

    if (STATUS_MESSAGES[orderStatus] && previousStatus !== orderStatus) {
      createNotification({
        userId: order.user,
        type: 'order_status',
        title: STATUS_MESSAGES[orderStatus].title,
        message: STATUS_MESSAGES[orderStatus].message,
        link: `/orders/${order._id}`,
      });
    }

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

/**
 * Get dashboard statistics (Admin only)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Date ranges
    const now = new Date();
    const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // Basic counts
    const [totalOrders, totalUsers, totalProducts, totalRevenue] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
    ]);

    // Revenue per day (last 7 days)
    const revenueByDay = await Order.aggregate([
      { $match: { createdAt: { $gte: last7Days }, orderStatus: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill missing days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = revenueByDay.find(r => r._id === dateStr);
      dailyStats.push({
        date: dateStr,
        revenue: found ? found.revenue : 0,
        orders: found ? found.orders : 0,
      });
    }

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    // Top 5 products by quantity sold
    const topProducts = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    // New orders (last 30 days)
    const newOrders = await Order.countDocuments({ createdAt: { $gte: last30Days } });
    const newUsers = await User.countDocuments({ createdAt: { $gte: last30Days } });

    res.json({
      totals: {
        orders: totalOrders,
        users: totalUsers,
        products: totalProducts,
        revenue: totalRevenue[0]?.total || 0,
        newOrders,
        newUsers,
      },
      dailyStats,
      ordersByStatus: ordersByStatus.map(s => ({ status: s._id, count: s.count })),
      topProducts: topProducts.map(p => ({ name: p._id, sold: p.totalSold, revenue: p.totalRevenue })),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Помилка отримання статистики' });
  }
};
