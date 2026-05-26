/**
 * Product controller unit tests — search filter building & autocomplete
 *
 * Run with:  npm test  (from the backend/ folder)
 */

// Mock mongoose and models before requiring the controller
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    Types: {
      ObjectId: {
        isValid: jest.fn((v) => /^[0-9a-fA-F]{24}$/.test(v)),
      },
    },
  };
});

jest.mock('../models/Product.model', () => {
  const mockProducts = [
    {
      _id: 'prod1',
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro-123',
      brand: 'Apple',
      price: 45000,
      images: [{ url: 'https://example.com/img.jpg', isMain: true }],
      isActive: true,
    },
    {
      _id: 'prod2',
      name: 'Samsung Galaxy S24',
      slug: 'samsung-galaxy-s24-456',
      brand: 'Samsung',
      price: 35000,
      images: [],
      isActive: true,
    },
  ];

  const chain = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(mockProducts),
  };

  const ProductMock = {
    find: jest.fn().mockReturnValue(chain),
    countDocuments: jest.fn().mockResolvedValue(2),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    aggregate: jest.fn(),
  };

  return ProductMock;
});

jest.mock('../models/Category.model', () => ({
  findOne: jest.fn(),
}));

const productController = require('../controllers/product.controller');
const Product = require('../models/Product.model');

function mockReqRes(query = {}) {
  const req = { query, params: {}, body: {} };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return { req, res };
}

// ---------------------------------------------------------------------------

describe('Product Controller — getProducts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns products list with pagination info', async () => {
    const { req, res } = mockReqRes({ page: '1', limit: '12' });
    await productController.getProducts(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        products: expect.any(Array),
        pagination: expect.objectContaining({ page: 1, limit: 12 }),
      })
    );
  });

  it('filters by name regex when search query is provided', async () => {
    const { req, res } = mockReqRes({ search: 'iphone' });
    await productController.getProducts(req, res);

    const filterArg = Product.find.mock.calls[0][0];
    expect(filterArg.name).toBeInstanceOf(RegExp);
    expect(filterArg.name.test('iPhone 15 Pro')).toBe(true);
    expect(filterArg.name.test('Samsung Galaxy')).toBe(false);
  });

  it('filters by inStock when inStock=true', async () => {
    const { req, res } = mockReqRes({ inStock: 'true' });
    await productController.getProducts(req, res);

    const filterArg = Product.find.mock.calls[0][0];
    expect(filterArg.stock).toEqual({ $gt: 0 });
  });

  it('applies price range filter', async () => {
    const { req, res } = mockReqRes({ minPrice: '1000', maxPrice: '50000' });
    await productController.getProducts(req, res);

    const filterArg = Product.find.mock.calls[0][0];
    expect(filterArg.price).toEqual({ $gte: 1000, $lte: 50000 });
  });
});

// ---------------------------------------------------------------------------

describe('Product Controller — autocompleteProducts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns empty array when query is shorter than 2 chars', async () => {
    const { req, res } = mockReqRes({ q: 'i' });
    await productController.autocompleteProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({ products: [] });
    expect(Product.find).not.toHaveBeenCalled();
  });

  it('returns empty array when query is missing', async () => {
    const { req, res } = mockReqRes({});
    await productController.autocompleteProducts(req, res);

    expect(res.json).toHaveBeenCalledWith({ products: [] });
  });

  it('calls Product.find and returns results for valid query', async () => {
    // Override chain to return 1 product (simulating successful $text search)
    const mockResult = [{ _id: 'prod1', name: 'iPhone 15 Pro', slug: 'iphone-15-pro', price: 45000, images: [] }];
    const chain = {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockResult),
    };
    Product.find.mockReturnValue(chain);

    const { req, res } = mockReqRes({ q: 'iphone' });
    await productController.autocompleteProducts(req, res);

    expect(Product.find).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ products: expect.any(Array) })
    );
  });
});
