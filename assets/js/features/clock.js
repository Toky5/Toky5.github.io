/* Heure locale de Montréal dans le pied de page, par exemple « 14:05 UTC-5 ». */
import { formatLocalTime } from '../lib/time.js';
import { langStore } from './i18n.js';

export function initClock() {
  const clock = document.querySelector('[data-clock]');
  if (!clock) return;

  const update = () => {
    clock.textContent = formatLocalTime(new Date(), langStore.get());
  };

  update();
  setInterval(update, 15_000);
  langStore.subscribe(update);
}
