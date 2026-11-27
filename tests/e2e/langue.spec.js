import { expect, test } from './fixtures.js';

test.describe('changement de langue', () => {
  test.skip(({ isMobile }) => isMobile, 'bouton de l’en-tête : sur téléphone, il est dans le menu (testé à part)');

  test('passe en anglais puis revient au français sans recharger', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('.site-nav [data-lang-toggle]');

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'I’m interested in building LLM agents and RAG systems in Montréal.',
    );
    await expect(page).toHaveTitle('Toky Erick Rabenantoandro | LLM agents and RAG, Montréal');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /^Toky Erick .* is interested/);
    await expect(page.getByRole('button', { name: /^Legal RAG/ })).toBeVisible();
    await expect(page.locator('[data-clock]')).toHaveText(/^\d{2}:\d{2} [AP]M UTC-[45]$/);

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText('Projets');
    await expect(page.locator('[data-clock]')).toHaveText(/^\d{2}:\d{2} UTC-[45]$/);
  });

  test('retient la langue choisie à la visite suivante', async ({ page }) => {
    await page.goto('/');
    await page.locator('.site-nav [data-lang-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText('Projects');
  });
});

test.describe('visiteur anglophone', () => {
  test.use({ locale: 'en-US' });

  test('voit directement le site en anglais', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(['Projects', 'Drop me a line.']);
  });
});
