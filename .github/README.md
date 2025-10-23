# GitHub Workflows & CI/CD

This directory contains GitHub Actions workflows for automated testing, quality checks, and deployment.

## Workflows Overview

### 1. CI/CD Pipeline (`ci.yml`)

**Main workflow** that runs on every push and pull request.

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main`

**Jobs:**

1. **Code Quality** (`code-quality`)
   - Runs ESLint for code linting
   - Checks code formatting with Prettier
   - TypeScript type checking
   - **Duration:** ~2-3 minutes

2. **Unit Tests** (`unit-tests`)
   - Runs Vitest unit tests
   - Generates coverage reports
   - Uploads coverage to Codecov
   - **Duration:** ~1-2 minutes

3. **Build** (`build`)
   - Builds the Astro site
   - Uploads build artifacts for E2E tests
   - **Duration:** ~1-2 minutes

4. **E2E Tests** (`e2e-tests`)
   - Matrix strategy across 3 browsers:
     - Chromium
     - Firefox
     - WebKit
   - Runs homepage, navigation, and functionality tests
   - **Duration:** ~3-5 minutes per browser

5. **Performance & SEO** (`performance-seo`)
   - Performance budget validation
   - Core Web Vitals checks (LCP, CLS)
   - SEO meta tags validation
   - Structured data verification
   - **Duration:** ~2-3 minutes

6. **Deploy** (`deploy`)
   - **Only runs on main branch**
   - Deploys to GitHub Pages
   - Requires all previous jobs to pass
   - **Duration:** ~1-2 minutes

**Total pipeline time:** ~10-15 minutes

### 2. PR Quality Checks (`pr-checks.yml`)

**Triggers:** On pull request open, synchronize, or reopen

**Jobs:**

1. **PR Title Validation**
   - Enforces Conventional Commits format
   - Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore

2. **Changed Files Detection**
   - Detects which files changed
   - Optimizes which jobs to run
   - Categories: src, tests, docs

3. **Conditional Tests**
   - Runs quick checks only if source code changed
   - Faster feedback for documentation-only changes

4. **Bundle Size Report**
   - Comments on PR with build size
   - Helps track bundle size changes
   - Prevents unexpected bloat

### 3. Dependency Review (`dependency-review.yml`)

**Triggers:** Pull requests to `main`

**Purpose:**

- Reviews dependency changes
- Checks for known vulnerabilities
- Fails on moderate+ severity issues
- Posts security summary on PR

## Setup Requirements

### Repository Settings

1. **Enable GitHub Pages**

   ```
   Settings → Pages → Source: GitHub Actions
   ```

2. **Workflow Permissions**

   ```
   Settings → Actions → General → Workflow permissions
   - Select: "Read and write permissions"
   - Check: "Allow GitHub Actions to create and approve pull requests"
   ```

3. **Environment Setup** (automatic)
   - `github-pages` environment created automatically
   - View at: Settings → Environments

### Optional: Add Secrets

For Codecov integration (optional):

```
Settings → Secrets and variables → Actions
- Name: CODECOV_TOKEN
- Value: <your-codecov-token>
```

## Workflow Status

View workflow runs:

- **Actions tab** in your repository
- Click on workflow name to see details
- Click on specific run to see logs

### Status Badges

Add to your README.md:

```markdown
![CI/CD](https://github.com/christulsi/portfolio/actions/workflows/ci.yml/badge.svg)
![PR Checks](https://github.com/christulsi/portfolio/actions/workflows/pr-checks.yml/badge.svg)
```

## Performance Budgets

The CI/CD pipeline enforces these performance budgets:

| Metric    | Budget  | Current   |
| --------- | ------- | --------- |
| TTFB      | < 800ms | ~3ms ✅   |
| FCP       | < 1.8s  | - ✅      |
| LCP       | < 4s    | ~108ms ✅ |
| CLS       | < 0.25  | 0 ✅      |
| CSS Size  | < 150KB | 8.2KB ✅  |
| JS Size   | < 300KB | 2.4KB ✅  |
| Resources | < 50    | 3 ✅      |

**Pipeline will fail if budgets are exceeded!**

## Troubleshooting

### Workflow Failed

1. Check the Actions tab for detailed logs
2. Click on the failed job to see error details
3. Common issues:
   - Linting errors → Run `npm run lint:fix`
   - Type errors → Run `npm run type-check`
   - Test failures → Run `npm test` locally
   - Build errors → Run `npm run build` locally

### Deployment Failed

1. Verify GitHub Pages is configured correctly
2. Check that the `main` branch protection rules aren't blocking deployment
3. Ensure build artifacts are being created
4. Review deployment logs in the Actions tab

### PR Checks Failed

1. **PR title format** - Use conventional commits:

   ```
   feat: add new feature
   fix: resolve bug
   docs: update readme
   ```

2. **Code quality** - Run locally:

   ```bash
   npm run lint
   npm run format
   npm run type-check
   ```

3. **Tests failing** - Run tests locally:
   ```bash
   npm test
   npm run test:e2e
   ```

## Local Testing

Before pushing, run the full test suite locally:

```bash
# Code quality
npm run lint
npm run format:check
npm run type-check

# Tests
npm test
npm run test:e2e

# Build
npm run build
npm run preview
```

## Maintenance

### Updating Workflows

1. Edit workflow files in `.github/workflows/`
2. Test changes on a feature branch first
3. Use workflow dispatch for manual testing
4. Monitor Actions tab for results

### Updating Dependencies

```bash
# Update all dependencies
npm update

# Update Playwright browsers
npx playwright install

# Check for outdated packages
npm outdated
```

### Caching

Workflows use caching to speed up runs:

- **npm cache** - Cached by `actions/setup-node`
- **Playwright browsers** - Installed once per workflow
- **Build artifacts** - Shared between jobs

Cache is automatically invalidated when dependencies change.

## Documentation

- [CI/CD Pipeline Details](./ci.yml)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)

## Support

For issues or questions:

- 📋 [Open an issue](https://github.com/christulsi/portfolio/issues/new)
- 💬 [Discussions](https://github.com/christulsi/portfolio/discussions)
