/*
 * Menu des petits écrans : une feuille en <dialog> qui descend du haut
 * (Échap pour fermer, focus gardé dans la feuille, rendu au bouton à la fermeture).
 */
const CLOSE_DURATION = 800; // ms, comme la transition CSS de la feuille

export function initMenu() {
  const menu = document.querySelector('[data-menu]');
  if (!menu) return;

  const open = () => {
    if (menu.open) return;
    menu.showModal();
    requestAnimationFrame(() => menu.classList.add('is-open'));
  };

  const close = () =>
    new Promise((resolve) => {
      if (!menu.open) return resolve();
      menu.classList.remove('is-open');
      setTimeout(() => {
        menu.close();
        resolve();
      }, CLOSE_DURATION);
    });

  for (const button of document.querySelectorAll('[data-menu-open]')) button.addEventListener('click', open);
  menu.querySelector('[data-menu-close]')?.addEventListener('click', close);

  // Échap : fermeture animée plutôt qu'immédiate.
  menu.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  // Un lien du menu ferme la feuille, puis fait défiler jusqu'à sa section.
  for (const link of menu.querySelectorAll('[data-menu-link]')) {
    link.addEventListener('click', async (event) => {
      event.preventDefault();
      await close();
      document.querySelector(link.hash)?.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', link.hash);
    });
  }

  // La feuille n'existe que sur petit écran : on la ferme si l'écran s'élargit.
  window.matchMedia('(min-width: 50.01rem)').addEventListener('change', (event) => {
    if (event.matches) close();
  });
}
