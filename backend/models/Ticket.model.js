const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'admin', 'system'],
    required: true
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  }
}, {
  timestamps: true
});

const ticketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  guestName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  guestEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['order', 'delivery', 'payment', 'product', 'return', 'account', 'other'],
    default: 'other'
  },
  messages: [messageSchema],
  isRead: {
    type: Boolean,
    default: false
  },
  isReadByUser: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
ticketSchema.index({ status: 1, lastMessageAt: -1 });
ticketSchema.index({ user: 1, createdAt: -1 });
ticketSchema.index({ isRead: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
