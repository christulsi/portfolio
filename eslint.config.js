// ESLint 9 flat config.
//
// Migration notes:
// - Replaces .eslintrc.json (deleted in this commit).
// - Drops `eslint-config-airbnb-base` (incompatible with ESLint 9). The handful
//   of airbnb rules we relied on (`prefer-destructuring`, `no-param-reassign`,
//   `no-shadow`, etc.) are re-declared explicitly below.
// - `@typescript-eslint`'s recommended set + `eslint-plugin-astro`'s recommended
//   set + `eslint-plugin-import` provide the rest.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Project-wide rules. Same set as the old .eslintrc.json `rules:` block, with
 * a couple of airbnb-base imports re-declared explicitly.
 */
const projectRules = {
  'import/extensions': ['error', 'ignorePackages', { js: 'never', ts: 'never', astro: 'never' }],
  'import/no-unresolved': ['error', { ignore: ['^astro:.*', '^@astrojs/.*'] }],
  'import/prefer-default-export': 'off',
  'import/order': [
    'error',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc', caseInsensitive: true },
    },
  ],
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    },
  ],
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/explicit-function-return-type': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-non-null-assertion': 'warn',
  // Re-declared from airbnb-base
  'no-param-reassign': ['error', { props: false }],
  'no-use-before-define': 'off',
  '@typescript-eslint/no-use-before-define': [
    'error',
    { functions: false, classes: false, variables: false },
  ],
  'no-shadow': 'off',
  '@typescript-eslint/no-shadow': 'error',
  'prefer-destructuring': ['error', { array: false, object: true }],
  'max-len': ['warn', { code: 100, ignoreUrls: true, ignoreStrings: true }],
};

export default [
  // Ignores must come first in flat config (replaces .eslintignore)
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.astro/**',
      '*.config.js',
      '*.config.mjs',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },

  // Recommended rule sets that come from plugins
  js.configs.recommended,

  // Astro plugin's recommended (covers .astro files; declares its own parser)
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],

  // Plugins, parser & globals declared globally so all rule blocks can reference them
  {
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.json' },
        node: { extensions: ['.js', '.ts', '.astro'] },
      },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
  },

  // TS files: type-aware parser + typescript-eslint recommended
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...projectRules,
    },
  },

  // JS files: project rules but no TS parser
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: {
      ...projectRules,
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // .astro files — parser already set by astro plugin's recommended config
  {
    files: ['**/*.astro'],
    rules: {
      ...projectRules,
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'max-len': 'off',
    },
  },

  // Test files
  {
    files: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', 'vitest.*.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-plusplus': 'off',
      'no-await-in-loop': 'off',
      'no-restricted-syntax': 'off',
      'no-console': 'off',
      'max-len': 'off',
    },
  },

  // Playwright e2e specs
  {
    files: ['e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-plusplus': 'off',
      'no-await-in-loop': 'off',
      'no-restricted-syntax': 'off',
      'no-console': 'off',
      'max-len': 'off',
    },
  },

  // Three.js modules
  {
    files: ['src/scripts/three/**/*.{ts,js}', 'src/scripts/*worker.js'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-plusplus': 'off',
      'no-underscore-dangle': 'off',
      'no-restricted-globals': 'off',
      'import/extensions': 'off',
      'max-len': 'off',
      'func-names': 'off',
      'no-param-reassign': 'off',
      'default-param-last': 'off',
    },
  },

  // Schemas
  {
    files: ['src/schemas/**/*.ts'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },

  // Configs
  {
    files: ['*.config.ts', 'vitest.config.ts', 'playwright.config.ts'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },

  // Prettier — must come last to disable conflicting style rules
  prettierConfig,
];
