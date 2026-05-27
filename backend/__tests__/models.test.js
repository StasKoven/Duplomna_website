const mongoose = require('mongoose');

const Category = require('../models/Category.model');
const Comparison = require('../models/Comparison.model');
const Coupon = require('../models/Coupon.model');
const Notification = require('../models/Notification.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const ReturnRequest = require('../models/ReturnRequest.model');
const Review = require('../models/Review.model');
const Ticket = require('../models/Ticket.model');
const User = require('../models/User.model');

const objectId = () => new mongoose.Types.ObjectId();

describe('Mongoose models', () => {
  it('loads all core models with expected collection names', () => {
    expect(Category.modelName).toBe('Category');
    expect(Comparison.modelName).toBe('Comparison');
    expect(Coupon.modelName).toBe('Coupon');
    expect(Notification.modelName).toBe('Notification');
    expect(Order.modelName).toBe('Order');
    expect(Product.modelName).toBe('Product');
    expect(ReturnRequest.modelName).toBe('ReturnRequest');
    expect(Review.modelName).toBe('Review');
    expect(Ticket.modelName).toBe('Ticket');
    expect(User.modelName).toBe('User');
  });

  it('validates product required fields and exposes stock/discount virtuals', () => {
    const product = new Product({
      name: 'MacBook Pro',
      description: 'Laptop',
      price: 80000,
      comparePrice: 100000,
      category: objectId(),
      sku: 'mbp-001',
      stock: 1,
      lowStockThreshold: 2,
      images: [{ url: '/img.jpg', isMain: true }],
      specifications: [{ name: 'RAM', value: '16 GB' }],
    });

    expect(product.validateSync()).toBeUndefined();
    expect(product.discountPercentage).toBe(20);
    expect(product.stockStatus).toBe('low_stock');

    product.stock = 0;
    expect(product.stockStatus).toBe('out_of_stock');

    const invalid = new Product({ price: -1 });
    const error = invalid.validateSync();
    expect(error.errors.name.message).toBe('Product name is required');
    expect(error.errors.price.message).toBe('Price cannot be negative');
  });

  it('calculates coupon validity and discounts', () => {
    const activeCoupon = new Coupon({
      code: 'sale10',
      description: 'Sale',
      type: 'percentage',
      value: 10,
      minPurchase: 100,
      maxDiscount: 50,
      startDate: new Date(Date.now() - 1000),
      endDate: new Date(Date.now() + 100000),
      isActive: true,
    });

    expect(activeCoupon.code).toBe('SALE10');
    expect(activeCoupon.isValid()).toEqual({ valid: true });
    expect(activeCoupon.calculateDiscount(1000)).toEqual({
      discount: 50,
      message: 'Coupon applied successfully',
    });
    expect(activeCoupon.calculateDiscount(50).discount).toBe(0);

    const fixedCoupon = new Coupon({
      code: 'fixed',
      description: 'Fixed',
      type: 'fixed',
      value: 300,
      startDate: new Date(Date.now() - 1000),
      endDate: new Date(Date.now() + 100000),
    });
    expect(fixedCoupon.calculateDiscount(200).discount).toBe(200);

    fixedCoupon.isActive = false;
    expect(fixedCoupon.isValid()).toEqual({
      valid: false,
      message: 'Coupon is not active',
    });
  });

  it('applies coupon only to scoped products or categories', () => {
    const categoryId = objectId();
    const productId = objectId();
    const coupon = new Coupon({
      code: 'scope',
      description: 'Scoped',
      type: 'percentage',
      value: 20,
      applicableProducts: [productId],
      applicableCategories: [categoryId],
      startDate: new Date(Date.now() - 1000),
      endDate: new Date(Date.now() + 100000),
    });

    const result = coupon.calculateDiscount(9999, [
      { product: { _id: productId, category: objectId(), price: 100 }, quantity: 2 },
      { product: { _id: objectId(), category: categoryId, price: 50 }, quantity: 1 },
      { product: { _id: objectId(), category: objectId(), price: 1000 }, quantity: 1 },
    ]);

    expect(result.discount).toBe(50);
  });

  it('generates order number during validation', async () => {
    const order = new Order({
      user: objectId(),
      items: [{ product: objectId(), price: 100, quantity: 2, subtotal: 200 }],
      shippingAddress: {
        firstName: 'Ivan',
        lastName: 'Franko',
        street: 'Main',
        city: 'Kyiv',
        zipCode: '01001',
        country: 'Ukraine',
      },
      paymentMethod: 'cash_on_delivery',
      subtotal: 200,
      total: 200,
    });

    await order.validate();
    expect(order.orderNumber).toMatch(/^ORD-/);
  });

  it('keeps user JSON output free of sensitive fields and exposes fullName', () => {
    const user = new User({
      firstName: 'Lesia',
      lastName: 'Ukrainka',
      email: 'lesia@example.com',
      password: 'password123',
      refreshTokens: [{ token: 'refresh' }],
    });

    const json = user.toJSON();

    expect(user.fullName).toBe('Lesia Ukrainka');
    expect(json.password).toBeUndefined();
    expect(json.refreshTokens).toBeUndefined();
    expect(user.validateSync()).toBeUndefined();
  });
});
