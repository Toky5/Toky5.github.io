/* Page 404 (déjà bilingue) : le numéro entouré au stylo et le bouton magnétique. */
import { initDoodles } from './features/doodles.js';
import { initMagnetic } from './features/magnetic.js';

document.documentElement.classList.remove('is-translating'); // rien à traduire ici
initDoodles();
initMagnetic();
