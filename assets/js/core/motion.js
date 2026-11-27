/**
 * Préférence système « réduire les animations ».
 * La requête est créée au premier appel : importer ce module ne touche pas au navigateur.
 */
let reducedMotionQuery;

export function prefersReducedMotion() {
  reducedMotionQuery ??= window.matchMedia('(prefers-reduced-motion: reduce)');
  return reducedMotionQuery.matches;
}
