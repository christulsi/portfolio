import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';

import {
  CertificationSchema,
  ExperienceSchema,
  ProjectSchema,
  SkillCategorySchema,
  TestimonialSchema,
} from '@schemas/data.schema';

/**
 * Content Collections (Astro 6 Content Layer API).
 *
 * Each collection loads a directory of JSON files via the `glob` loader and
 * validates them against the shared Zod schemas. (Astro 6 removed the legacy
 * `type: 'data'` collections; a `loader` is now required.)
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
  schema: ProjectSchema,
});

const experiences = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/experiences' }),
  schema: ExperienceSchema,
});

const certifications = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/certifications' }),
  schema: CertificationSchema,
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/testimonials' }),
  schema: TestimonialSchema,
});

const skills = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/skills' }),
  schema: SkillCategorySchema,
});

export const collections = { projects, experiences, certifications, testimonials, skills };
