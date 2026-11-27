/*
 * Tests de bout en bout (E2E) dans un vrai navigateur : npm run test:e2e
 * Le site est servi par scripts/serve.mjs ; chaque test tourne sur ordinateur et sur téléphone.
 */
import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { outputFolder: 'reports/e2e', open: 'never' }]],

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    // Un visiteur francophone de Montréal ; les tests de langue changent ces réglages.
    locale: 'fr-CA',
    timezoneId: 'America/Toronto',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'ordinateur', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'telephone', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    command: `node scripts/serve.mjs --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
