import { expect, test } from './fixtures.js';

// Sans « #projets » dans l'adresse : le défilement doux vers l'ancre déplacerait les lignes pendant le test.
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.work-row')).toHaveCount(2);
});

test.describe('survol des projets à la souris', () => {
  test.skip(({ isMobile }) => isMobile, 'pas de survol sur écran tactile');

  test('un cercle plein « Voir » suit le curseur, sans aperçu animé', async ({ page }) => {
    const cursor = page.locator('.work-cursor');
    const row = page.locator('.work-row__button').first();
    await expect(cursor).not.toHaveAttribute('data-visible');

    // hover() fait défiler jusqu'à la ligne, attend qu'elle ne bouge plus, puis place la souris en son centre.
    await row.hover();
    const box = await row.boundingBox();
    const target = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

    await expect(cursor).toHaveAttribute('data-visible', '');
    await expect(cursor).toHaveText('Voir');
    await expect(cursor).toHaveCSS('background-color', 'rgb(43, 71, 201)');
    await expect(cursor).toHaveCSS('border-radius', '50%');
    await expect(page.locator('.work-preview, .work-list canvas')).toHaveCount(0);

    // Le cercle rejoint le pointeur (lib/follow.js) : son centre finit sur la souris.
    await expect
      .poll(async () => {
        const [x, y] = (await cursor.evaluate((element) => element.style.translate)).split(' ').map(parseFloat);
        return Math.hypot(x - target.x, y - target.y);
      })
      .toBeLessThan(1);
  });

  test('le cercle disparaît quand la souris quitte la liste', async ({ page }) => {
    await page.locator('.work-row__button').first().hover();
    await expect(page.locator('.work-cursor')).toHaveAttribute('data-visible', '');

    await page.getByRole('heading', { name: 'Projets' }).hover();
    await expect(page.locator('.work-cursor')).not.toHaveAttribute('data-visible');
  });
});

test.describe('fiche projet', () => {
  test('s’ouvre au clic, passe au projet suivant et se ferme avec Échap', async ({ page }) => {
    await page.getByRole('button', { name: /^RAG juridique/ }).click();

    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('heading', { level: 2 })).toHaveText('Assistant RAG juridique et agents LLM');
    await expect(sheet.getByText('Code privé pour l’instant')).toBeVisible();
    await expect(page.locator('.work-cursor[data-visible]')).toHaveCount(0);

    await sheet.getByRole('button', { name: 'Projet suivant : MaVille' }).click();
    await expect(sheet.getByRole('heading', { level: 2 })).toHaveText(
      'MaVille, plateforme citoyenne des travaux publics de Montréal',
    );

    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
  });

  test('se ferme avec le bouton rond', async ({ page }) => {
    await page.getByRole('button', { name: /^MaVille/ }).click();
    await page.getByRole('button', { name: 'Fermer le projet' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

test.describe('sur téléphone', () => {
  test.skip(({ isMobile }) => !isMobile, 'téléphone seulement');

  test('montre la couverture de chaque projet au-dessus de son titre, sans cercle', async ({ page }) => {
    await expect(page.locator('.work-row__cover canvas')).toHaveCount(2);
    await expect(page.locator('.work-cursor')).toHaveCount(0);
  });
});
