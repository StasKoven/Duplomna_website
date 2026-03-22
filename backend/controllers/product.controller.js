const Product = require('../models/Product.model');
const mongoose = require('mongoose');

/**
 * Get all products with filtering, sorting, and pagination
 */
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      category,
      minPrice,
      maxPrice,
      brand,
      search,
      inStock,
      featured,
      onSale
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) {
      // Accept both ObjectId and slug for category filter
      if (mongoose.Types.ObjectId.isValid(category) && /^[0-9a-fA-F]{24}$/.test(category)) {
        filter.category = category;
      } else {
        const Category = require('../models/Category.model');
        const catDoc = await Category.findOne({ slug: String(category).toLowerCase() }).select('_id');
        if (catDoc) {
          filter.category = catDoc._id;
        } else {
          // No matching category slug; force empty result
          filter.category = null;
        }
      }
    }
    if (brand) filter.brand = new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (featured === 'true') filter.isFeatured = true;
    if (onSale === 'true') filter.isOnSale = true;
    if (inStock === 'true') filter.stock = { $gt: 0 };

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Search by name, brand, tags and shortDescription
    if (search) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      filter.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { tags: searchRegex },
        { shortDescription: searchRegex },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .limit(Number(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

/**
 * Get single product by ID or slug
 */
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
    
    let product;
    if (isValidObjectId) {
      // Search by _id or slug
      product = await Product.findOne({
        $or: [{ _id: id }, { slug: id }],
        isActive: true
      })
        .populate('category', 'name slug')
        .populate({
          path: 'reviews',
          populate: { path: 'user', select: 'firstName lastName avatar' },
          options: { limit: 10, sort: '-createdAt' }
        });
    } else {
      // Search only by slug
      product = await Product.findOne({
        slug: id,
        isActive: true
      })
        .populate('category', 'name slug')
        .populate({
          path: 'reviews',
          populate: { path: 'user', select: 'firstName lastName avatar' },
          options: { limit: 10, sort: '-createdAt' }
        });
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment views (use atomic update to avoid triggering full save hooks)
    await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } });
    product.views += 1;

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

/**
 * Create new product (Admin only)
 */
exports.createProduct = async (req, res) => {
  try {
    console.log('📦 Creating product with data:', JSON.stringify(req.body, null, 2));
    
    const productData = req.body;
    
    // Validate required fields
    if (!productData.name) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!productData.price) {
      return res.status(400).json({ message: 'Price is required' });
    }
    if (!productData.category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    if (!productData.sku) {
      return res.status(400).json({ message: 'SKU is required' });
    }
    
    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({ message: `Product with SKU "${productData.sku}" already exists` });
    }
    
    const product = new Product(productData);
    await product.save();

    console.log('✅ Product created successfully:', product._id);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: messages,
        error: messages.join(', ')
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `Product with this ${field} already exists`,
        error: `Duplicate ${field}`
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create product', 
      error: error.message 
    });
  }
};

/**
 * Update product (Admin only)
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Whitelist updatable fields — protect internal fields like views, rating, slug
    const allowedFields = [
      'name', 'description', 'shortDescription', 'price', 'comparePrice', 'cost',
      'category', 'brand', 'sku', 'barcode', 'images', 'stock', 'lowStockThreshold',
      'specifications', 'features', 'tags', 'warranty', 'isActive', 'isFeatured',
      'isOnSale', 'weight', 'dimensions', 'seoTitle', 'seoDescription'
    ];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

/**
 * Delete product (Admin only)
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

/**
 * Get featured products
 */
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({ 
      isFeatured: true, 
      isActive: true,
      stock: { $gt: 0 }
    })
      .populate('category', 'name slug')
      .limit(Number(limit))
      .sort('-createdAt')
      .lean();

    res.json({ products });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Failed to fetch featured products' });
  }
};

/**
 * Get related products
 */
exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
      isActive: true,
      stock: { $gt: 0 }
    })
      .populate('category', 'name slug')
      .limit(Number(limit))
      .sort('-rating.average')
      .lean();

    res.json({ products: relatedProducts });
  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({ message: 'Failed to fetch related products' });
  }
};

/**
 * Get filter options (brands + price range)
 */
exports.getFilterOptions = async (req, res) => {
  try {
    const result = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          brands: { $addToSet: '$brand' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    if (result.length === 0) {
      return res.json({ brands: [], priceRange: { min: 0, max: 0 } });
    }

    const brands = result[0].brands.filter(Boolean).sort();
    res.json({
      brands,
      priceRange: {
        min: Math.floor(result[0].minPrice),
        max: Math.ceil(result[0].maxPrice),
      },
    });
  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({ message: 'Failed to fetch filter options' });
  }
};

/**
 * Get product statistics (Admin only)
 */
exports.getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          },
          averagePrice: { $avg: '$price' },
          totalValue: {
            $sum: { $multiply: ['$price', '$stock'] }
          }
        }
      }
    ]);

    res.json({ stats: stats[0] || {} });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({ message: 'Failed to fetch product statistics' });
  }
};

/**
 * Autocomplete search — fast endpoint for the header search bar
 * Uses MongoDB $text index (name + description + brand), falls back to regex
 */
exports.autocompleteProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ products: [] });
    }

    const query = q.trim().slice(0, 100);

    // Primary: use the text index for relevance-scored results
    let products = await Product.find(
      { $text: { $search: query }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(8)
      .select('name slug price comparePrice images brand stock')
      .lean();

    // Fallback: prefix regex on name/brand when text search returns nothing
    if (products.length === 0) {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      products = await Product.find({
        isActive: true,
        $or: [{ name: regex }, { brand: regex }],
      })
        .limit(8)
        .select('name slug price comparePrice images brand stock')
        .lean();
    }

    res.json({ products });
  } catch (error) {
    console.error('Autocomplete error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
};
