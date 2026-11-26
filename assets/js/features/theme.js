/*
 * Thème clair / sombre.
 * boot.js choisit le thème initial ; ce module gère les boutons, mémorise le choix
 * et suit le système tant que l'utilisateur n'a rien choisi.
 */
import { createStore } from '../core/store.js';
import { readPreference, writePreference } from '../core/preferences.js';
import { prefersReducedMotion } from '../core/motion.js';

const root = document.documentElement;
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

/** Thème courant : « light » ou « dark ». */
export const themeStore = createStore(root.dataset.theme === 'dark' ? 'dark' : 'light');

export function initTheme() {
  themeStore.subscribe(applyTheme);
  applyTheme(themeStore.get());

  for (const toggle of document.querySelectorAll('[data-theme-toggle]')) {
    toggle.addEventListener('click', (event) => {
      const nextTheme = themeStore.get() === 'dark' ? 'light' : 'dark';
      writePreference('theme', nextTheme);
      switchTheme(nextTheme, originOf(event));
    });
  }

  systemPrefersDark.addEventListener('change', (event) => {
    if (!readPreference('theme')) themeStore.set(event.matches ? 'dark' : 'light');
  });
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  // Couleur de la barre du navigateur mobile : celle du papier.
  const paperColor = getComputedStyle(root).getPropertyValue('--c-bg').trim();
  document.querySelector('[data-theme-color]')?.setAttribute('content', paperColor);
}

/** Le nouveau thème s'étend en cercle depuis le bouton (repli : changement immédiat). */
function switchTheme(theme, { x, y }) {
  if (!document.startViewTransition || prefersReducedMotion()) {
    themeStore.set(theme);
    return;
  }

  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.classList.add('is-theme-switching');

  const transition = document.startViewTransition(() => themeStore.set(theme));
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.7, 0, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => {});
  transition.finished.finally(() => root.classList.remove('is-theme-switching'));
}

/** Point de départ du cercle : le clic, ou le centre du bouton au clavier. */
function originOf(event) {
  if (event.clientX || event.clientY) return { x: event.clientX, y: event.clientY };
  const rect = event.currentTarget.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}
