/*
 * Analyse statique du JavaScript : npm run lint
 * Les règles recommandées d'ESLint, plus quelques règles qui évitent des erreurs
 * courantes (comparaisons lâches, variables réaffectées par erreur, etc.).
 */
import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'assets/vendor/**',
      'coverage/**',
      'reports/**',
      'test-results/**',
      'playwright-report/**',
      '.stryker-tmp/**',
    ],
  },

  js.configs.recommended,

  {
    rules: {
      curly: ['error', 'multi-line'],
      eqeqeq: ['error', 'always'],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-implicit-coercion': 'error',
      'no-param-reassign': 'error',
      'no-shadow': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
      'prefer-template': 'error',
    },
  },

  // Le site, exécuté dans le navigateur.
  {
    files: ['assets/js/**/*.js'],
    languageOptions: { globals: globals.browser },
  },

  // Script classique lancé avant tout le reste : écrit à l'ancienne pour fonctionner partout.
  {
    files: ['assets/js/boot.js'],
    languageOptions: { sourceType: 'script' },
    rules: {
      'no-unused-vars': ['error', { caughtErrors: 'none' }], // `catch (error)` : `catch {}` est trop récent ici
      'no-var': 'off',
      'object-shorthand': 'off',
      'prefer-template': 'off',
    },
  },

  // Outils et tests, exécutés par Node.
  {
    files: ['scripts/**/*.mjs', 'tests/**/*.js', '*.config.js', '*.config.mjs'],
    languageOptions: { globals: globals.nodeBuiltin },
    rules: { 'no-console': 'off' },
  },

  // Les tests E2E passent aussi des fonctions au navigateur (page.evaluate).
  {
    files: ['tests/e2e/**/*.js'],
    languageOptions: { globals: { ...globals.nodeBuiltin, ...globals.browser } },
  },
];
