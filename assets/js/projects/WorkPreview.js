/*
 * Aperçu flottant du projet survolé et curseur rond « Voir ».
 * Les deux suivent le pointeur avec un léger retard ; l'aperçu penche dans le sens
 * du mouvement, comme une feuille tenue par un coin. Les couvertures défilent
 * verticalement d'un projet à l'autre.
 */
import { createElement as h, useEffect, useRef } from 'react';
import { ProjectCover } from './ProjectCover.js';

const PREVIEW_EASE = 0.11;
const CURSOR_EASE = 0.28;
const MAX_TILT = 7; // degrés

export function WorkPreview({ projects, activeIndex, label }) {
  const previewRef = useRef(null);
  const cursorRef = useRef(null);
  const lastIndexRef = useRef(0);
  if (activeIndex !== null) lastIndexRef.current = activeIndex;

  useFollowPointer(previewRef, cursorRef);

  const visible = activeIndex !== null;
  const index = lastIndexRef.current;

  return h(
    'div',
    { className: 'work-preview-layer', 'aria-hidden': true },
    h(
      'div',
      { ref: previewRef, className: 'work-preview', 'data-visible': visible ? '' : undefined },
      h(
        'div',
        { className: 'work-preview__slides', style: { translate: `0 ${-index * 100}%` } },
        projects.map((project) =>
          h(
            'div',
            { key: project.id, className: 'work-preview__slide', style: { '--cover-bg': project.cover.background } },
            h(ProjectCover, { kind: project.cover.kind }),
          ),
        ),
      ),
    ),
    h('div', { ref: cursorRef, className: 'work-cursor', 'data-visible': visible ? '' : undefined }, label),
  );
}

/** Fait suivre le pointeur aux deux éléments, avec inertie ; l'aperçu penche selon sa vitesse. */
function useFollowPointer(previewRef, cursorRef) {
  useEffect(() => {
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const preview = { ...target };
    const cursor = { ...target };
    let frame = 0;

    const tick = () => {
      frame = 0;
      const dx = target.x - preview.x;
      const dy = target.y - preview.y;
      preview.x += dx * PREVIEW_EASE;
      preview.y += dy * PREVIEW_EASE;
      cursor.x += (target.x - cursor.x) * CURSOR_EASE;
      cursor.y += (target.y - cursor.y) * CURSOR_EASE;

      const previewElement = previewRef.current;
      if (previewElement) {
        const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, dx * 0.06));
        previewElement.style.translate = `${preview.x.toFixed(1)}px ${preview.y.toFixed(1)}px`;
        previewElement.style.rotate = Math.abs(tilt) < 0.2 ? '0deg' : `${tilt.toFixed(2)}deg`;
      }
      if (cursorRef.current) cursorRef.current.style.translate = `${cursor.x.toFixed(1)}px ${cursor.y.toFixed(1)}px`;

      const settled = Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1 && Math.abs(target.x - cursor.x) < 0.1;
      if (!settled) frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, [previewRef, cursorRef]);
}
