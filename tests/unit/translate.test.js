import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { createTranslator, parseAttributeBindings } from '../../assets/js/lib/translate.js';

describe('parseAttributeBindings', () => {
  it('lit une liaison « attribut:clé »', () => {
    assert.deepEqual(parseAttributeBindings('content:meta.description'), [['content', 'meta.description']]);
  });

  it('lit plusieurs liaisons et retire les espaces', () => {
    assert.deepEqual(parseAttributeBindings(' aria-label : nav.label ; title:meta.title '), [
      ['aria-label', 'nav.label'],
      ['title', 'meta.title'],
    ]);
  });

  it('ignore les morceaux vides ou incomplets au lieu de lever une erreur', () => {
    assert.deepEqual(parseAttributeBindings(''), []);
    assert.deepEqual(parseAttributeBindings('content:meta.description;'), [['content', 'meta.description']]);
    assert.deepEqual(parseAttributeBindings('sans-deux-points; :cle; attribut: ;;'), []);
  });

  it('coupe au premier « : » seulement', () => {
    assert.deepEqual(parseAttributeBindings('content:a:b'), [['content', 'a:b']]);
  });
});

describe('createTranslator', () => {
  const english = { 'nav.work': 'Projects', 'contact.text': '' };

  it('rend la traduction de la clé', () => {
    const translate = createTranslator(mock.fn());
    assert.equal(translate(english, 'nav.work'), 'Projects');
  });

  it('rend une traduction vide telle quelle (et non undefined)', () => {
    const translate = createTranslator(mock.fn());
    assert.equal(translate(english, 'contact.text'), '');
  });

  it('garde le texte d’origine sans rien signaler quand il n’y a pas de dictionnaire (français)', () => {
    const onMissing = mock.fn();
    const translate = createTranslator(onMissing);

    assert.equal(translate(undefined, 'nav.work'), undefined);
    assert.equal(onMissing.mock.callCount(), 0);
  });

  it('signale une seule fois chaque clé manquante', () => {
    const onMissing = mock.fn();
    const translate = createTranslator(onMissing);

    assert.equal(translate(english, 'nav.blog'), undefined);
    assert.equal(translate(english, 'nav.blog'), undefined);
    assert.equal(translate(english, 'nav.about'), undefined);

    assert.deepEqual(
      onMissing.mock.calls.map((call) => call.arguments[0]),
      ['nav.blog', 'nav.about'],
    );
  });

  it('ne prend pas les propriétés héritées pour des traductions', () => {
    const onMissing = mock.fn();
    const translate = createTranslator(onMissing);

    for (const key of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      assert.equal(translate(english, key), undefined, key);
    }
    assert.equal(onMissing.mock.callCount(), 4);
  });
});
