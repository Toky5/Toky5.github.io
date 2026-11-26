/*
 * Couverture du projet MaVille : un plan de rues incliné comme celui de Montréal,
 * des chantiers signalés qui pulsent et une demande de travaux qui circule.
 */
const STREET = 'rgba(234, 234, 228, 0.14)';
const BOULEVARD = 'rgba(234, 234, 228, 0.42)';
const SITE = '242, 224, 90';
const REQUEST = '#8ea2ff';
const GRID_ANGLE = -0.62; // ≈ 35°, le « nord » de Montréal
const SITES = [[-2, -1], [1, -2], [2, 1], [-1, 2], [0, 0]]; // en pâtés de maisons

export function createMavilleCover() {
  return function draw(context, width, height, time) {
    const blockX = Math.min(width, height) / 5;
    const blockY = blockX * 0.62;
    const extent = Math.hypot(width, height);

    context.save();
    context.translate(width / 2, height / 2);
    context.rotate(GRID_ANGLE);

    // Rues
    context.strokeStyle = STREET;
    context.lineWidth = 1;
    context.beginPath();
    for (let k = -10; k <= 10; k += 1) {
      context.moveTo(k * blockX, -extent);
      context.lineTo(k * blockX, extent);
      context.moveTo(-extent, k * blockY);
      context.lineTo(extent, k * blockY);
    }
    context.stroke();

    // Un grand boulevard
    context.strokeStyle = BOULEVARD;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(-extent, 0);
    context.lineTo(extent, 0);
    context.stroke();

    // Chantiers : un point et une onde qui s'élargit
    SITES.forEach(([column, row], index) => {
      const x = column * blockX;
      const y = row * blockY;
      const pulse = (time * 0.6 + index * 0.21) % 1;
      context.strokeStyle = `rgba(${SITE}, ${(1 - pulse).toFixed(3)})`;
      context.lineWidth = 1.5;
      context.beginPath();
      context.arc(x, y, 5 + pulse * blockX * 0.45, 0, Math.PI * 2);
      context.stroke();
      context.fillStyle = `rgb(${SITE})`;
      context.beginPath();
      context.arc(x, y, Math.max(3, blockX * 0.06), 0, Math.PI * 2);
      context.fill();
    });

    // Une demande de travaux qui suit le boulevard, d'un bout à l'autre
    const travel = ((time * 0.12) % 1) * 2 - 1;
    context.fillStyle = REQUEST;
    context.beginPath();
    context.arc(travel * blockX * 3, 0, Math.max(3, blockX * 0.05), 0, Math.PI * 2);
    context.fill();

    context.restore();
  };
}
