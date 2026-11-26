/*
 * Tracés « à main levée » pour les annotations : cercle autour d'un mot,
 * soulignement, filet. Chaque tracé est une suite de points un peu irréguliers,
 * lissée en courbes de Bézier (spline de Catmull-Rom).
 * Les coordonnées sont en pixels, dans la boîte de l'élément annoté ;
 * le tracé peut en déborder (le SVG est en overflow: visible).
 */

/**
 * @param {'circle' | 'underline' | 'rule'} kind
 * @param {number} width  largeur de l'élément annoté
 * @param {number} height hauteur de l'élément annoté
 * @param {() => number} random nombres dans [0, 1[ (voir lib/random.js)
 * @returns {string | null} l'attribut `d` du tracé
 */
export function sketchPath(kind, width, height, random) {
  const shape = shapes[kind];
  if (!shape || width <= 0 || height <= 0) return null;
  return smoothPath(shape(width, height, random));
}

const shapes = {
  /** Un tour et un peu plus autour du mot, comme on entoure une réponse. */
  circle(width, height, random) {
    const centerX = width / 2;
    const centerY = height * 0.54;
    const radiusX = width / 2 + height * 0.16;
    const radiusY = height * 0.52;
    const tilt = spread(random, 0.06);
    const start = -Math.PI * 0.62 + spread(random, 0.12); // en haut à gauche
    const sweep = Math.PI * 2 + 0.6 + random() * 0.3; // le trait dépasse son départ
    const wobble = random() * Math.PI * 2;
    const steps = 24;
    const points = [];

    for (let step = 0; step <= steps; step += 1) {
      const progress = step / steps;
      const angle = start + sweep * progress;
      // La main s'écarte un peu au second passage, et la courbe n'est jamais parfaite.
      const scale = 1 + 0.09 * progress + 0.03 * Math.sin(angle * 2 + wobble) + spread(random, 0.01);
      const x = Math.cos(angle) * radiusX * scale;
      const y = Math.sin(angle) * radiusY * scale;
      points.push([
        centerX + x * Math.cos(tilt) - y * Math.sin(tilt),
        centerY + x * Math.sin(tilt) + y * Math.cos(tilt),
      ]);
    }
    return points;
  },

  /** Un trait sous le mot, qui remonte légèrement vers la droite. */
  underline(width, height, random) {
    const baseline = height * 0.94;
    const startX = -width * 0.03 + spread(random, 2);
    const endX = width * 1.04 + spread(random, 2);
    const rise = height * (0.03 + random() * 0.03);
    const bow = height * 0.02;
    const steps = Math.max(4, Math.round(width / 40));
    const points = [];

    for (let step = 0; step <= steps; step += 1) {
      const progress = step / steps;
      points.push([
        startX + (endX - startX) * progress,
        baseline - rise * progress + bow * Math.sin(Math.PI * progress) + spread(random, 0.7),
      ]);
    }
    return points;
  },

  /** Un filet sur toute la largeur, tiré à la main sans règle. */
  rule(width, height, random) {
    const middle = height / 2;
    const slope = spread(random, 1.5);
    const phase = random() * Math.PI * 2;
    const steps = Math.max(6, Math.round(width / 60));
    const points = [];

    for (let step = 0; step <= steps; step += 1) {
      const progress = step / steps;
      points.push([
        width * progress,
        middle + slope * (progress * 2 - 1) + Math.sin(progress * Math.PI * 3 + phase) + spread(random, 0.6),
      ]);
    }
    return points;
  },
};

/** Valeur aléatoire dans [-amount, amount]. */
function spread(random, amount) {
  return (random() * 2 - 1) * amount;
}

/** Relie les points par une courbe lisse qui passe par chacun d'eux. */
function smoothPath(points) {
  const format = (value) => value.toFixed(1);
  let d = `M${format(points[0][0])} ${format(points[0][1])}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = points[index + 2] ?? next;
    const control1 = [current[0] + (next[0] - previous[0]) / 6, current[1] + (next[1] - previous[1]) / 6];
    const control2 = [next[0] - (afterNext[0] - current[0]) / 6, next[1] - (afterNext[1] - current[1]) / 6];
    d += ` C${control1.map(format).join(' ')} ${control2.map(format).join(' ')} ${format(next[0])} ${format(next[1])}`;
  }
  return d;
}
