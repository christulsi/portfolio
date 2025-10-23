/**
 * Form Utilities and Validation Helpers
 */

/**
 * Serialize form data to an object
 */
export function serializeForm(form: HTMLFormElement): Record<string, string> {
  const formData = new FormData(form);
  const data: Record<string, string> = {};

  formData.forEach((value, key) => {
    data[key] = value.toString();
  });

  return data;
}

/**
 * Reset form validation state
 */
export function resetFormValidation(form: HTMLFormElement): void {
  const inputs = form.querySelectorAll('input, textarea, select');

  inputs.forEach((input) => {
    input.classList.remove('field-valid', 'field-invalid');

    // Hide error messages
    const errorId = `${input.id}-error`;
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.classList.add('hidden');
    }

    // Hide validation icons
    const iconId = `${input.id}-icon`;
    const iconEl = document.getElementById(iconId);
    if (iconEl) {
      iconEl.classList.add('hidden');
    }
  });
}

/**
 * Show field error
 */
export function showFieldError(fieldId: string, message: string): void {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);

  if (field) {
    field.classList.remove('field-valid');
    field.classList.add('field-invalid');
  }

  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  }
}

/**
 * Show field success
 */
export function showFieldSuccess(fieldId: string): void {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);

  if (field) {
    field.classList.remove('field-invalid');
    field.classList.add('field-valid');
  }

  if (errorEl) {
    errorEl.classList.add('hidden');
  }
}

/**
 * Clear field validation state
 */
export function clearFieldValidation(fieldId: string): void {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(`${fieldId}-error`);

  if (field) {
    field.classList.remove('field-valid', 'field-invalid');
  }

  if (errorEl) {
    errorEl.classList.add('hidden');
  }
}

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Sanitize HTML input to prevent XSS
 */
export function sanitizeHTML(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Trim and normalize whitespace
 */
export function normalizeWhitespace(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Get form field value safely
 */
export function getFieldValue(fieldId: string): string {
  const field = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement | null;
  return field?.value || '';
}

/**
 * Set form field value
 */
export function setFieldValue(fieldId: string, value: string): void {
  const field = document.getElementById(fieldId) as HTMLInputElement | HTMLTextAreaElement | null;
  if (field) {
    field.value = value;
  }
}

/**
 * Disable form submission
 */
export function disableForm(form: HTMLFormElement): void {
  const submitBtn = form.querySelector('[type="submit"]') as HTMLButtonElement | null;
  if (submitBtn) {
    submitBtn.disabled = true;
  }
}

/**
 * Enable form submission
 */
export function enableForm(form: HTMLFormElement): void {
  const submitBtn = form.querySelector('[type="submit"]') as HTMLButtonElement | null;
  if (submitBtn) {
    submitBtn.disabled = false;
  }
}
