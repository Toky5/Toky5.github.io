import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { localize } from '../../assets/js/lib/localize.js';

describe('localize', () => {
  const title = { fr: 'RAG juridique', en: 'Legal RAG' };

  it('choisit le texte de la langue demandée', () => {
    assert.equal(localize(title, 'fr'), 'RAG juridique');
    assert.equal(localize(title, 'en'), 'Legal RAG');
  });

  it('rend undefined si la langue manque', () => {
    assert.equal(localize(title, 'de'), undefined);
  });

  it('rend telle quelle une valeur non traduite', () => {
    const stack = ['Python', 'Docker'];
    assert.equal(localize('MaVille', 'en'), 'MaVille');
    assert.equal(localize(stack, 'fr'), stack); // une liste n'est pas un { fr, en }
    assert.equal(localize(205, 'fr'), 205);
    assert.equal(localize(null, 'fr'), null);
    assert.equal(localize(undefined, 'fr'), undefined);
  });
});
