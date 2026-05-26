/**
 * Zod validation schema tests
 *
 * Tests the same schemas used in login/register pages.
 * Run with:  npm test  (from the frontend/ folder)
 */

import '@testing-library/jest-dom';
import { z } from 'zod';

// Mirrors app's loginSchema (frontend/src/app/login/page.tsx)
const loginSchema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(6, 'Пароль має містити мінімум 6 символів'),
});

// Mirrors app's registerSchema (frontend/src/app/register/page.tsx)
const registerSchema = z.object({
  firstName: z.string().min(2, "Ім'я має містити мінімум 2 символи"),
  lastName: z.string().min(2, 'Прізвище має містити мінімум 2 символи'),
  email: z.string().email('Невірний формат email'),
  password: z.string().min(8, 'Пароль має містити мінімум 8 символів'),
});

// ---------------------------------------------------------------------------

describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'secret123' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret123' });
    expect(result.success).toBe(false);
    const issue = (result as z.SafeParseError<unknown>).error.issues[0];
    expect(issue.path).toContain('email');
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '123' });
    expect(result.success).toBe(false);
    const issue = (result as z.SafeParseError<unknown>).error.issues[0];
    expect(issue.path).toContain('password');
  });
});

// ---------------------------------------------------------------------------

describe('registerSchema', () => {
  const valid = {
    firstName: 'Іван',
    lastName: 'Франко',
    email: 'ivan@example.com',
    password: 'SecurePass1!',
  };

  it('accepts a fully valid registration payload', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects firstName shorter than 2 characters', () => {
    const result = registerSchema.safeParse({ ...valid, firstName: 'I' });
    expect(result.success).toBe(false);
    const issue = (result as z.SafeParseError<unknown>).error.issues[0];
    expect(issue.path).toContain('firstName');
  });

  it('rejects an invalid email in the register form', () => {
    const result = registerSchema.safeParse({ ...valid, email: 'bad-email' });
    expect(result.success).toBe(false);
    const issue = (result as z.SafeParseError<unknown>).error.issues[0];
    expect(issue.path).toContain('email');
  });

  it('rejects password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'short' });
    expect(result.success).toBe(false);
    const issue = (result as z.SafeParseError<unknown>).error.issues[0];
    expect(issue.path).toContain('password');
  });
});
