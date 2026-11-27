import { expect, test } from './fixtures.js';

test.describe('accessibilité', () => {
  test('chaque lien et chaque bouton visibles ont un nom lisible par un lecteur d’écran', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.work-row')).toHaveCount(2);

    const controls = [...(await page.getByRole('link').all()), ...(await page.getByRole('button').all())];
    expect(controls.length).toBeGreaterThan(8);
    for (const control of controls) await expect(control).toHaveAccessibleName(/\S/);
  });

  test('le lien d’évitement apparaît au clavier et mène au contenu', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: 'Aller au contenu' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('la navigation principale est annoncée avec ses liens', async ({ page, isMobile }) => {
    test.skip(isMobile, 'navigation repliée dans le menu sur téléphone');
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toMatchAriaSnapshot(`
      - navigation "Navigation principale":
        - list:
          - listitem:
            - link "Projets"
          - listitem:
            - link "Contact"
          - listitem:
            - button "English version"
    `);
  });

  test.describe('avec « réduire les animations »', () => {
    test.use({ reducedMotion: 'reduce' });

    test('affiche les annotations déjà tracées, sans aucune animation en cours', async ({ page }) => {
      await page.goto('/');
      for (const annotation of await page.locator('#hero-title [data-sketch]').all()) {
        await expect(annotation).toHaveClass(/is-drawn/);
      }
      await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
    });
  });
});
