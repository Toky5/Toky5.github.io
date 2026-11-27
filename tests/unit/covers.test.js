/*
 * Couvertures dessinées sur canevas, testées avec des doublures : un contexte 2D qui
 * enregistre les tracés (tests/helpers/recording-context.js) et de faux observateurs
 * et requestAnimationFrame (tests/helpers/browser-doubles.js).
 */
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { CoverRenderer } from '../../assets/js/projects/covers/cover-renderer.js';
import { createCover, hasCover } from '../../assets/js/projects/covers/index.js';
import { createMavilleCover } from '../../assets/js/projects/covers/maville.js';
import { createRagCover } from '../../assets/js/projects/covers/rag.js';
import { installBrowserDoubles } from '../helpers/browser-doubles.js';
import { createRecordingContext } from '../helpers/recording-context.js';

const INK = '#1c1d22';
const MARKER = /^rgba\(242, 224, 90, ([\d.]+)\)$/;

/** Ce qu'une image a dessiné, arrondi au centième, pour un instantané lisible et stable. */
function drawing(context) {
  const round = (value) => (typeof value === 'number' ? Math.round(value * 100) / 100 : value);
  const roundPath = (path) => path.map((segment) => segment.map(round));
  return {
    strokes: context.strokes.map(({ style, width, cap, path }) => ({
      style,
      width: round(width),
      cap,
      path: roundPath(path),
    })),
    fills: context.fills.map(({ style, path }) => ({ style, path: roundPath(path) })),
  };
}

/** Hauteur (y) d'un trait horizontal enregistré (moveTo puis lineTo). */
const strokeY = ({ path }) => path[0][2];

describe('couverture RAG', () => {
  // 260 px de haut : interligne de 20 px, 10 lignes de texte, la première à y = 40.
  const width = 400;
  const height = 260;
  const lineY = (line) => 40 + line * 20;

  function drawAt(time) {
    const context = createRecordingContext();
    createRagCover()(context, width, height, time);
    return context;
  }

  it('écrit une page de 10 lignes de texte', () => {
    const context = drawAt(0);
    const ys = [...new Set(context.strokes.map(strokeY))];
    assert.deepEqual(
      ys,
      Array.from({ length: 10 }, (_, line) => lineY(line)),
    );
  });

  it('surligne entièrement le premier passage (lignes 2 et 3) au début du cycle', () => {
    const context = drawAt(0);

    assert.deepEqual(
      context.fills.map((fill) => fill.style),
      ['rgba(242, 224, 90, 1.000)', 'rgba(242, 224, 90, 1.000)'],
    );
    const inked = context.strokes.filter((stroke) => stroke.style === INK);
    assert.deepEqual(inked.map(strokeY), [lineY(2), lineY(3)]);
    // Ligne surlignée : un seul trait, à l'encre, sur toute sa longueur.
    assert.equal(context.strokes.filter((stroke) => strokeY(stroke) === lineY(2)).length, 1);
  });

  it('laisse les autres lignes en gris clair', () => {
    const context = drawAt(0);
    const grey = context.strokes.filter((stroke) => stroke.style !== INK);
    assert.equal(grey.length, 8);
    for (const stroke of grey) assert.equal(stroke.style, 'rgba(234, 234, 228, 0.34)');
  });

  it('passe au passage suivant à chaque cycle de 3,2 s', () => {
    const inked = drawAt(3.2).strokes.filter((stroke) => stroke.style === INK);
    assert.deepEqual(inked.map(strokeY), [lineY(7), lineY(8), lineY(9)]);
  });

  it('surligne en entier chacun des 4 passages, qui tiennent tous dans la page', () => {
    // Milieu de chaque cycle : le passage est entièrement surligné.
    const inkedLines = [0, 1, 2, 3].map((cycle) =>
      drawAt(cycle * 3.2)
        .strokes.filter((stroke) => stroke.style === INK)
        .map((stroke) => (strokeY(stroke) - 40) / 20),
    );
    assert.deepEqual(inkedLines, [[2, 3], [7, 8, 9], [5], [0, 1]]);
  });

  it('trace des lignes aux bouts arrondis', () => {
    for (const stroke of drawAt(0).strokes) assert.equal(stroke.cap, 'round');
  });

  it('efface le marqueur en fin de cycle et rend le texte au gris', () => {
    const context = drawAt(1.44); // 95 % du cycle
    assert.equal(context.strokes.filter((stroke) => stroke.style === INK).length, 0);
    for (const fill of context.fills) assert.ok(Number(fill.style.match(MARKER)[1]) < 0.5, fill.style);
  });

  it('balaie le passage ligne après ligne : la seconde ligne n’est qu’à moitié surlignée', () => {
    // Balayage à 75 % du passage de deux lignes : la ligne 2 est finie, la ligne 3 à moitié.
    const context = drawAt(12.1145);
    const [full, half] = context.fills.map((fill) => fill.path[1][1] - fill.path[0][1]);
    assert.ok(half > full * 0.4 && half < full * 0.6, `pleine : ${full}, moitié : ${half}`);

    const line3 = context.strokes.filter((stroke) => strokeY(stroke) === lineY(3));
    assert.deepEqual(
      line3.map((stroke) => stroke.style),
      [INK, 'rgba(234, 234, 228, 0.34)'],
    );
  });

  it('dessine la même page d’une couverture à l’autre', () => {
    assert.deepEqual(drawAt(0.7).strokes, drawAt(0.7).strokes);
  });

  it('dessine exactement les images de référence (instantanés)', (t) => {
    t.assert.snapshot(drawing(drawAt(0)));
    t.assert.snapshot(drawing(drawAt(12.1145)));
  });
});

