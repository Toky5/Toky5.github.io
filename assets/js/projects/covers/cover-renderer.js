/*
 * Moteur commun des couvertures : taille nette sur tous les écrans, animation
 * seulement quand la couverture est visible, image fixe si les animations sont réduites.
 */
import { prefersReducedMotion } from '../../core/motion.js';

const STILL_TIME = 3.2; // instant affiché quand les animations sont réduites

export class CoverRenderer {
  constructor(canvas, draw) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.draw = draw;
    this.time = 0;
    this.visible = false;
    this.frameId = 0;
    this.lastTimestamp = null;
    this.size = { width: 0, height: 0 };
    this.tick = this.tick.bind(this);

    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
      this.requestFrame();
    });
    this.resizeObserver.observe(canvas);

    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.requestFrame();
    });
    this.intersectionObserver.observe(canvas);
  }

  resize() {
    const { clientWidth: width, clientHeight: height } = this.canvas;
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(width * ratio);
    this.canvas.height = Math.round(height * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.size = { width, height };
  }

  requestFrame() {
    if (this.frameId || !this.visible || !this.size.width) return;
    this.frameId = requestAnimationFrame(this.tick);
  }

  tick(timestamp) {
    this.frameId = 0;
    const reduced = prefersReducedMotion();
    const dt = this.lastTimestamp === null ? 0 : Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = timestamp;
    this.time = reduced ? STILL_TIME : this.time + dt;

    const { width, height } = this.size;
    this.context.clearRect(0, 0, width, height);
    this.draw(this.context, width, height, this.time);

    if (!reduced) this.requestFrame();
    else this.lastTimestamp = null;
  }

  destroy() {
    cancelAnimationFrame(this.frameId);
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
  }
}
