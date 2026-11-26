/* Couverture animée d'un projet : un canevas dessiné par covers/ (aucune image). */
import { createElement as h, useEffect, useRef } from 'react';
import { createCover } from './covers/index.js';

export function ProjectCover({ kind }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cover = createCover(kind, canvasRef.current);
    return () => cover?.destroy();
  }, [kind]);

  return h('canvas', { ref: canvasRef, className: 'cover', 'aria-hidden': true });
}
