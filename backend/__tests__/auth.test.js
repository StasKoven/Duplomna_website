/**
 * Auth controller unit tests
 *
 * These tests mock Mongoose models and Firebase so no real database is needed.
 * Run with:  npm test  (from the backend/ folder)
 */

const jwt = require('jsonwebtoken');

// ----- Mocks must be declared before any require() that loads the module -----

// Mock Firebase admin so it never connects
jest.mock('../config/firebase', () => ({
  auth: () => ({
    verifyIdToken: jest.fn(),
  }),
}));

// Mock the User model
jest.mock('../models/User.model', () => {
  const mockUser = {
    _id: 'user123',
    firstName: 'Тарас',
    lastName: 'Шевченко',
    email: 'taras@example.com',
    role: 'user',
    isActive: true,
    emailVerified: false,
    wishlist: [],
    cart: [],
    refreshTokens: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    save: jest.fn().mockResolvedValue(true),
  };

  const UserMock = jest.fn().mockImplementation((data) => ({
    ...mockUser,
    ...data,
    save: jest.fn().mockResolvedValue(true),
  }));

  UserMock.findOne = jest.fn();
  UserMock.findById = jest.fn();

  return UserMock;
});

const authController = require('../controllers/auth.controller');
const User = require('../models/User.model');

// Helper to create mock req/res objects
function mockReqRes(body = {}) {
  const req = { body, cookies: {}, headers: {} };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
  };
  return { req, res };
}

// ---------------------------------------------------------------------------

describe('Auth Controller — register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 400 if email is already registered', async () => {
    User.findOne.mockResolvedValue({ email: 'taras@example.com' });

    const { req, res } = mockReqRes({
      firstName: 'Тарас',
      lastName: 'Шевченко',
      email: 'taras@example.com',
      password: 'password123',
    });

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Email already registered' })
    );
  });

  it('returns 201 with tokens on successful registration', async () => {
    User.findOne.mockResolvedValue(null); // no duplicate

    const { req, res } = mockReqRes({
      firstName: 'Іван',
      lastName: 'Франко',
      email: 'ivan@example.com',
      password: 'SecurePass1!',
    });

    await authController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody).toHaveProperty('accessToken');
    expect(responseBody).toHaveProperty('refreshToken');
    expect(responseBody.user).toMatchObject({ email: 'ivan@example.com' });
  });
});

// ---------------------------------------------------------------------------

describe('Auth Controller — login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when user is not found', async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const { req, res } = mockReqRes({
      email: 'notexist@example.com',
      password: 'any',
    });

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Invalid') })
    );
  });
});

// ---------------------------------------------------------------------------

describe('JWT token generation', () => {
  it('generates a valid JWT with userId payload', () => {
    const secret = process.env.JWT_SECRET || 'test-jwt-secret-key-for-jest';
    const token = jwt.sign({ userId: 'abc123' }, secret, { expiresIn: '15m' });
    const decoded = jwt.verify(token, secret);
    expect(decoded.userId).toBe('abc123');
  });

  it('throws when verifying with wrong secret', () => {
    const token = jwt.sign({ userId: 'abc' }, 'secret-a');
    expect(() => jwt.verify(token, 'secret-b')).toThrow();
  });
});
