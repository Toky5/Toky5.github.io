/** Préférence système « réduire les animations ». */
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

export function prefersReducedMotion() {
  return reducedMotionQuery.matches;
}
