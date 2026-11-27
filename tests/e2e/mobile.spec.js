import { expect, test } from './fixtures.js';

test.describe('menu sur téléphone', () => {
  test.skip(({ isMobile }) => !isMobile, 'le menu n’existe que sur petit écran');

  test('s’ouvre, mène à la section choisie et se referme', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();

    const menu = page.getByRole('dialog', { name: 'Menu' });
    await expect(menu).toBeVisible();

    await menu.getByRole('link', { name: 'Contact' }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.locator('#contact-title')).toBeInViewport();
  });

  test('change la langue depuis le menu', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('dialog', { name: 'Menu' }).getByRole('button', { name: 'English' }).click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
  });
});

test.describe('largeur des petits écrans', () => {
  for (const width of [320, 390]) {
    test(`rien ne déborde sur un écran de ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 720 });
      await page.goto('/#contact');

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      for (const link of await page.locator('.contact__links a').all()) {
        const box = await link.boundingBox();
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
    });
  }
});
