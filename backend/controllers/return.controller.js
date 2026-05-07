const ReturnRequest = require('../models/ReturnRequest.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');

/**
 * Create return/exchange request
 */
exports.createReturnRequest = async (req, res) => {
  try {
    const { orderId, items, type, description } = req.body;
    const userId = req.user._id;

    // Verify order belongs to user and is delivered
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
      orderStatus: 'delivered'
    });

    if (!order) {
      return res.status(400).json({
        message: 'Замовлення не знайдено або ще не доставлено'
      });
    }

    // Check 14-day return window
    const deliveredAt = order.deliveredAt || order.updatedAt;
    const daysSinceDelivery = Math.floor(
      (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceDelivery > 14) {
      return res.status(400).json({
        message: 'Термін повернення (14 днів) минув'
      });
    }

    // Check no existing pending request for this order
    const existingRequest = await ReturnRequest.findOne({
      order: orderId,
      user: userId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        message: 'Вже є активна заявка на повернення для цього замовлення'
      });
    }

    // Validate that all requested items are in the order
    for (const item of items) {
      const orderItem = order.items.find(
        oi => oi.product.toString() === item.product
      );
      if (!orderItem) {
        return res.status(400).json({
          message: `Товар ${item.product} не знайдено у замовленні`
        });
      }
      if (item.quantity > orderItem.quantity) {
        return res.status(400).json({
          message: `Кількість для повернення перевищує замовлену кількість`
        });
      }
    }

    const returnRequest = new ReturnRequest({
      order: orderId,
      user: userId,
      items: items.map(item => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        reason: item.reason
      })),
      type,
      description
    });

    await returnRequest.save();

    res.status(201).json({
      message: 'Заявку на повернення створено',
      returnRequest
    });
  } catch (error) {
    console.error('Create return request error:', error);
    res.status(500).json({
      message: 'Помилка створення заявки',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

/**
 * Get user's return requests
 */
exports.getUserReturnRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ReturnRequest.find({ user: userId })
      .populate('order', 'orderNumber total')
      .populate('items.product', 'name images')
      .sort('-createdAt')
      .lean();

    res.json({ returnRequests: requests });
  } catch (error) {
    console.error('Get return requests error:', error);
    res.status(500).json({ message: 'Помилка завантаження заявок' });
  }
};

/**
 * Get all return requests (Admin)
 */
exports.getAllReturnRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const requests = await ReturnRequest.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('order', 'orderNumber total')
      .populate('items.product', 'name images')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip)
      .lean();

    const total = await ReturnRequest.countDocuments(filter);

    res.json({
      returnRequests: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all return requests error:', error);
    res.status(500).json({ message: 'Помилка завантаження заявок' });
  }
};

/**
 * Update return request status (Admin)
 */
exports.updateReturnRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    const request = await ReturnRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Заявку не знайдено' });
    }

    const previousStatus = request.status;
    request.status = status;
    if (adminComment) request.adminComment = adminComment;
    if (status === 'completed' || status === 'rejected') {
      request.resolvedAt = new Date();
    }

    // When a return/exchange is first approved, restore product stock
    if (status === 'approved' && previousStatus !== 'approved') {
      for (const item of request.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    await request.save();

    res.json({ message: 'Статус заявки оновлено', returnRequest: request });
  } catch (error) {
    console.error('Update return request error:', error);
    res.status(500).json({ message: 'Помилка оновлення заявки' });
  }
};
