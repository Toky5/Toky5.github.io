/*
 * Hasard reproductible : avec la même graine, un tracé à main levée garde
 * toujours la même forme, d'une visite à l'autre.
 */

/** Générateur pseudo-aléatoire mulberry32 : renvoie une fonction qui donne un nombre dans [0, 1[. */
export function createRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Graine tirée d'un texte (empreinte FNV-1a sur 32 bits). */
export function seedFromText(text) {
  let hash = 0x811c9dc5;
  for (const character of text) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
