/**
 * Petit magasin observable : une valeur et ses abonnés.
 * `get` et `subscribe` sont des fonctions stables, utilisables telles quelles
 * avec useSyncExternalStore de React.
 */
export function createStore(initialValue) {
  let value = initialValue;
  const listeners = new Set();

  return {
    get: () => value,

    set(nextValue) {
      if (Object.is(nextValue, value)) return;
      value = nextValue;
      for (const listener of listeners) listener(value);
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
