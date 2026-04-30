/**
 * JSON-LD Person schema for SEO. Imported into Layout.astro and stamped via
 * <script type="application/ld+json"> on every page.
 */
export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Chris Tulsi',
  jobTitle: 'Senior ICT Engineer',
  description:
    'Software Engineer specializing in ERP systems, data engineering, and AI/ML solutions. AWS Certified Cloud Practitioner with expertise in building scalable software for government and enterprise clients.',
  url: 'https://christulsi.github.io/portfolio',
  image: 'https://christulsi.github.io/portfolio/og-image.png',
  sameAs: ['https://github.com/christulsi', 'https://linkedin.com/in/christulsi'],
  alumniOf: [
    {
      '@type': 'EducationalOrganization',
      name: 'Nankai University',
      description: "Master's Degree in Computer Software Engineering",
    },
    {
      '@type': 'EducationalOrganization',
      name: 'University of Guyana',
      description: "Bachelor's Degree in Computer Science",
    },
  ],
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    name: 'AWS Certified Cloud Practitioner',
    credentialCategory: 'certification',
    recognizedBy: {
      '@type': 'Organization',
      name: 'Amazon Web Services',
    },
  },
  knowsAbout: [
    'Software Engineering',
    'Cloud Computing',
    'DevOps',
    'Data Engineering',
    'Artificial Intelligence',
    'Machine Learning',
    'ERP Systems',
    'Python',
    'JavaScript',
    'AWS',
    'Docker',
    'CI/CD',
  ],
  worksFor: {
    '@type': 'Organization',
    name: 'National Data Management Authority',
  },
} as const;
