/*
 * Doublure de test d'un contexte de canevas 2D : rien n'est dessiné, mais chaque
 * trait (stroke) et chaque remplissage (fill) est enregistré avec son style et son
 * tracé, pour que les tests vérifient ce qu'une couverture aurait dessiné.
 */
export function createRecordingContext() {
  let path = [];

  const context = {
    /** Traits dessinés : { style, width, cap, path } */
    strokes: [],
    /** Remplissages : { style, path } */
    fills: [],
    /** Transformations et effacements, dans l'ordre */
    calls: [],

    strokeStyle: '#000000',
    fillStyle: '#000000',
    lineWidth: 1,
    lineCap: 'butt',

    beginPath() {
      path = [];
    },
    moveTo(x, y) {
      path.push(['M', x, y]);
    },
    lineTo(x, y) {
      path.push(['L', x, y]);
    },
    arc(x, y, radius, startAngle, endAngle) {
      path.push(['A', x, y, radius, startAngle, endAngle]);
    },
    closePath() {
      path.push(['Z']);
    },
    stroke() {
      context.strokes.push({ style: context.strokeStyle, width: context.lineWidth, cap: context.lineCap, path });
    },
    fill() {
      context.fills.push({ style: context.fillStyle, path });
    },

    save() {
      context.calls.push(['save']);
    },
    restore() {
      context.calls.push(['restore']);
    },
    translate(x, y) {
      context.calls.push(['translate', x, y]);
    },
    rotate(angle) {
      context.calls.push(['rotate', angle]);
    },
    setTransform(...matrix) {
      context.calls.push(['setTransform', ...matrix]);
    },
    clearRect(...rect) {
      context.calls.push(['clearRect', ...rect]);
    },
  };

  return context;
}
