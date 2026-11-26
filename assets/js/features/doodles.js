/*
 * Annotations au stylo. Chaque élément [data-sketch="circle|underline|rule"]
 * reçoit un tracé à main levée (lib/sketch.js) qui se dessine quand il entre
 * dans l'écran. data-sketch-delay="300" retarde le tracé (en ms).
 * Le contenu ajouté plus tard (traductions, îlot React) est pris en charge
 * automatiquement ; le tracé suit la taille du mot (polices, redimensionnement).
 */
import { prefersReducedMotion } from '../core/motion.js';
import { createRandom, seedFromText } from '../lib/random.js';
import { sketchPath } from '../lib/sketch.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const FONT_TIMEOUT = 1500; // ms : on n'attend pas les polices plus longtemps
const DURATIONS = { circle: 900, underline: 700, rule: 1100 }; // ms, durée du tracé

const marks = new WeakMap(); // élément annoté → { svg, path, seed, width, height, length }
let attachedCount = 0;
let resizeObserver;
let intersectionObserver;

export function initDoodles() {
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) render(entry.target);
  });
  intersectionObserver = new IntersectionObserver(drawVisible, { rootMargin: '0px 0px -40px 0px', threshold: 1 });

  // La largeur des mots change à l'arrivée des polices : on les attend un peu avant de tracer.
  const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, FONT_TIMEOUT))]).then(() => {
    for (const element of document.querySelectorAll('[data-sketch]')) attach(element);
    new MutationObserver(onMutations).observe(document.body, { childList: true, subtree: true });
  });
}

function attach(element) {
  if (marks.has(element)) return;

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.classList.add('sketch__mark');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('preserveAspectRatio', 'none');
  const path = document.createElementNS(SVG_NS, 'path');
  svg.append(path);
  element.append(svg);

  // Même mot, même tracé ; les filets se distinguent par leur rang dans la page.
  attachedCount += 1;
  const text = element.textContent.trim();
  const seed = seedFromText(`${element.dataset.sketch}:${text || attachedCount}`);
  marks.set(element, { svg, path, seed, width: 0, height: 0, length: 0 });

  render(element);
  resizeObserver.observe(element);
  intersectionObserver.observe(element);
}

function detach(element) {
  if (!marks.has(element)) return;
  resizeObserver.unobserve(element);
  intersectionObserver.unobserve(element);
  marks.delete(element);
}

/** (Re)calcule le tracé à la taille actuelle de l'élément. */
function render(element) {
  const mark = marks.get(element);
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  if (!mark || !width || !height || (width === mark.width && height === mark.height)) return;

  const d = sketchPath(element.dataset.sketch, width, height, createRandom(mark.seed));
  if (!d) return;

  mark.width = width;
  mark.height = height;
  mark.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  mark.path.setAttribute('d', d);
  // Longueur du trait : sert à le cacher puis à le dessiner (voir sketch.css).
  mark.length = Math.ceil(mark.path.getTotalLength()) + 2;
  mark.svg.style.setProperty('--length', String(mark.length));
}

function drawVisible(entries) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    intersectionObserver.unobserve(entry.target);
    draw(entry.target);
  }
}

/** Affiche le tracé ; il se dessine du début à la fin, sauf si les animations sont réduites. */
function draw(element) {
  element.classList.add('is-drawn');
  const mark = marks.get(element);
  if (!mark || prefersReducedMotion()) return;

  const easing = getComputedStyle(document.documentElement).getPropertyValue('--ease-draw').trim() || 'ease-out';
  mark.path.animate([{ strokeDashoffset: `${mark.length + 5}px` }, { strokeDashoffset: '0px' }], {
    duration: DURATIONS[element.dataset.sketch] ?? 900,
    delay: Number(element.dataset.sketchDelay) || 0,
    easing,
    fill: 'backwards', // reste caché pendant le délai
  });
}

function onMutations(records) {
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (!(node instanceof Element)) continue;
      if (node.matches('[data-sketch]')) attach(node);
      for (const element of node.querySelectorAll('[data-sketch]')) attach(element);
    }
    for (const node of record.removedNodes) {
      if (!(node instanceof Element)) continue;
      detach(node);
      for (const element of node.querySelectorAll('[data-sketch]')) detach(element);
    }
  }
}
