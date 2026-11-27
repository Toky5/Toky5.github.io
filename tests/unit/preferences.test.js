import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';
import { readPreference, writePreference } from '../../assets/js/core/preferences.js';

const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

/** Remplace localStorage par une doublure le temps d'un test. */
function useStorage(storage) {
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true, writable: true });
}

/** Stockage en mémoire qui se comporte comme localStorage. */
function memoryStorage() {
  const items = new Map();
  return {
    items,
    getItem: mock.fn((key) => (items.has(key) ? items.get(key) : null)),
    setItem: mock.fn((key, value) => items.set(key, String(value))),
  };
}

afterEach(() => {
  if (original) Object.defineProperty(globalThis, 'localStorage', original);
  else delete globalThis.localStorage;
});

describe('préférences mémorisées', () => {
  it('écrit puis relit une préférence sous le préfixe du site', () => {
    const storage = memoryStorage();
    useStorage(storage);

    writePreference('lang', 'en');

    assert.deepEqual([...storage.items], [['portfolio:lang', 'en']]);
    assert.equal(readPreference('lang'), 'en');
  });

  it('rend null pour une préférence jamais choisie', () => {
    useStorage(memoryStorage());
    assert.equal(readPreference('lang'), null);
  });

  it('rend null sans erreur quand le navigateur bloque le stockage', () => {
    useStorage({
      getItem: () => {
        throw new DOMException('Accès refusé', 'SecurityError');
      },
    });
    assert.equal(readPreference('lang'), null);
  });

  it('ignore une écriture refusée (stockage plein ou bloqué)', () => {
    useStorage({
      setItem: () => {
        throw new DOMException('Stockage plein', 'QuotaExceededError');
      },
    });
    assert.doesNotThrow(() => writePreference('lang', 'fr'));
  });

  it('fonctionne aussi sans aucun localStorage', () => {
    delete globalThis.localStorage;
    assert.equal(readPreference('lang'), null);
    assert.doesNotThrow(() => writePreference('lang', 'fr'));
  });
});
