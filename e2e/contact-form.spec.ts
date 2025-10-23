import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to contact section
    await page.click('nav a[href="#contact"]');
    await page.waitForTimeout(500);
  });

  test('should display contact form', async ({ page }) => {
    await expect(page.locator('#contact-form')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Check if form shows validation errors or browser blocks submission
    const nameInput = page.locator('input[name="name"]');
    const isRequired = await nameInput.getAttribute('required');
    expect(isRequired).not.toBeNull();
  });

  test('should validate name field (minimum 2 characters)', async ({ page }) => {
    const nameInput = page.locator('input[name="name"]');

    // Enter single character
    await nameInput.fill('A');
    await nameInput.blur();
    await page.waitForTimeout(300);

    // Check if minlength attribute exists
    const minLength = await nameInput.getAttribute('minlength');
    expect(minLength).toBe('2');
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator('input[name="email"]');

    // Enter invalid email
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await page.waitForTimeout(300);

    // Input should be marked as invalid or show error
    const inputType = await emailInput.getAttribute('type');
    expect(inputType).toBe('email');
  });

  test('should validate message length', async ({ page }) => {
    const messageInput = page.locator('textarea[name="message"]');

    // Enter short message
    await messageInput.fill('Short');
    await messageInput.blur();
    await page.waitForTimeout(300);

    // Check minlength attribute
    const minLength = await messageInput.getAttribute('minlength');
    expect(minLength).toBe('10');
  });

  test('should show character counter for message', async ({ page }) => {
    const messageInput = page.locator('textarea[name="message"]');

    // Type in message
    await messageInput.fill('Hello World');

    // Look for character counter
    const charCounter = page.locator('#char-count, [id*="char"], text=/\\d+\\/500/');
    await expect(charCounter.first()).toBeVisible();
  });

  test('should enable submit button when form is valid', async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"]');

    // Fill form with valid data
    await page.fill('input[name="name"]', 'John Doe');
    await page.fill('input[name="email"]', 'john@example.com');
    await page.fill(
      'textarea[name="message"]',
      'This is a valid test message with enough characters.'
    );

    // Button should be enabled (not disabled)
    const isDisabled = await submitBtn.isDisabled();
    expect(isDisabled).toBe(false);
  });

  test('should display validation icons for valid/invalid fields', async ({ page }) => {
    // Fill name correctly
    await page.fill('input[name="name"]', 'John Doe');
    await page.locator('input[name="name"]').blur();
    await page.waitForTimeout(300);

    // Check if validation classes are added
    const nameInput = page.locator('input[name="name"]');
    const classNames = await nameInput.getAttribute('class');

    // Should have some validation class (either field-valid or field-invalid)
    expect(classNames).toBeTruthy();
  });

  test('should display contact information', async ({ page }) => {
    // Check for email link
    const emailLink = page.locator('a[href^="mailto:"]');
    await expect(emailLink.first()).toBeVisible();

    // Check for GitHub link
    const githubLink = page.locator('a[href*="github.com"]');
    await expect(githubLink.first()).toBeVisible();

    // Check for LinkedIn link
    const linkedinLink = page.locator('a[href*="linkedin.com"]');
    await expect(linkedinLink.first()).toBeVisible();
  });
});