describe('couverture MaVille', () => {
  const width = 500;
  const height = 300;
  const block = 60; // min(500, 300) / 5

  function drawAt(time) {
    const context = createRecordingContext();
    createMavilleCover()(context, width, height, time);
    return context;
  }

  it('tourne le plan autour du centre, puis rétablit le contexte', () => {
    const { calls } = drawAt(0);
    assert.deepEqual(calls, [['save'], ['translate', 250, 150], ['rotate', -0.62], ['restore']]);
  });

  it('trace 21 rues dans chaque sens, puis un boulevard plus épais', () => {
    const [streets, boulevard] = drawAt(0).strokes;
    assert.equal(streets.width, 1);
    assert.equal(streets.path.filter(([command]) => command === 'M').length, 42);
    assert.equal(boulevard.width, 3);
    assert.equal(boulevard.style, 'rgba(234, 234, 228, 0.42)');
  });

  it('signale 5 chantiers par un point et une onde qui s’élargit en pâlissant', () => {
    const atStart = drawAt(0);
    const later = drawAt(0.5);
    const rings = (context) => context.strokes.slice(2);

    assert.equal(rings(atStart).length, 5);
    assert.equal(atStart.fills.filter((fill) => fill.style === 'rgb(242, 224, 90)').length, 5);
    // Premier chantier : l'onde part de 5 px, opaque, puis grandit et pâlit.
    assert.deepEqual(rings(atStart)[0].path[0].slice(3, 4), [5]);
    assert.equal(rings(atStart)[0].style, 'rgba(242, 224, 90, 1.000)');
    assert.equal(rings(later)[0].path[0][3], 5 + 0.3 * block * 0.45);
    assert.equal(rings(later)[0].style, 'rgba(242, 224, 90, 0.700)');
  });

  it('dessine exactement les images de référence (instantanés)', (t) => {
    t.assert.snapshot(drawing(drawAt(0)));
    t.assert.snapshot(drawing(drawAt(1.3)));
  });

  it('fait circuler une demande de travaux le long du boulevard, puis la relance', () => {
    const request = (context) => context.fills.at(-1);
    assert.equal(request(drawAt(0)).style, '#8ea2ff');
    assert.equal(request(drawAt(0)).path[0][1], -3 * block); // départ à gauche
    assert.equal(request(drawAt(25 / 6)).path[0][1], 0); // à mi-chemin après 4,17 s
    assert.equal(request(drawAt(25 / 6 + 25 / 3)).path[0][1], 0); // même point au passage suivant (8,33 s plus tard)
  });

  it('garde des points d’au moins 3 px de rayon, plus grands sur une grande couverture', () => {
    const requestRadius = (size) => {
      const context = createRecordingContext();
      createMavilleCover()(context, size, size, 0);
      return context.fills.at(-1).path[0][3];
    };
    assert.equal(requestRadius(100), 3); // pâté de 20 px : 1 px calculé, ramené à 3
    assert.equal(requestRadius(600), 6); // pâté de 120 px : 5 % = 6 px
  });
});

describe('createCover et hasCover', () => {
  let browser;
  beforeEach(() => {
    browser = installBrowserDoubles();
  });
  afterEach(() => browser.restore());

  it('connaît les couvertures rag et maville, et elles seules', () => {
    assert.equal(hasCover('rag'), true);
    assert.equal(hasCover('maville'), true);
    assert.equal(hasCover('toString'), false);
    assert.equal(hasCover('inconnue'), false);
  });

  it('lance le moteur pour une couverture connue dans un vrai canevas', () => {
    const canvas = {
      clientWidth: 0,
      clientHeight: 0,
      getContext: (type) => (type === '2d' ? createRecordingContext() : null),
    };
    assert.ok(createCover('rag', canvas) instanceof CoverRenderer);
  });

  it('rend null pour un type inconnu ou un canevas absent', () => {
    assert.equal(createCover('inconnue', { getContext: () => ({}) }), null);
    assert.equal(createCover('rag', null), null);
    assert.equal(createCover('rag', {}), null);
  });
});

