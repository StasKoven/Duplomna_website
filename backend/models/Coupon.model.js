const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minPurchase: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  usageLimit: {
    type: Number,
    default: null // null = unlimited
  },
  usageCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  
  // Check if active
  if (!this.isActive) return { valid: false, message: 'Coupon is not active' };
  
  // Check dates
  if (now < this.startDate) return { valid: false, message: 'Coupon is not yet active' };
  if (now > this.endDate) return { valid: false, message: 'Coupon has expired' };
  
  // Check usage limit
  if (this.usageLimit && this.usageCount >= this.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  
  return { valid: true };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(subtotal, cart = []) {
  // Check if applicable to cart items
  if (this.applicableCategories.length > 0 || this.applicableProducts.length > 0) {
    const applicableTotal = cart.reduce((sum, item) => {
      const isApplicable = 
        this.applicableProducts.some(p => p.toString() === item.product._id.toString()) ||
        this.applicableCategories.some(c => c.toString() === item.product.category.toString());
      
      return sum + (isApplicable ? item.product.price * item.quantity : 0);
    }, 0);
    
    subtotal = applicableTotal;
  }
  
  // Check minimum purchase
  if (subtotal < this.minPurchase) {
    return { 
      discount: 0, 
      message: `Minimum purchase of ${this.minPurchase} required` 
    };
  }
  
  let discount = 0;
  
  if (this.type === 'percentage') {
    discount = (subtotal * this.value) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else if (this.type === 'fixed') {
    discount = this.value;
    if (discount > subtotal) {
      discount = subtotal;
    }
  }
  
  return { 
    discount: Math.round(discount * 100) / 100,
    message: 'Coupon applied successfully'
  };
};

module.exports = mongoose.model('Coupon', couponSchema);
