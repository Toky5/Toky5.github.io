/*
 * Point d'entrée : chaque fonctionnalité est initialisée séparément,
 * pour qu'une erreur dans l'une n'empêche pas les autres de fonctionner.
 */
import { initI18n } from './features/i18n.js';
import { initMenu } from './features/menu.js';
import { initMagnetic } from './features/magnetic.js';
import { initDoodles } from './features/doodles.js';
import { initClock } from './features/clock.js';

const features = {
  i18n: initI18n, // en premier : les annotations se posent sur le texte traduit
  menu: initMenu,
  magnetic: initMagnetic,
  doodles: initDoodles,
  clock: initClock,
  year: setCurrentYear,
};

for (const [name, init] of Object.entries(features)) {
  try {
    init();
  } catch (error) {
    console.error(`[${name}]`, error);
  }
}

// L'îlot React est chargé à part : si React ne se charge pas, le reste du site fonctionne.
const projectsRoot = document.querySelector('[data-projects-root]');
if (projectsRoot) {
  import('./projects/mount.js')
    .then(({ mountProjects }) => mountProjects(projectsRoot))
    .catch((error) => console.error('[projects]', error));
}

function setCurrentYear() {
  const year = String(new Date().getFullYear());
  for (const element of document.querySelectorAll('[data-current-year]')) element.textContent = year;
}
