jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

jest.mock('mongoose', () => ({
  connection: { readyState: 1 },
}));

jest.mock('../models/User.model', () => ({
  findById: jest.fn(),
}));

const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User.model');
const errorHandler = require('../middleware/errorHandler');
const { validate, sanitizePagination } = require('../middleware/validator');
const { verifyToken, requireRole, requireAdmin, optionalAuth } = require('../middleware/auth');

function mockReq(overrides = {}) {
  return {
    method: 'GET',
    originalUrl: '/api/test',
    headers: {},
    body: {},
    params: {},
    query: {},
    ...overrides,
  };
}

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
}

describe('errorHandler', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('maps Mongoose validation errors to 400', () => {
    const err = {
      name: 'ValidationError',
      message: 'invalid',
      errors: {
        name: { message: 'Name is required' },
        price: { message: 'Price is required' },
      },
    };
    const res = mockRes();

    errorHandler(err, mockReq({ body: { password: 'secret', name: '' } }), res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation error',
      errors: ['Name is required', 'Price is required'],
    });
  });

  it('maps duplicate key, cast, JWT, expired-token and generic errors', () => {
    const cases = [
      [
        { code: 11000, keyPattern: { email: 1 }, message: 'duplicate' },
        400,
        'email already exists',
      ],
      [{ name: 'CastError', path: '_id', value: 'bad', message: 'cast' }, 400, 'Invalid ID format'],
      [{ name: 'JsonWebTokenError', message: 'bad token' }, 401, 'Invalid token'],
      [{ name: 'TokenExpiredError', message: 'expired' }, 401, 'Token expired'],
      [{ statusCode: 418, message: 'Teapot' }, 418, 'Teapot'],
    ];

    for (const [err, status, message] of cases) {
      const res = mockRes();
      errorHandler(err, mockReq({ params: { id: '1' }, query: { q: 'phone' } }), res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(status);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message }));
    }
  });
});

describe('validator middleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns validation errors from express-validator', () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [
        { path: 'email', msg: 'Invalid email' },
        { path: 'password', msg: 'Too short' },
      ],
    });
    const res = mockRes();
    const next = jest.fn();

    validate(mockReq(), res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation failed',
      errors: [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ],
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('passes through when validation succeeds and sanitizes pagination safely', () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    const next = jest.fn();

    validate(mockReq(), mockRes(), next);
    expect(next).toHaveBeenCalledTimes(1);

    const req = mockReq({ query: { limit: '999', page: 'bad' } });
    const nextPagination = jest.fn();
    sanitizePagination(req, mockRes(), nextPagination);

    expect(req.query).toEqual({ limit: 100, page: 1 });
    expect(nextPagination).toHaveBeenCalledTimes(1);
  });
});

describe('auth middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mongoose.connection.readyState = 1;
  });

  it('rejects requests while database is not ready or token is missing', async () => {
    mongoose.connection.readyState = 0;
    const startingRes = mockRes();
    await verifyToken(mockReq(), startingRes, jest.fn());
    expect(startingRes.status).toHaveBeenCalledWith(503);

    mongoose.connection.readyState = 1;
    const missingRes = mockRes();
    await verifyToken(mockReq(), missingRes, jest.fn());
    expect(missingRes.status).toHaveBeenCalledWith(401);
  });

  it('attaches active user for a valid token', async () => {
    jwt.verify.mockReturnValue({ userId: 'u1' });
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'u1', role: 'admin', isActive: true }),
    });
    const req = mockReq({ headers: { authorization: 'Bearer token' } });
    const next = jest.fn();

    await verifyToken(req, mockRes(), next);

    expect(jwt.verify).toHaveBeenCalledWith('token', process.env.JWT_ACCESS_SECRET);
    expect(req.user).toMatchObject({ _id: 'u1', role: 'admin' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects inactive users and invalid tokens', async () => {
    jwt.verify.mockReturnValueOnce({ userId: 'u1' });
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({ _id: 'u1', isActive: false }),
    });
    const inactiveRes = mockRes();
    await verifyToken(mockReq({ headers: { authorization: 'Bearer token' } }), inactiveRes, jest.fn());
    expect(inactiveRes.status).toHaveBeenCalledWith(403);

    jwt.verify.mockImplementationOnce(() => {
      const err = new Error('invalid');
      err.name = 'JsonWebTokenError';
      throw err;
    });
    const invalidRes = mockRes();
    await verifyToken(mockReq({ headers: { authorization: 'Bearer bad' } }), invalidRes, jest.fn());
    expect(invalidRes.status).toHaveBeenCalledWith(401);
  });

  it('checks role and admin access', () => {
    const roleNext = jest.fn();
    requireRole('admin')(mockReq({ user: { role: 'admin' } }), mockRes(), roleNext);
    expect(roleNext).toHaveBeenCalledTimes(1);

    const deniedRes = mockRes();
    requireRole('admin')(mockReq({ user: { role: 'user' } }), deniedRes, jest.fn());
    expect(deniedRes.status).toHaveBeenCalledWith(403);

    const adminNext = jest.fn();
    requireAdmin(mockReq({ user: { role: 'admin' } }), mockRes(), adminNext);
    expect(adminNext).toHaveBeenCalledTimes(1);

    const noUserRes = mockRes();
    requireAdmin(mockReq(), noUserRes, jest.fn());
    expect(noUserRes.status).toHaveBeenCalledWith(401);
  });

  it('optionalAuth continues with or without a usable token', async () => {
    const noTokenNext = jest.fn();
    await optionalAuth(mockReq(), mockRes(), noTokenNext);
    expect(noTokenNext).toHaveBeenCalledTimes(1);

    jwt.verify.mockReturnValueOnce({ userId: 'u2' });
    User.findById.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({ _id: 'u2', isActive: true }),
    });
    const req = mockReq({ headers: { authorization: 'Bearer token' } });
    const next = jest.fn();

    await optionalAuth(req, mockRes(), next);

    expect(req.user).toMatchObject({ _id: 'u2' });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
