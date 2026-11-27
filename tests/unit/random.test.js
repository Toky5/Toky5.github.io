import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRandom, seedFromText } from '../../assets/js/lib/random.js';

/** Les `count` premiers tirages d'un générateur. */
const draws = (random, count) => Array.from({ length: count }, () => random());

describe('seedFromText (empreinte FNV-1a sur 32 bits)', () => {
  it('donne les valeurs de référence publiées de FNV-1a', () => {
    assert.equal(seedFromText(''), 0x811c9dc5);
    assert.equal(seedFromText('a'), 0xe40c292c);
    assert.equal(seedFromText('foobar'), 0xbf9cf968);
  });

  it('renvoie un entier non signé sur 32 bits', () => {
    for (const text of ['RAG', 'circle:Montréal', 'rule:3', '🖊️']) {
      const seed = seedFromText(text);
      assert.ok(Number.isInteger(seed) && seed >= 0 && seed < 2 ** 32, `${text} → ${seed}`);
    }
  });

  it('distingue deux textes qui ne diffèrent que d’une lettre', () => {
    assert.notEqual(seedFromText('circle:RAG'), seedFromText('circle:RAH'));
  });
});

describe('createRandom (générateur mulberry32)', () => {
  it('rejoue exactement la même suite pour la même graine', () => {
    assert.deepEqual(draws(createRandom(42), 20), draws(createRandom(42), 20));
  });

  it('donne une autre suite pour une autre graine', () => {
    assert.notDeepEqual(draws(createRandom(1), 5), draws(createRandom(2), 5));
  });

  it('garde les mêmes premiers tirages d’une version à l’autre (test de caractérisation)', () => {
    // La couverture RAG utilise la graine 205 : changer ces valeurs changerait son dessin.
    assert.deepEqual(draws(createRandom(205), 3), [0.27770553226582706, 0.9156316630542278, 0.500871340977028]);
    assert.deepEqual(draws(createRandom(0), 2), [0.26642920868471265, 0.0003297457005828619]);
  });

  it('ramène la graine à un entier non signé sur 32 bits', () => {
    assert.deepEqual(draws(createRandom(-1), 5), draws(createRandom(0xffffffff), 5));
    assert.deepEqual(draws(createRandom(7.9), 5), draws(createRandom(7), 5));
  });

  it('tire des nombres dans [0, 1[ répartis à peu près uniformément', () => {
    const values = draws(createRandom(2026), 20_000);
    const buckets = new Array(10).fill(0);

    for (const value of values) {
      assert.ok(value >= 0 && value < 1, `hors de [0, 1[ : ${value}`);
      buckets[Math.floor(value * 10)] += 1;
    }

    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    assert.ok(Math.abs(mean - 0.5) < 0.01, `moyenne ${mean}`);
    for (const count of buckets) assert.ok(count > 1800 && count < 2200, `décile déséquilibré : ${buckets}`);
  });
});
