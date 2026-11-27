/*
 * `test` de Playwright, avec une vérification de plus après chaque test :
 * aucune erreur dans la console ni d'exception non rattrapée dans la page.
 * Un test peut tolérer une erreur attendue avec
 *   test.use({ expectedErrors: [/motif/] })   (motif comparé à « message @ adresse »)
 */
import { test as base, expect } from '@playwright/test';

/**
 * Type des fixtures ajoutées ou remplacées (pour TypeScript : l'option expectedErrors est déclarée ici).
 * @typedef {import('@playwright/test').PlaywrightTestArgs & import('@playwright/test').PlaywrightTestOptions} TestArgs
 * @typedef {import('@playwright/test').PlaywrightWorkerArgs & import('@playwright/test').PlaywrightWorkerOptions} WorkerArgs
 * @type {import('@playwright/test').Fixtures<{ expectedErrors: RegExp[] }, {}, TestArgs, WorkerArgs>}
 */
const fixtures = {
  expectedErrors: [[], { option: true }],

  page: async ({ page, expectedErrors }, use) => {
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console : ${message.text()} @ ${message.location().url}`);
    });
    page.on('pageerror', (error) => errors.push(`exception : ${error.message}`));

    await use(page);

    const unexpected = errors.filter((error) => !expectedErrors.some((pattern) => pattern.test(error)));
    expect(unexpected, 'erreurs dans la page').toEqual([]);
  },
};

export const test = base.extend(fixtures);

export { expect };
