/**
 * Utility function tests
 *
 * Pure function tests — no DOM, no mocking needed.
 * Run with:  npm test  (from the frontend/ folder)
 */

import '@testing-library/jest-dom';
import { formatPrice, truncateText, debounce } from '@/lib/utils';

describe('formatPrice', () => {
  it('formats a whole number in UAH', () => {
    const result = formatPrice(1000);
    // Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH' })
    // produces something like "1 000 ₴" or "1\u00a0000\u00a0₴"
    expect(result).toContain('₴');
    expect(result).toContain('1');
  });

  it('formats zero without decimals', () => {
    const result = formatPrice(0);
    expect(result).toContain('0');
    expect(result).toContain('₴');
  });

  it('formats a large price correctly', () => {
    const result = formatPrice(45000);
    expect(result).toContain('45');
    expect(result).toContain('₴');
  });

  it('uses only regular spaces (no NBSP/NNBSP) so SSR and client output match', () => {
    // Node and Chrome ship different ICU versions that disagree on whether the
    // grouping/currency separators are U+00A0 or U+202F. If the raw Intl output
    // leaks through, the server HTML differs from the client render by these
    // invisible chars → React hydration mismatch (#425 → #422). Normalizing to a
    // plain space keeps the string byte-identical everywhere.
    const result = formatPrice(15999);
    expect(result).not.toMatch(/[  ]/);
  });
});

describe('truncateText', () => {
  it('returns the original text when shorter than maxLength', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates text that exceeds maxLength and appends ellipsis', () => {
    const result = truncateText('Hello World', 5);
    expect(result).toBe('Hello...');
  });

  it('returns text unchanged when length equals maxLength', () => {
    expect(truncateText('Hello', 5)).toBe('Hello');
  });
});

describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('delays function execution by the given wait time', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced('a');
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(299);
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('only fires once for rapid consecutive calls', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced('a');
    debounced('b');
    debounced('c');

    jest.runAllTimers();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });
});
