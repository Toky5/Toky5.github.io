import { expect, test } from './fixtures.js';

test.describe('page d’accueil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('présente la phrase d’accroche et un seul titre principal', async ({ page }) => {
    await expect(page).toHaveTitle('Toky Erick Rabenantoandro | Agents LLM et RAG, Montréal');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Je m’intéresse à la construction d’agents LLM et de systèmes RAG, à Montréal.',
    );
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 2 })).toHaveText(['Projets', 'Écrivez-moi.']);
  });

  test('entoure « RAG » et souligne « Montréal » au stylo', async ({ page }) => {
    const annotations = page.locator('#hero-title [data-sketch]');
    await expect(annotations).toHaveCount(2);
    for (const annotation of await annotations.all()) {
      await expect(annotation).toHaveClass(/is-drawn/);
      await expect(annotation.locator('svg path')).toHaveAttribute('d', /^M[\d.-]+ [\d.-]+ C/);
    }
  });

  test('donne les moyens de contact, dont l’adresse de l’Université de Montréal', async ({ page }) => {
    const links = page.locator('.contact__links a');
    await expect(links).toHaveCount(5);
    await expect(page.getByRole('link', { name: 'te-rabenantoandro@outlook.fr' })).toHaveAttribute(
      'href',
      'mailto:te-rabenantoandro@outlook.fr',
    );
    await expect(page.getByRole('link', { name: 'toky.erick.rabenantoandro@umontreal.ca' })).toHaveAttribute(
      'href',
      'mailto:toky.erick.rabenantoandro@umontreal.ca',
    );
    await expect(page.getByRole('link', { name: 'CV (PDF)' })).toHaveAttribute('download', '');
  });

  test('affiche l’heure de Montréal dans le pied de page', async ({ page }) => {
    await expect(page.locator('[data-clock]')).toHaveText(/^\d{2}:\d{2} UTC-[45]$/);
    await expect(page.locator('[data-current-year]')).toHaveText(String(new Date().getFullYear()));
  });

  test('sert le CV en PDF', async ({ request }) => {
    const response = await request.get('/assets/docs/CV_Toky_Erick_Rabenantoandro.pdf');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('application/pdf');
  });
});

test.describe('tout en clair, même quand le système est en mode sombre', () => {
  test.use({ colorScheme: 'dark' });

  test('garde le papier clair et l’encre foncée jusque dans le pied de page', async ({ page }) => {
    await page.goto('/');
    const paper = 'rgb(241, 241, 236)';
    const ink = 'rgb(28, 29, 34)';

    await expect(page.locator('body')).toHaveCSS('background-color', paper);
    await expect(page.locator('body')).toHaveCSS('color', ink);
    await expect(page.locator('.contact')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(page.locator('.contact__title')).toHaveCSS('color', ink);
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'light only');
    await expect(page.locator('[data-theme-toggle]')).toHaveCount(0);
  });
});

test.describe('page introuvable', () => {
  // Chrome signale en console le statut 404 de la page elle-même : c'est le comportement attendu.
  test.use({ expectedErrors: [/status of 404 \(Not Found\) @ .*\/nimporte-quoi$/] });

  test('répond 404 avec un message bilingue et un retour à l’accueil', async ({ page }) => {
    const response = await page.goto('/nimporte-quoi');
    expect(response?.status()).toBe(404);

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Cette page n’existe pas.');
    await page.getByRole('link', { name: 'Accueil / Home' }).click();
    await expect(page).toHaveURL('/');
  });
});
