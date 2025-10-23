import { z } from 'zod';

/**
 * Validation schemas for JSON data files
 * These schemas ensure data integrity at build time and runtime
 */

// Experience Schema
export const ExperienceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  period: z.string().min(1, 'Period is required'),
  description: z.string().min(1, 'Description is required'),
  achievements: z.array(z.string()).min(1, 'At least one achievement is required'),
});

export const ExperiencesSchema = z.array(ExperienceSchema);

// Project Schema
export const ProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  liveUrl: z.string().url('Invalid URL').optional(),
  githubUrl: z.string().url('Invalid URL').optional(),
});

export const ProjectsSchema = z.array(ProjectSchema);

// Certification Schema
export const CertificationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  date: z.string().min(1, 'Date is required'),
  icon: z.string().min(1, 'Icon is required'),
  credentialId: z.string().optional(),
  verifyUrl: z.string().url('Invalid verification URL').optional(),
});

export const CertificationsSchema = z.array(CertificationSchema);

// Testimonial Schema
export const TestimonialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  image: z.string().min(1, 'Image is required'),
  text: z.string().min(10, 'Testimonial text must be at least 10 characters'),
});

export const TestimonialsSchema = z.array(TestimonialSchema);

// Skill Category Schema
export const SkillCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

export const SkillsSchema = z.object({
  categories: z.array(SkillCategorySchema).min(1, 'At least one skill category is required'),
});

// Type exports (inferred from schemas)
export type Experience = z.infer<typeof ExperienceSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type Certification = z.infer<typeof CertificationSchema>;
export type Testimonial = z.infer<typeof TestimonialSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type Skills = z.infer<typeof SkillsSchema>;
