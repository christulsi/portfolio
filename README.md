# Software Engineer Portfolio

A modern, responsive portfolio website built with [Astro](https://astro.build) - a static site generator optimized for speed and performance.

## 🚀 Features

### Design & UX

- **Modern Design**: Clean, professional layout with smooth animations
- **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes with persistence
- **3D Particle Animation**: Three.js powered hero section with morphing geometry
- **Accessible**: WCAG compliant with proper ARIA labels and keyboard navigation

### Performance & SEO

- **Static Site**: Lightning-fast loading times and excellent SEO
- **Optimized**: Compressed assets, code splitting, and lazy loading
- **Progressive**: Degrades gracefully with reduced motion support

### Developer Experience

- **TypeScript**: Full type safety with strict mode enabled
- **Code Quality**: ESLint + Prettier with pre-commit hooks
- **Testing**: Vitest (unit) + Playwright (E2E, chromium in CI) — coverage thresholds enforced in `vitest.config.ts` (currently 80% lines / 75% functions / 70% branches / 80% statements)
- **Validation**: Zod schemas for runtime type safety
- **Modular**: Clean architecture with separation of concerns

### Sections

- **Hero** - Bento grid: oversized name, current role (from the experiences collection), live local time in Guyana, and key figures
- **Projects** - Bento grid of featured work, ordered by `order`, with client and headline outcome
- **About** - Biography and toolkit grouped by category
- **Experience** - Reverse-chronological timeline with role achievements
- **Certifications** - Education and professional credentials
- **Testimonials** - Colleague and client recommendations
- **Contact** - Validated form with real-time feedback and toast notifications
- **Footer** - Social links and attribution
- **Scroll-to-top** - Button for quick navigation
- **Background** - Site-wide three.js constellation, recolored per theme

### Design system

Tokens live in one place: CSS variables in [src/layouts/Layout.astro](src/layouts/Layout.astro), exposed to Tailwind as `canvas`, `surface`, `sunken`, `ink`, `muted`, `line`, `link`, `gold` and `forest` (see [tailwind.config.mjs](tailwind.config.mjs)), so one class works in light and dark mode. The palette takes the forest green and gold of Guyana's Golden Arrowhead. Type is Archivo throughout; `.font-display` stretches it to its widest cut for headings. Tiles (`.tile` plus `.tile-surface`, `.tile-sunken`, `.tile-forest` or `.tile-gold`) build the bento layouts. Run `npm run generate:images` after brand changes to re-render the OG image and PNG icons.

## 📁 Project Structure

```
portfolio-site/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI/CD pipeline with quality checks
│       ├── pr-checks.yml       # Pull request validation
│       └── dependency-review.yml
├── .husky/                     # Git hooks for code quality
│   ├── pre-commit             # Runs linting and formatting
│   ├── pre-push               # Runs type checking
│   └── commit-msg             # Validates commit messages
├── public/                     # Static assets
│   ├── favicon.svg
│   └── site.webmanifest
├── src/
│   ├── components/             # Astro UI components
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Projects.astro
│   │   ├── ProjectCard.astro
│   │   ├── Experience.astro
│   │   ├── Certifications.astro
│   │   ├── Testimonials.astro
│   │   ├── Contact.astro
│   │   ├── Footer.astro
│   │   ├── ScrollToTop.astro
│   │   └── Toast.astro
│   ├── content/                # Astro content collections (typed JSON)
│   │   ├── config.ts           # Collection schemas (Zod)
│   │   ├── projects/*.json
│   │   ├── experiences/*.json
│   │   ├── certifications/*.json
│   │   ├── skills/*.json
│   │   └── testimonials/*.json
│   ├── layouts/
│   │   └── Layout.astro       # Main page layout
│   ├── pages/
│   │   ├── index.astro        # Homepage
│   │   └── 404.astro          # Error page
│   ├── schemas/                # Zod validation schemas
│   │   ├── data.schema.ts
│   │   ├── form.schema.ts
│   │   └── index.ts
│   ├── scripts/                # JavaScript/TypeScript
│   │   ├── three/             # Modular Three.js architecture
│   │   │   ├── index.ts
│   │   │   ├── core.ts
│   │   │   ├── particles.ts
│   │   │   ├── shaders.ts
│   │   │   ├── effects.ts
│   │   │   ├── controls.ts
│   │   │   ├── theme.ts
│   │   │   ├── performance.ts
│   │   │   ├── utils.ts
│   │   │   ├── constants.ts
│   │   │   └── types.ts
│   │   ├── three-hero-entry.js
│   │   └── three-hero-worker.js
│   ├── types/                  # TypeScript type definitions
│   │   └── data.ts
│   └── utils/                  # Utility functions
│       ├── animation.ts
│       ├── constants.ts
│       ├── dom.ts
│       ├── form.ts
│       ├── storage.ts
│       ├── theme.ts
│       └── index.ts
├── .eslintrc.json             # ESLint configuration
├── .prettierrc.json           # Prettier configuration
├── astro.config.mjs           # Astro configuration
├── commitlint.config.cjs      # Commit message linting
├── package.json               # Dependencies and scripts
├── tailwind.config.mjs        # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── vitest.config.ts           # Vitest test configuration
└── vitest.setup.ts            # Test setup file
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:

```bash
cd portfolio-site
```

2. Install dependencies (already done during setup):

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and visit `http://localhost:4321`

## 🎨 Customization

### Personal Information

1. **Hero Section** - Edit [src/components/Hero.astro](src/components/Hero.astro):
   - Change the tagline, call-to-action buttons and the key figures (`figures`)
   - The "since" tile reads the current role from the experiences collection

2. **About Section** - Edit [src/components/About.astro](src/components/About.astro) and `src/content/skills/*.json`:
   - Update biography text
   - Add/modify skill categories in the JSON files

3. **Projects** - Edit `src/content/projects/*.json`:
   - Titles, descriptions, technologies and links; optional `client`, `outcome` (shown as a gold pill) and `order` (display position)

4. **Experience** - Edit `src/content/experiences/*.json`:
   - Job titles, companies, periods and achievements; set `order` so the newest role comes first

5. **Certifications** - Edit `src/content/certifications/*.json`:
   - Professional certifications and degrees; `order` controls position (the first gets the gold tile)

6. **Testimonials** - Edit `src/content/testimonials/*.json`:
   - Recommendations with names and roles

7. **Contact & Footer** - Edit [src/components/Contact.astro](src/components/Contact.astro) and [src/components/Footer.astro](src/components/Footer.astro):
   - Update email addresses
   - Add your GitHub, LinkedIn, Twitter, and other social media links

8. **Site Metadata** - Edit [astro.config.mjs](astro.config.mjs):
   - Update the `site` field with your actual domain
   - Update the `base` path for your deployment

## 🚢 Deployment

This site is configured as a static site and can be deployed to various platforms:

### Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Connect your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

The contact form will automatically work with Netlify Forms (no backend needed).

### Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Astro settings
6. Click "Deploy"

### GitHub Pages (Automated with GitHub Actions)

This site is pre-configured for automatic deployment to GitHub Pages!

**Initial Setup:**

1. Create a new repository on GitHub (e.g., `portfolio-site`)

2. Update [astro.config.mjs](astro.config.mjs) with your details:

   ```js
   site: 'https://yourusername.github.io',
   base: '/repository-name', // Use '/repository-name' for project repos, or '/' for username.github.io repos
   ```

3. Push your code to GitHub:

   ```bash
   git remote add origin https://github.com/yourusername/repository-name.git
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

4. Enable GitHub Pages in repository settings:
   - Go to Settings > Pages
   - Under "Build and deployment"
   - Source: Select "GitHub Actions"
   - Save

5. The site will automatically deploy when you push to the `main` or `master` branch!

**Deployment Workflow:**

The included `.github/workflows/ci.yml` file automatically:

- Runs linting, type checking, and tests
- Builds your Astro site on every push
- Deploys to GitHub Pages (when configured)
- Uses Node.js 20 for optimal performance
- Caches dependencies for faster builds

**Access Your Site:**

- Project repo: `https://yourusername.github.io/repository-name`
- User/org repo (`username.github.io`): `https://yourusername.github.io`

**Custom Domain (Optional):**

- Add a `CNAME` file to `/public` with your domain
- Update DNS settings with your domain provider
- Update `site` and `base` in `astro.config.mjs`

### Other Platforms

This static site can also be deployed to:

- **Cloudflare Pages**
- **AWS S3 + CloudFront**
- **Firebase Hosting**
- **Render**

## 📝 Available Commands

| Command                   | Action                                 |
| ------------------------- | -------------------------------------- |
| `npm install`             | Install dependencies                   |
| `npm run dev`             | Start dev server at `localhost:4321`   |
| `npm run build`           | Build production site to `./dist/`     |
| `npm run preview`         | Preview production build locally       |
| `npm run lint`            | Lint code with ESLint                  |
| `npm run lint:fix`        | Automatically fix linting issues       |
| `npm run format`          | Format code with Prettier              |
| `npm run format:check`    | Check code formatting                  |
| `npm run type-check`      | Run TypeScript type checking           |
| `npm test`                | Run tests in watch mode                |
| `npm run test:ci`         | Run tests with coverage report         |
| `npm run test:ui`         | Open Vitest UI for interactive testing |
| `npm run analyze`         | Analyze bundle size                    |
| `npm run test:e2e`        | Run Playwright E2E tests               |
| `npm run test:e2e:ui`     | Run E2E tests in UI mode               |
| `npm run test:e2e:headed` | Run E2E tests with browser visible     |
| `npm run test:e2e:debug`  | Debug E2E tests interactively          |
| `npm run test:e2e:report` | View E2E test results report           |

## 🧪 Development Workflow

### Code Quality

This project maintains high code quality standards with automated checks:

1. **Pre-commit Hooks**: Automatically runs before each commit
   - Lints and formats staged files
   - Fixes auto-fixable issues
   - Prevents commits with errors

2. **Pre-push Hooks**: Runs before pushing to remote
   - Type checks entire codebase
   - Ensures no TypeScript errors

3. **Commit Message Validation**: Enforces conventional commits
   - Format: `type(scope): subject`
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - Example: `feat: Add dark mode toggle`

### Running Tests

**Unit Tests:**

```bash
# Run tests in watch mode
npm test

# Run tests once with coverage
npm run test:ci

# Open interactive test UI
npm run test:ui
```

**E2E Tests:**

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed

# Debug tests interactively
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

The E2E test suite includes:

- **Accessibility** - WCAG compliance, ARIA labels, keyboard navigation
- **Contact Form** - Validation, submission, error handling
- **Homepage** - Core functionality and interactions
- **Mobile** - Responsive design and mobile-specific features
- **Performance** - Load times, Core Web Vitals
- **SEO** - Meta tags, structured data, sitemap
- **Theme** - Dark/light mode switching and persistence

### Code Style

```bash
# Check linting
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Format all files
npm run format
```

### Type Safety

```bash
# Run TypeScript type check
npm run type-check
```

## 🏗️ Architecture

### Three.js Module System

The 3D particle animation is built with a clean modular architecture:

- **`core.ts`**: Scene, camera, and renderer setup
- **`particles.ts`**: Particle system and geometry generation
- **`shaders.ts`**: GLSL vertex and fragment shaders
- **`effects.ts`**: Post-processing bloom effects
- **`controls.ts`**: User interaction (pointer, scroll)
- **`theme.ts`**: Theme-aware color management
- **`performance.ts`**: FPS monitoring and degradation
- **`utils.ts`**: Helper functions and calculations

### Utility Library

Reusable utilities for common operations:

- **`animation.ts`**: Easing functions, lerp, scroll observers
- **`dom.ts`**: DOM manipulation helpers
- **`form.ts`**: Form validation and serialization
- **`storage.ts`**: Type-safe localStorage wrapper
- **`theme.ts`**: Theme management and persistence

### Validation with Zod

Runtime type validation for:

- Contact form inputs
- JSON data files (projects, experiences, etc.)
- API responses

## 🎯 Build Output

Running `npm run build` creates a static site in the `dist/` directory that can be deployed to any static hosting service.

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork this project and customize it for your own portfolio!

---

Built with ❤️ using [Astro](https://astro.build)
