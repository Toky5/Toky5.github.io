/* Monte l'îlot React des projets (le contenu <noscript> est remplacé). */
import { createElement as h, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProjectsApp } from './ProjectsApp.js';
import { projects, ui } from './projects-data.js';

export function mountProjects(container) {
  createRoot(container).render(h(StrictMode, null, h(ProjectsApp, { projects, ui })));
}
