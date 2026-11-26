/* Heure locale de Montréal dans le pied de page, par exemple « 11:02 UTC-5 ». */
import { langStore } from './i18n.js';

const TIME_ZONE = 'America/Toronto'; // même fuseau que Montréal

export function initClock() {
  const clock = document.querySelector('[data-clock]');
  if (!clock) return;

  const update = () => {
    clock.textContent = formatTime(new Date(), langStore.get());
  };

  update();
  setInterval(update, 15_000);
  langStore.subscribe(update);
}

function formatTime(date, lang) {
  const time = new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: lang !== 'fr',
    timeZone: TIME_ZONE,
  })
    .format(date)
    .replace(' h ', ':');

  const offset = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, timeZoneName: 'shortOffset' })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value.replace('GMT', 'UTC');

  return offset ? `${time} ${offset}` : time;
}
