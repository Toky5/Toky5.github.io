/*
 * Cercle plein qui suit le curseur au survol des projets (souris uniquement).
 * Il grandit en arrivant sur la liste, rétrécit en la quittant et rejoint
 * le pointeur avec un léger retard (lib/follow.js).
 */
import { createElement as h, useEffect, useRef } from 'react';
import { createFollower } from '../lib/follow.js';

export function WorkCursor({ visible, label }) {
  const cursorRef = useRef(null);
  useFollowPointer(cursorRef);

  return h(
    'div',
    { className: 'work-cursor-layer', 'aria-hidden': true },
    h('div', { ref: cursorRef, className: 'work-cursor', 'data-visible': visible ? '' : undefined }, label),
  );
}

/** Rapproche l'élément du pointeur à chaque image, jusqu'à l'avoir rejoint. */
function useFollowPointer(elementRef) {
  useEffect(() => {
    const follower = createFollower({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    let frame = 0;

    const tick = () => {
      frame = 0;
      const { x, y, settled } = follower.step();
      if (elementRef.current) elementRef.current.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      if (!settled) frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event) => {
      follower.setTarget(event.clientX, event.clientY);
      if (!frame) frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, [elementRef]);
}
