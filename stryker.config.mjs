/**
 * Tests de mutation (Stryker) : npm run test:mutation
 * Stryker modifie le code un endroit à la fois (un « mutant » : `<` devient `<=`, `&&` devient `||`,
 * un bloc est vidé…) et relance les tests unitaires. Un mutant « tué » fait échouer au moins un test :
 * la preuve que les tests vérifient vraiment ce code, pas seulement qu'ils l'exécutent.
 * Rapport détaillé : reports/mutation/index.html
 *
 * Sont mutés les modules de logique couverts par les tests unitaires ; l'interface
 * (features/, composants React) est vérifiée par les tests E2E.
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  // Le lanceur « command » exécute la commande pour chaque mutant et lit son code de sortie.
  testRunner: 'command',
  commandRunner: { command: 'node --test --test-concurrency=1 "tests/unit/**/*.test.js"' },
  coverageAnalysis: 'off',

  mutate: [
    'assets/js/lib/**/*.js',
    'assets/js/core/**/*.js',
    'assets/js/projects/covers/**/*.js',
    'scripts/lib/**/*.mjs',
  ],
  ignorePatterns: ['coverage', 'reports', 'test-results', 'playwright-report', '*.zip'],

  reporters: ['clear-text', 'progress', 'html'],
  htmlReporter: { fileName: 'reports/mutation/index.html' },
  // En dessous de 75 % de mutants tués, la commande échoue.
  thresholds: { high: 90, low: 80, break: 75 },
  tempDirName: '.stryker-tmp',
};
