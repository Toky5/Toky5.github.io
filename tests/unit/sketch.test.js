import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createRandom } from '../../assets/js/lib/random.js';
import { sketchPath } from '../../assets/js/lib/sketch.js';

/**
 * Lit un attribut `d` de la forme « Mx y Cx1 y1 x2 y2 x y … ».
 * @returns {{ points: number[][], segments: number, numbers: string[] }}
 *   points : le départ puis l'arrivée de chaque courbe
 */
function readPath(d) {
  assert.match(d, /^M/, 'le tracé commence par M');
  const numbers = d.match(/-?\d+(?:\.\d+)?/g);
  const values = numbers.map(Number);
  const points = [values.slice(0, 2)];
  for (let index = 2; index < values.length; index += 6) points.push(values.slice(index + 4, index + 6));
  return { points, segments: (d.match(/C/g) ?? []).length, numbers };
}

const path = (kind, width, height, seed = 1) => sketchPath(kind, width, height, createRandom(seed));

describe('sketchPath : cas limites', () => {
  it('refuse une forme inconnue', () => {
    assert.equal(path('square', 100, 40), null);
  });

  it('refuse une taille nulle ou négative', () => {
    for (const [width, height] of [
      [0, 40],
      [100, 0],
      [-10, 40],
      [100, -1],
    ]) {
      assert.equal(path('underline', width, height), null, `${width}×${height}`);
    }
  });

  it('accepte la plus petite taille positive', () => {
    assert.notEqual(path('rule', 1, 1), null);
  });
});

describe('sketchPath : forme du tracé', () => {
  it('écrit chaque coordonnée avec une décimale', () => {
    for (const kind of ['circle', 'underline', 'rule']) {
      for (const number of readPath(path(kind, 240, 80)).numbers) {
        assert.match(number, /^-?\d+\.\d$/, `${kind} : ${number}`);
      }
    }
  });

  it('donne le même tracé pour la même graine et un autre pour une autre graine', () => {
    assert.equal(path('circle', 200, 80, 7), path('circle', 200, 80, 7));
    assert.notEqual(path('circle', 200, 80, 7), path('circle', 200, 80, 8));
  });

  it('découpe chaque forme en un nombre de courbes adapté à sa largeur', () => {
    assert.equal(readPath(path('circle', 300, 90)).segments, 24);
    assert.equal(readPath(path('underline', 100, 40)).segments, 4); // au moins 4
    assert.equal(readPath(path('underline', 1000, 40)).segments, 25); // une courbe tous les 40 px
    assert.equal(readPath(path('rule', 100, 14)).segments, 6); // au moins 6
    assert.equal(readPath(path('rule', 1200, 14)).segments, 20); // une courbe tous les 60 px
  });
});

describe('sketchPath : tracés de référence (instantanés)', () => {
  // Les tests de propriétés ci-dessous tolèrent de petits écarts ; ces instantanés figent le tracé exact.
  // Après un changement voulu du dessin : npm run test:update-snapshots
  it('circle', (t) => t.assert.snapshot(path('circle', 120, 40, 1)));
  it('underline', (t) => t.assert.snapshot(path('underline', 200, 40, 2)));
  it('rule', (t) => t.assert.snapshot(path('rule', 300, 14, 3)));
});

describe('sketchPath : circle', () => {
  const width = 320;
  const height = 100;
  const center = [width / 2, height * 0.54];
  const radii = [width / 2 + height * 0.16, height * 0.52];

  it('fait le tour du mot, un peu plus large que lui', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      for (const [x, y] of readPath(path('circle', width, height, seed)).points) {
        const distance = Math.hypot((x - center[0]) / radii[0], (y - center[1]) / radii[1]);
        assert.ok(distance > 0.9 && distance < 1.2, `graine ${seed}, point (${x}, ${y}) : ${distance.toFixed(3)}`);
      }
    }
  });

  it('dépasse son point de départ, comme un cercle tracé à la main', () => {
    const { points } = readPath(path('circle', width, height, 3));
    // Angle mesuré sur l'ellipse ramenée à un cercle (coordonnées divisées par les rayons).
    const angle = (point) => Math.atan2((point[1] - center[1]) / radii[1], (point[0] - center[0]) / radii[0]);
    let turned = 0;
    for (let index = 1; index < points.length; index += 1) {
      const previous = angle(points[index - 1]);
      const current = angle(points[index]);
      let step = current - previous;
      if (step > Math.PI) step -= 2 * Math.PI;
      if (step < -Math.PI) step += 2 * Math.PI;
      turned += step;
    }
    assert.ok(turned > 2 * Math.PI + 0.5 && turned < 2 * Math.PI + 1, `angle parcouru : ${turned.toFixed(2)} rad`);
  });
});

describe('sketchPath : underline', () => {
  const width = 400;
  const height = 100;

  it('reste sous le mot, de part et d’autre de sa largeur', () => {
    for (const seed of [1, 2, 3]) {
      const { points } = readPath(path('underline', width, height, seed));
      for (const [, y] of points) assert.ok(y > height * 0.88 - 1 && y < height * 0.96 + 1, `y = ${y}`);
      assert.ok(points[0][0] < 0 && points.at(-1)[0] > width, 'le trait déborde un peu du mot');
      for (let index = 1; index < points.length; index += 1) assert.ok(points[index][0] > points[index - 1][0]);
    }
  });

  it('remonte légèrement vers la droite', () => {
    for (const seed of [1, 2, 3]) {
      const { points } = readPath(path('underline', width, height, seed));
      assert.ok(points.at(-1)[1] < points[0][1], `graine ${seed}`);
    }
  });
});

describe('sketchPath : rule', () => {
  it('traverse toute la largeur en restant près du milieu', () => {
    const width = 900;
    const height = 14;
    const { points } = readPath(path('rule', width, height, 4));
    assert.deepEqual([points[0][0], points.at(-1)[0]], [0, width]);
    for (const [, y] of points) assert.ok(Math.abs(y - height / 2) <= 3.2, `y = ${y}`);
  });
});
