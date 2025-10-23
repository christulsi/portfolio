import { describe, it, expect } from 'vitest';

import { ContactFormSchema, validateContactForm } from './form.schema';

describe('Contact Form Schema', () => {
  describe('ContactFormSchema', () => {
    it('should validate correct form data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a valid message with enough characters.',
      };

      const result = ContactFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject name that is too short', () => {
      const invalidData = {
        name: 'J',
        email: 'john@example.com',
        message: 'This is a valid message.',
      };

      const result = ContactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'This is a valid message.',
      };

      const result = ContactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject message that is too short', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Short',
      };

      const result = ContactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should trim and lowercase email', () => {
      const data = {
        name: 'John Doe',
        email: '  JOHN@EXAMPLE.COM  ',
        message: 'This is a valid message with more than ten characters.',
      };

      const result = ContactFormSchema.safeParse(data);
      if (result.success) {
        expect(result.data.email).toBe('john@example.com');
      } else {
        console.error('Validation errors:', result.error.errors);
        throw new Error(`Validation should have succeeded: ${JSON.stringify(result.error.errors)}`);
      }
    });

    it('should trim whitespace from all fields', () => {
      const data = {
        name: '  John Doe  ',
        email: '  john@example.com  ',
        message: '  This is a valid message with more than ten characters.  ',
      };

      const result = ContactFormSchema.safeParse(data);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
        expect(result.data.email).toBe('john@example.com');
        expect(result.data.message).toBe('This is a valid message with more than ten characters.');
      } else {
        console.error('Validation errors:', result.error.errors);
        throw new Error(`Validation should have succeeded: ${JSON.stringify(result.error.errors)}`);
      }
    });
  });

  describe('validateContactForm', () => {
    it('should return success for valid data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a valid message.',
      };

      const result = validateContactForm(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
      }
    });

    it('should return errors for invalid data', () => {
      const invalidData = {
        name: 'J',
        email: 'invalid',
        message: 'Short',
      };

      const result = validateContactForm(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.name).toBeDefined();
        expect(result.errors.email).toBeDefined();
        expect(result.errors.message).toBeDefined();
      }
    });

    it('should handle missing fields', () => {
      const result = validateContactForm({});
      expect(result.success).toBe(false);
    });
  });
});
