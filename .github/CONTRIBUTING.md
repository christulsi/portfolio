# Contributing Guide

Thank you for your interest in contributing to this portfolio project!

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/christulsi/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **View the site**
   Open `http://localhost:4321/portfolio` in your browser

## Code Quality Standards

### Before Committing

Run these commands to ensure code quality:

```bash
# Lint your code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check code formatting
npm run format:check

# Format code automatically
npm run format

# Type checking
npm run type-check

# Run all tests
npm test
npm run test:e2e
```

### Pre-commit Hooks

This project uses Husky for Git hooks:

- **pre-commit**: Runs lint-staged to check staged files
- **commit-msg**: Validates commit message format

Commits must follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes

**Examples:**

```
feat(hero): add animated background particles
fix(navigation): correct mobile menu z-index
docs(readme): update installation instructions
test(e2e): add performance budget tests
```

## Testing

### Unit Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:ci

# Run with UI
npm run test:ui
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Writing Tests

#### E2E Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

#### Test Best Practices

1. Use descriptive test names
2. Keep tests isolated and independent
3. Use data-testid attributes for complex selectors
4. Test user behavior, not implementation details
5. Include accessibility checks where appropriate

## Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests for new features
   - Update documentation as needed

3. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push to your fork**

   ```bash
   git push origin feat/your-feature-name
   ```

5. **Create a Pull Request**
   - Use a clear, descriptive title
   - Follow the PR template
   - Link related issues
   - Request reviews from maintainers

### PR Requirements

- ✅ All tests passing
- ✅ Code quality checks passing
- ✅ No merge conflicts
- ✅ Documentation updated
- ✅ Conventional commit format
- ✅ Performance budgets met

## Architecture

### Project Structure

```
portfolio/
├── .github/          # GitHub Actions workflows
├── e2e/             # E2E tests
├── public/          # Static assets
├── src/
│   ├── components/  # Astro components
│   ├── data/        # JSON data files
│   ├── layouts/     # Page layouts
│   ├── pages/       # Astro pages
│   ├── scripts/     # Client-side scripts
│   ├── styles/      # Global styles
│   └── types/       # TypeScript types
├── tests/           # Unit tests
└── dist/            # Build output
```

### Tech Stack

- **Framework**: Astro 5
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js
- **Testing**: Playwright (E2E), Vitest (Unit)
- **CI/CD**: GitHub Actions
- **Deployment**: GitHub Pages

## Performance Guidelines

### Bundle Size

- Keep JavaScript bundles < 300KB
- CSS files < 150KB
- Total page weight < 1MB

### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Optimization Tips

1. Lazy load images and heavy components
2. Use code splitting for large dependencies
3. Minimize render-blocking resources
4. Optimize images (WebP, proper sizing)
5. Enable compression and caching

## Accessibility

Follow WCAG 2.1 Level AA guidelines:

- Provide alt text for images
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Use semantic HTML
- Add ARIA labels where needed
- Test with screen readers

## Need Help?

- 📚 [Documentation](../README.md)
- 🐛 [Report a Bug](https://github.com/christulsi/portfolio/issues/new?template=bug_report.md)
- 💡 [Request a Feature](https://github.com/christulsi/portfolio/issues/new?template=feature_request.md)
- 💬 [Discussions](https://github.com/christulsi/portfolio/discussions)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