describe('CoverRenderer', () => {
  let browser;
  let context;
  let canvas;
  let drawn;

  beforeEach(() => {
    browser = installBrowserDoubles({ devicePixelRatio: 3 });
    context = createRecordingContext();
    // Comme un vrai canevas : seul le contexte « 2d » est demandé et fourni.
    canvas = {
      clientWidth: 300,
      clientHeight: 200,
      width: 0,
      height: 0,
      getContext: (type) => (type === '2d' ? context : null),
    };
    drawn = [];
  });
  afterEach(() => browser.restore());

  /** Crée le moteur, puis simule le premier redimensionnement et l'entrée à l'écran. */
  function start({ visible = true } = {}) {
    const renderer = new CoverRenderer(canvas, (...args) => drawn.push(args));
    browser.resizeObservers[0].callback([]);
    browser.intersectionObservers[0].callback([{ isIntersecting: visible }]);
    return renderer;
  }

  it('observe la taille et la visibilité du canevas', () => {
    start();
    assert.ok(browser.resizeObservers[0].targets.has(canvas));
    assert.ok(browser.intersectionObservers[0].targets.has(canvas));
  });

  it('dessine net sur écran haute densité, à 2× au plus', () => {
    start();
    assert.deepEqual([canvas.width, canvas.height], [600, 400]);
    assert.deepEqual(context.calls[0], ['setTransform', 2, 0, 0, 2, 0, 0]);
  });

  it('dessine à 1× quand le navigateur n’indique pas la densité de l’écran', () => {
    globalThis.window.devicePixelRatio = undefined;
    start();
    assert.deepEqual([canvas.width, canvas.height], [300, 200]);
    assert.deepEqual(context.calls[0], ['setTransform', 1, 0, 0, 1, 0, 0]);
  });

  it('ne demande jamais deux images à la fois', () => {
    start();
    browser.resizeObservers[0].callback([]);
    browser.intersectionObservers[0].callback([{ isIntersecting: true }]);
    assert.equal(browser.pendingFrames, 1);
  });

  it('ne dessine rien tant que la couverture n’est pas à l’écran', () => {
    start({ visible: false });
    assert.equal(browser.pendingFrames, 0);
    browser.runFrames(0);
    assert.equal(drawn.length, 0);
  });

  it('anime la couverture visible : le temps avance à chaque image', () => {
    start();
    browser.runFrames(1000);
    browser.runFrames(1016);

    assert.deepEqual(
      drawn.map(([, width, height, time]) => [width, height, Number(time.toFixed(3))]),
      [
        [300, 200, 0],
        [300, 200, 0.016],
      ],
    );
    assert.equal(drawn[0][0], context);
    assert.equal(browser.pendingFrames, 1, 'l’image suivante est demandée');
  });

  it('efface le canevas avant chaque image', () => {
    start();
    browser.runFrames(1000);
    assert.deepEqual(context.calls.at(-1), ['clearRect', 0, 0, 300, 200]);
  });

  it('limite un saut de temps à 50 ms (onglet en arrière-plan)', () => {
    start();
    browser.runFrames(1000);
    browser.runFrames(9000);
    assert.equal(drawn[1][3], 0.05);
  });

  it('s’arrête quand la couverture sort de l’écran', () => {
    start();
    browser.runFrames(1000);
    browser.intersectionObservers[0].callback([{ isIntersecting: false }]);
    browser.runFrames(1016);

    assert.equal(drawn.length, 2);
    assert.equal(browser.pendingFrames, 0);
  });

  it('montre une image fixe, sans animation, si les animations sont réduites', () => {
    browser.reducedMotion.matches = true;
    start();
    browser.runFrames(1000);

    assert.equal(drawn[0][3], 3.2);
    assert.equal(browser.pendingFrames, 0);
  });

  for (const [label, size] of [
    ['sans largeur', { clientWidth: 0 }],
    ['sans hauteur', { clientHeight: 0 }],
  ]) {
    it(`ignore un canevas encore ${label}`, () => {
      Object.assign(canvas, size);
      start();
      assert.deepEqual([canvas.width, canvas.height], [0, 0]);
      assert.deepEqual(context.calls, []);
      assert.equal(browser.pendingFrames, 0);
    });
  }

  it('libère tout à la destruction', () => {
    const renderer = start();
    renderer.destroy();

    assert.equal(browser.pendingFrames, 0);
    assert.ok(browser.resizeObservers[0].disconnected);
    assert.ok(browser.intersectionObservers[0].disconnected);
  });
});
