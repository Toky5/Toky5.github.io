/* Associe chaque type de couverture à son dessin. */
import { CoverRenderer } from './cover-renderer.js';
import { createMavilleCover } from './maville.js';
import { createRagCover } from './rag.js';

const factories = {
  rag: createRagCover,
  maville: createMavilleCover,
};

/** Vrai si une couverture dessinée existe pour ce type (voir projects-data.js). */
export function hasCover(kind) {
  return Object.hasOwn(factories, kind);
}

/** Lance la couverture dans le canevas ; null si le type est inconnu ou le canevas inutilisable. */
export function createCover(kind, canvas) {
  if (!hasCover(kind) || !canvas?.getContext) return null;
  return new CoverRenderer(canvas, factories[kind]());
}
