/*
 * Suivi avec inertie : à chaque image, la position parcourt une part fixe
 * de la distance qui la sépare de sa cible, puis s'y pose quand l'écart
 * devient invisible.
 */
const DEFAULT_EASE = 0.2;
const DEFAULT_PRECISION = 0.1; // px

/**
 * @param {{ x: number, y: number }} start position de départ (et première cible)
 * @param {{ ease?: number, precision?: number }} [options]
 *   ease : part de l'écart rattrapée à chaque image, dans ]0, 1] ;
 *   precision : écart en dessous duquel la cible est atteinte
 */
export function createFollower(start, { ease = DEFAULT_EASE, precision = DEFAULT_PRECISION } = {}) {
  if (!(ease > 0 && ease <= 1)) throw new RangeError(`ease doit être compris dans ]0, 1] (reçu : ${ease})`);

  const position = { x: start.x, y: start.y };
  const target = { x: start.x, y: start.y };

  return {
    setTarget(x, y) {
      target.x = x;
      target.y = y;
    },

    /** Avance d'une image ; `settled` indique que la cible est atteinte. */
    step() {
      position.x += (target.x - position.x) * ease;
      position.y += (target.y - position.y) * ease;

      const settled = Math.abs(target.x - position.x) < precision && Math.abs(target.y - position.y) < precision;
      if (settled) {
        position.x = target.x;
        position.y = target.y;
      }
      return { x: position.x, y: position.y, settled };
    },
  };
}
