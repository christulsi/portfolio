export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
  achievements: string[];
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  icon: string;
  credentialId?: string;
  verifyUrl?: string;
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
