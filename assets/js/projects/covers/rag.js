/*
 * Couverture du projet RAG : une page de texte de loi, dont les passages retrouvés
 * pour répondre à une question sont surlignés l'un après l'autre, au marqueur.
 */
import { createRandom } from '../../lib/random.js';

const TEXT = 'rgba(234, 234, 228, 0.34)';
const TEXT_HIGHLIGHTED = '#1c1d22';
const MARKER = '242, 224, 90';
const CYCLE = 3.2; // secondes par passage retrouvé
const TIME_OFFSET = 1.6; // l'image fixe (animations réduites) montre un passage surligné
// Passages retrouvés : [première ligne, nombre de lignes]
const PASSAGES = [[2, 2], [8, 3], [5, 1], [11, 2]];

export function createRagCover() {
  // Longueur de chaque ligne (en part de la colonne) : fixe d'une visite à l'autre.
  const random = createRandom(205);
  const lineLengths = Array.from({ length: 24 }, (_, index) =>
    index % 6 === 5 ? 0.3 + random() * 0.3 : 0.78 + random() * 0.22,
  );

  return function draw(context, width, height, time) {
    const lineStep = Math.max(12, height / 13);
    const lineCount = Math.floor((height * 0.8) / lineStep);
    const top = (height - (lineCount - 1) * lineStep) / 2;
    const left = width * 0.16;
    const column = width * 0.68;

    const t = time + TIME_OFFSET;
    const [first, count] = PASSAGES[Math.floor(t / CYCLE) % PASSAGES.length];
    const phase = (t % CYCLE) / CYCLE;
    const sweep = smoothstep(0.05, 0.4, phase); // le marqueur parcourt le passage
    const fade = 1 - smoothstep(0.82, 1, phase);

    context.lineCap = 'round';

    for (let line = 0; line < lineCount; line += 1) {
      const y = top + line * lineStep;
      const length = column * lineLengths[line % lineLengths.length];
      // Part du balayage qui revient à cette ligne du passage (0 hors du passage).
      const inPassage = line >= first && line < first + count;
      const lineSweep = inPassage ? Math.min(1, Math.max(0, sweep * count - (line - first))) : 0;

      // Le texte passe à l'encre là où le marqueur est passé.
      let highlighted = 0;
      if (lineSweep > 0) {
        const markerStart = left - lineStep * 0.3;
        const markerLength = (length + lineStep * 0.6) * lineSweep;
        drawMarkerStroke(context, markerStart, y, markerLength, lineStep * 0.92, fade);
        if (fade > 0.5) highlighted = Math.min(length, Math.max(0, markerStart + markerLength - left));
      }

      context.lineWidth = lineStep * 0.26;
      drawTextLine(context, left, left + highlighted, y, TEXT_HIGHLIGHTED);
      drawTextLine(context, left + highlighted, left + length, y, TEXT);
    }
  };
}

/** Une ligne de texte, figurée par un trait arrondi. */
function drawTextLine(context, from, to, y, color) {
  if (to - from < 0.5) return;
  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(from, y);
  context.lineTo(to, y);
  context.stroke();
}

/** Trait de surligneur : pointe biseautée, qui monte d'un rien vers la droite. */
function drawMarkerStroke(context, x, y, length, thickness, opacity) {
  const half = thickness / 2;
  const bevel = thickness * 0.22;
  const rise = Math.min(2, length * 0.004);
  context.fillStyle = `rgba(${MARKER}, ${opacity.toFixed(3)})`;
  context.beginPath();
  context.moveTo(x + bevel, y - half);
  context.lineTo(x + length + bevel, y - half - rise);
  context.lineTo(x + length, y + half - rise);
  context.lineTo(x, y + half);
  context.closePath();
  context.fill();
}

function smoothstep(edge0, edge1, value) {
  const x = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return x * x * (3 - 2 * x);
}
