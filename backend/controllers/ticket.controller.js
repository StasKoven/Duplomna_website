const Ticket = require('../models/Ticket.model');

/**
 * Create a new support ticket
 */
exports.createTicket = async (req, res) => {
  try {
    const { subject, message, category, guestName, guestEmail } = req.body;

    const ticketData = {
      subject,
      category: category || 'other',
      messages: [{
        sender: 'user',
        text: message
      }],
      lastMessageAt: new Date()
    };

    // If user is authenticated, attach user ID
    if (req.user) {
      ticketData.user = req.user._id;
    } else {
      // Guest ticket - require contact info
      if (!guestName || !guestEmail) {
        return res.status(400).json({ message: "Ім'я та email обов'язкові для гостьових тікетів" });
      }
      ticketData.guestName = guestName;
      ticketData.guestEmail = guestEmail;
    }

    const ticket = await Ticket.create(ticketData);
    await ticket.populate('user', 'firstName lastName email avatar');

    res.status(201).json({
      message: 'Тікет створено успішно',
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Помилка створення тікету', error: error.message });
  }
};

/**
 * Get user's tickets
 */
exports.getUserTickets = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const tickets = await Ticket.find({ user: userId })
      .sort({ lastMessageAt: -1 })
      .populate('user', 'firstName lastName email avatar');

    res.json({ tickets });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ message: 'Помилка отримання тікетів' });
  }
};

/**
 * Get single ticket by ID (user)
 */
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('user', 'firstName lastName email avatar');

    if (!ticket) {
      return res.status(404).json({ message: 'Тікет не знайдено' });
    }

    // Check ownership (user can only see their own tickets)
    if (req.user && ticket.user && ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ заборонено' });
    }

    // Mark as read by user
    if (req.user && req.user.role !== 'admin') {
      ticket.isReadByUser = true;
      await ticket.save();
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Помилка отримання тікету' });
  }
};

/**
 * Add message to ticket (user)
 */
exports.addMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Тікет не знайдено' });
    }

    // Check ownership
    if (ticket.user && ticket.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ заборонено' });
    }

    const isAdmin = req.user.role === 'admin';

    ticket.messages.push({
      sender: isAdmin ? 'admin' : 'user',
      text: message
    });

    ticket.lastMessageAt = new Date();
    
    if (isAdmin) {
      ticket.isReadByUser = false;
      ticket.isRead = true;
      if (ticket.status === 'open') {
        ticket.status = 'in-progress';
      }
    } else {
      ticket.isRead = false;
      ticket.isReadByUser = true;
    }

    await ticket.save();
    await ticket.populate('user', 'firstName lastName email avatar');

    res.json({
      message: 'Повідомлення додано',
      ticket
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ message: 'Помилка додавання повідомлення' });
  }
};

// ===== ADMIN METHODS =====

/**
 * Get all tickets (admin)
 */
exports.getAllTickets = async (req, res) => {
  try {
    const { status, priority, category, search, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { subject: { $regex: escapedSearch, $options: 'i' } },
        { guestName: { $regex: escapedSearch, $options: 'i' } },
        { guestEmail: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .sort({ isRead: 1, lastMessageAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'firstName lastName email avatar'),
      Ticket.countDocuments(filter)
    ]);

    const unreadCount = await Ticket.countDocuments({ isRead: false, status: { $ne: 'closed' } });

    res.json({
      tickets,
      total,
      unreadCount,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ message: 'Помилка отримання тікетів' });
  }
};

/**
 * Update ticket status (admin)
 */
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status, priority } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Тікет не знайдено' });
    }

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;

    // Add system message about status changes
    if (status) {
      const statusLabels = {
        'open': 'Відкрито',
        'in-progress': 'В обробці',
        'resolved': 'Вирішено',
        'closed': 'Закрито'
      };
      ticket.messages.push({
        sender: 'system',
        text: `Статус змінено на: ${statusLabels[status] || status}`
      });
      ticket.lastMessageAt = new Date();
      ticket.isReadByUser = false;
    }

    await ticket.save();
    await ticket.populate('user', 'firstName lastName email avatar');

    res.json({
      message: 'Тікет оновлено',
      ticket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Помилка оновлення тікету' });
  }
};

/**
 * Mark ticket as read (admin)
 */
exports.markAsRead = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    ).populate('user', 'firstName lastName email avatar');

    if (!ticket) {
      return res.status(404).json({ message: 'Тікет не знайдено' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Помилка' });
  }
};

/**
 * Delete ticket (admin)
 */
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Тікет не знайдено' });
    }

    res.json({ message: 'Тікет видалено' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ message: 'Помилка видалення тікету' });
  }
};
