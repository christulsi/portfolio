import { describe, it, expect } from 'vitest';

import { isValidEmail, sanitizeHTML, normalizeWhitespace, EMAIL_REGEX } from './form';

describe('Form Utilities', () => {
  describe('EMAIL_REGEX', () => {
    it('should match valid email addresses', () => {
      expect(EMAIL_REGEX.test('test@example.com')).toBe(true);
      expect(EMAIL_REGEX.test('user.name@example.co.uk')).toBe(true);
      expect(EMAIL_REGEX.test('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(EMAIL_REGEX.test('invalid')).toBe(false);
      expect(EMAIL_REGEX.test('invalid@')).toBe(false);
      expect(EMAIL_REGEX.test('@example.com')).toBe(false);
      expect(EMAIL_REGEX.test('invalid@.com')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email format', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('sanitizeHTML', () => {
    it('should escape HTML tags', () => {
      expect(sanitizeHTML('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert("xss")&lt;/script&gt;'
      );
    });

    it('should handle plain text', () => {
      expect(sanitizeHTML('Hello World')).toBe('Hello World');
    });

    it('should handle special characters', () => {
      expect(sanitizeHTML('<div>Hello & goodbye</div>')).toBe(
        '&lt;div&gt;Hello &amp; goodbye&lt;/div&gt;'
      );
    });
  });

  describe('normalizeWhitespace', () => {
    it('should trim leading and trailing whitespace', () => {
      expect(normalizeWhitespace('  hello  ')).toBe('hello');
    });

    it('should collapse multiple spaces', () => {
      expect(normalizeWhitespace('hello    world')).toBe('hello world');
    });

    it('should handle mixed whitespace', () => {
      expect(normalizeWhitespace('  hello\n\nworld  ')).toBe('hello world');
    });

    it('should handle empty string', () => {
      expect(normalizeWhitespace('')).toBe('');
    });
  });
});
