import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { createStore } from '../../assets/js/core/store.js';

describe('createStore', () => {
  it('rend la valeur initiale', () => {
    assert.equal(createStore('fr').get(), 'fr');
  });

  it('prévient chaque abonné avec la nouvelle valeur', () => {
    const store = createStore('fr');
    const first = mock.fn();
    const second = mock.fn();
    store.subscribe(first);
    store.subscribe(second);

    store.set('en');

    assert.equal(store.get(), 'en');
    assert.deepEqual(
      first.mock.calls.map((call) => call.arguments),
      [['en']],
    );
    assert.deepEqual(
      second.mock.calls.map((call) => call.arguments),
      [['en']],
    );
  });

  it('ne prévient personne si la valeur ne change pas', () => {
    const store = createStore('fr');
    const listener = mock.fn();
    store.subscribe(listener);

    store.set('fr');

    assert.equal(listener.mock.callCount(), 0);
  });

  it('compare comme Object.is (NaN égal à NaN, 0 différent de -0)', () => {
    const store = createStore(NaN);
    const listener = mock.fn();
    store.subscribe(listener);

    store.set(NaN);
    assert.equal(listener.mock.callCount(), 0);

    store.set(0);
    store.set(-0);
    assert.equal(listener.mock.callCount(), 2);
  });

  it('cesse de prévenir un abonné désinscrit', () => {
    const store = createStore(1);
    const listener = mock.fn();
    const unsubscribe = store.subscribe(listener);

    store.set(2);
    unsubscribe();
    store.set(3);

    assert.equal(listener.mock.callCount(), 1);
  });

  it('ne prévient qu’une fois un abonné inscrit deux fois', () => {
    const store = createStore(1);
    const listener = mock.fn();
    store.subscribe(listener);
    store.subscribe(listener);

    store.set(2);

    assert.equal(listener.mock.callCount(), 1);
  });

  it('fournit get et subscribe utilisables seuls (useSyncExternalStore)', () => {
    const store = createStore('a');
    const { get, subscribe } = store;
    const listener = mock.fn();
    subscribe(listener);

    store.set('b');

    assert.equal(get(), 'b');
    assert.equal(listener.mock.callCount(), 1);
  });
});
