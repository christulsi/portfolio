import { defineCollection } from 'astro:content';

import {
  ProjectSchema,
  ExperienceSchema,
  CertificationSchema,
  TestimonialSchema,
  SkillCategorySchema,
} from '@schemas/data.schema';

/**
 * Content Collections configuration
 * Uses Zod schemas for type-safe content validation at build time
 */

const projects = defineCollection({
  type: 'data',
  schema: ProjectSchema,
});

const experiences = defineCollection({
  type: 'data',
  schema: ExperienceSchema,
});

const certifications = defineCollection({
  type: 'data',
  schema: CertificationSchema,
});

const testimonials = defineCollection({
  type: 'data',
  schema: TestimonialSchema,
});

const skills = defineCollection({
  type: 'data',
  schema: SkillCategorySchema,
});

export const collections = {
  projects,
  experiences,
  certifications,
  testimonials,
  skills,
};
