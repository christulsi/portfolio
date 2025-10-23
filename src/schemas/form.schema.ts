import { z } from 'zod';

/**
 * Contact Form Validation Schema
 */

export const ContactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must be less than 500 characters'),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

/**
 * Validate contact form data
 * Returns { success: true, data } or { success: false, errors }
 */
export function validateContactForm(
  data: unknown
): { success: true; data: ContactFormData } | { success: false; errors: Record<string, string> } {
  const result = ContactFormSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Transform Zod errors into field-specific error messages
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const field = err.path[0];
    if (field && typeof field === 'string') {
      errors[field] = err.message;
    }
  });

  return { success: false, errors };
}
