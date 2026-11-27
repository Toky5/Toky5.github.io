import assert from 'node:assert/strict';
import { after, describe, it, mock } from 'node:test';

describe('prefersReducedMotion', () => {
  const media = { matches: false };
  const matchMedia = mock.fn(() => media);
  let prefersReducedMotion;

  after(() => {
    delete globalThis.window;
  });

  it('s’importe sans navigateur : la requête n’est créée qu’au premier appel', async () => {
    delete globalThis.window;
    ({ prefersReducedMotion } = await import('../../assets/js/core/motion.js'));
    assert.equal(typeof prefersReducedMotion, 'function');
  });

  it('interroge la préférence système « réduire les animations »', () => {
    globalThis.window = /** @type {any} */ ({ matchMedia }); // doublure : seul matchMedia sert

    assert.equal(prefersReducedMotion(), false);
    assert.deepEqual(matchMedia.mock.calls[0].arguments, ['(prefers-reduced-motion: reduce)']);
  });

  it('suit la préférence quand elle change, sans recréer la requête', () => {
    media.matches = true;
    assert.equal(prefersReducedMotion(), true);

    media.matches = false;
    assert.equal(prefersReducedMotion(), false);
    assert.equal(matchMedia.mock.callCount(), 1);
  });
});
