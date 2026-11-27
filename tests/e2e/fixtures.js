/*
 * `test` de Playwright, avec une vérification de plus après chaque test :
 * aucune erreur dans la console ni d'exception non rattrapée dans la page.
 * Un test peut tolérer une erreur attendue avec
 *   test.use({ expectedErrors: [/motif/] })   (motif comparé à « message @ adresse »)
 */
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
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
});

export { expect };
