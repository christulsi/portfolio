import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  clearFieldValidation,
  disableForm,
  enableForm,
  EMAIL_REGEX,
  getFieldValue,
  isValidEmail,
  normalizeWhitespace,
  resetFormValidation,
  sanitizeHTML,
  serializeForm,
  setFieldValue,
  showFieldError,
  showFieldSuccess,
} from './form';

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

  describe('DOM helpers', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <form id="test-form">
          <input id="name" name="name" />
          <p id="name-error" class="hidden">Name error</p>
          <div id="name-icon" class="hidden"></div>

          <input id="email" name="email" />
          <p id="email-error" class="hidden">Email error</p>

          <textarea id="message" name="message"></textarea>

          <button type="submit">Send</button>
        </form>
      `;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    describe('serializeForm', () => {
      it('serializes named inputs to a plain object', () => {
        const form = document.getElementById('test-form') as HTMLFormElement;
        (form.elements.namedItem('name') as HTMLInputElement).value = 'Alice';
        (form.elements.namedItem('email') as HTMLInputElement).value = 'alice@example.com';
        (form.elements.namedItem('message') as HTMLTextAreaElement).value = 'Hello';

        expect(serializeForm(form)).toEqual({
          name: 'Alice',
          email: 'alice@example.com',
          message: 'Hello',
        });
      });
    });

    describe('showFieldError / showFieldSuccess / clearFieldValidation', () => {
      it('marks the field invalid and reveals the error with the supplied message', () => {
        showFieldError('name', 'Too short');
        const field = document.getElementById('name')!;
        const error = document.getElementById('name-error')!;
        expect(field.classList.contains('field-invalid')).toBe(true);
        expect(field.classList.contains('field-valid')).toBe(false);
        expect(error.classList.contains('hidden')).toBe(false);
        expect(error.textContent).toBe('Too short');
      });

      it('marks the field valid and hides the error', () => {
        showFieldError('name', 'Too short');
        showFieldSuccess('name');
        const field = document.getElementById('name')!;
        const error = document.getElementById('name-error')!;
        expect(field.classList.contains('field-valid')).toBe(true);
        expect(field.classList.contains('field-invalid')).toBe(false);
        expect(error.classList.contains('hidden')).toBe(true);
      });

      it('clears both validation states', () => {
        showFieldError('name', 'Too short');
        clearFieldValidation('name');
        const field = document.getElementById('name')!;
        expect(field.classList.contains('field-valid')).toBe(false);
        expect(field.classList.contains('field-invalid')).toBe(false);
      });
    });

    describe('resetFormValidation', () => {
      it('clears all field states and hides all errors/icons in the form', () => {
        showFieldError('name', 'Too short');
        showFieldSuccess('email');
        const nameIcon = document.getElementById('name-icon')!;
        nameIcon.classList.remove('hidden');

        const form = document.getElementById('test-form') as HTMLFormElement;
        resetFormValidation(form);

        const name = document.getElementById('name')!;
        const email = document.getElementById('email')!;
        expect(name.classList.contains('field-invalid')).toBe(false);
        expect(email.classList.contains('field-valid')).toBe(false);
        expect(document.getElementById('name-error')!.classList.contains('hidden')).toBe(true);
        expect(nameIcon.classList.contains('hidden')).toBe(true);
      });
    });

    describe('getFieldValue / setFieldValue', () => {
      it('reads and writes input values; returns empty string for missing fields', () => {
        setFieldValue('name', 'Bob');
        expect(getFieldValue('name')).toBe('Bob');
        expect(getFieldValue('does-not-exist')).toBe('');
        // setFieldValue on a missing field should be a no-op (no throw)
        expect(() => setFieldValue('does-not-exist', 'x')).not.toThrow();
      });
    });

    describe('disableForm / enableForm', () => {
      it('toggles the submit button disabled state', () => {
        const form = document.getElementById('test-form') as HTMLFormElement;
        const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        disableForm(form);
        expect(btn.disabled).toBe(true);
        enableForm(form);
        expect(btn.disabled).toBe(false);
      });
    });
  });
});
