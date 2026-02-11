const mongoose = require('mongoose');

const comparisonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  products: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    validate: {
      validator: function(v) {
        return v.length <= 4; // Max 4 products to compare
      },
      message: 'Cannot compare more than 4 products'
    }
  }
}, {
  timestamps: true
});

// Ensure user has only one comparison list per category
comparisonSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Comparison', comparisonSchema);
