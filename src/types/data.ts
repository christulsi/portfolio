export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
  achievements: string[];
  order?: number;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  client?: string;
  cover?: string;
  outcome?: string;
  order?: number;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  icon: string;
  credentialId?: string;
  verifyUrl?: string;
  order?: number;
}

export interface Testimonial {
  name: string;
  role: string;
  image: string;
  text: string;
}

export interface SkillCategory {
  name: string;
  skills: string[];
}

export interface Skills {
  categories: SkillCategory[];
}
