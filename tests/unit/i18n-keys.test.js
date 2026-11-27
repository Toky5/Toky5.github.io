/*
 * Contrat entre index.html (français) et i18n/en.js (anglais) : chaque texte
 * traduisible de la page a sa traduction, et chaque traduction sert encore.
 * (Remplace l'ancien script scripts/check-i18n.mjs.)
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import english from '../../assets/js/i18n/en.js';
import { parseAttributeBindings } from '../../assets/js/lib/translate.js';

const html = await readFile(new URL('../../index.html', import.meta.url), 'utf8');

/** Clés utilisées par la page, quel que soit l'attribut. */
function usedKeys() {
  const keys = new Set();
  for (const [, key] of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) keys.add(key);
  for (const [, spec] of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
    for (const [, key] of parseAttributeBindings(spec)) keys.add(key);
  }
  return keys;
}

/** Contenu HTML français des éléments data-i18n-html, par clé. */
function frenchHtml() {
  const contents = new Map();
  for (const [, , key, content] of html.matchAll(/<(\w+)\b[^>]*\bdata-i18n-html="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) {
    contents.set(key, content);
  }
  return contents;
}

/** Les annotations d'un fragment, dans l'ordre : ['circle', 'underline', …]. */
const sketches = (fragment) => [...fragment.matchAll(/data-sketch="([^"]+)"/g)].map(([, kind]) => kind);

describe('traductions anglaises', () => {
  const keys = usedKeys();

  it('la page utilise des clés de traduction', () => {
    assert.ok(keys.size > 10, `${keys.size} clés seulement`);
  });

  it('chaque clé de la page a sa traduction', () => {
    const missing = [...keys].filter((key) => !Object.hasOwn(english, key));
    assert.deepEqual(missing, [], `traductions manquantes : ${missing.join(', ')}`);
  });

  it('chaque traduction sert encore à la page', () => {
    const unused = Object.keys(english).filter((key) => !keys.has(key));
    assert.deepEqual(unused, [], `traductions inutilisées : ${unused.join(', ')}`);
  });

  it('chaque traduction est un texte non vide, avec l’apostrophe typographique', () => {
    for (const [key, value] of Object.entries(english)) {
      assert.ok(typeof value === 'string' && value.trim(), key);
      assert.doesNotMatch(value, /'/, `apostrophe droite dans ${key}`);
    }
  });

  it('les phrases annotées gardent les mêmes annotations dans les deux langues', () => {
    const contents = frenchHtml();
    assert.ok(contents.size >= 3, 'phrases annotées introuvables dans index.html');
    for (const [key, french] of contents) {
      assert.deepEqual(sketches(english[key]), sketches(french), key);
    }
  });
});
