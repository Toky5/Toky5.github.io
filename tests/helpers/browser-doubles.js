/*
 * Doublures des API du navigateur dont dépend le moteur des couvertures :
 * window (matchMedia, devicePixelRatio), ResizeObserver, IntersectionObserver
 * et requestAnimationFrame. Les tests déclenchent eux-mêmes les rappels
 * (redimensionnement, visibilité, image suivante) au lieu d'attendre le navigateur.
 */
const GLOBAL_NAMES = [
  'window',
  'ResizeObserver',
  'IntersectionObserver',
  'requestAnimationFrame',
  'cancelAnimationFrame',
];

// Un seul objet pour tous les tests d'un fichier : core/motion.js garde la requête
// obtenue au premier appel, comme le ferait le navigateur.
const reducedMotion = { matches: false };

export function installBrowserDoubles({ devicePixelRatio = 1 } = {}) {
  const saved = new Map(GLOBAL_NAMES.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));

  reducedMotion.matches = false;
  const resizeObservers = [];
  const intersectionObservers = [];
  const frames = new Map();
  let nextFrameId = 1;

  class FakeObserver {
    constructor(callback) {
      this.callback = callback;
      this.targets = new Set();
      this.disconnected = false;
    }
    observe(target) {
      this.targets.add(target);
    }
    unobserve(target) {
      this.targets.delete(target);
    }
    disconnect() {
      this.disconnected = true;
      this.targets.clear();
    }
  }

  const doubles = {
    window: {
      devicePixelRatio,
      matchMedia: (query) => (query === '(prefers-reduced-motion: reduce)' ? reducedMotion : { matches: false }),
    },
    ResizeObserver: class extends FakeObserver {
      constructor(callback) {
        super(callback);
        resizeObservers.push(this);
      }
    },
    IntersectionObserver: class extends FakeObserver {
      constructor(callback) {
        super(callback);
        intersectionObservers.push(this);
      }
    },
    requestAnimationFrame(callback) {
      const id = nextFrameId++;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) {
      frames.delete(id);
    },
  };

  for (const name of GLOBAL_NAMES) {
    Object.defineProperty(globalThis, name, { value: doubles[name], configurable: true, writable: true });
  }

  return {
    reducedMotion,
    resizeObservers,
    intersectionObservers,

    /** Nombre d'images demandées et pas encore jouées. */
    get pendingFrames() {
      return frames.size;
    },

    /** Joue les images en attente, comme le navigateur au prochain rafraîchissement. */
    runFrames(timestamp) {
      const callbacks = [...frames.values()];
      frames.clear();
      for (const callback of callbacks) callback(timestamp);
    },

    /** Remet les vrais objets globaux (ou leur absence). */
    restore() {
      for (const [name, descriptor] of saved) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else delete globalThis[name];
      }
    },
  };
}
