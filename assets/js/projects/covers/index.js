/* Associe chaque type de couverture à son dessin. */
import { CoverRenderer } from './cover-renderer.js';
import { createMavilleCover } from './maville.js';
import { createRagCover } from './rag.js';

const factories = {
  rag: createRagCover,
  maville: createMavilleCover,
};

export function createCover(kind, canvas) {
  const factory = factories[kind];
  if (!factory || !canvas?.getContext) return null;
  return new CoverRenderer(canvas, factory());
}
