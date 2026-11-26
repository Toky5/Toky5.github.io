/*
 * Effet magnétique : les éléments [data-magnetic] suivent légèrement le curseur
 * (valeur optionnelle = intensité, 0.35 par défaut) et reviennent avec un rebond.
 * Délégation d'événements : fonctionne aussi pour les éléments rendus par React.
 * Utilise la propriété CSS `translate`, indépendante de `transform` et `scale`.
 */
import { prefersReducedMotion } from '../core/motion.js';

const DEFAULT_STRENGTH = 0.35;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

export function initMagnetic() {
  let active = null;

  const release = (element) => {
    element.style.removeProperty('translate');
    element.classList.remove('is-magnetic');
  };

  document.addEventListener(
    'pointermove',
    (event) => {
      const enabled = finePointer.matches && !prefersReducedMotion();
      const target = enabled && event.target instanceof Element ? event.target.closest('[data-magnetic]') : null;

      if (target !== active) {
        if (active) release(active);
        active = target;
      }
      if (!active) return;

      const rect = active.getBoundingClientRect();
      const strength = Number(active.dataset.magnetic) || DEFAULT_STRENGTH;
      // Position du curseur par rapport au centre, sans la translation déjà appliquée.
      const [currentX = 0, currentY = 0] = (active.style.translate || '0px 0px').split(' ').map(parseFloat);
      const offsetX = event.clientX - (rect.left - currentX + rect.width / 2);
      const offsetY = event.clientY - (rect.top - currentY + rect.height / 2);

      active.classList.add('is-magnetic');
      active.style.translate = `${(offsetX * strength).toFixed(1)}px ${(offsetY * strength).toFixed(1)}px`;
    },
    { passive: true },
  );

  document.documentElement.addEventListener('pointerleave', () => {
    if (active) release(active);
    active = null;
  });
}
