/*
 * Heure locale d'un fuseau au format court du pied de page :
 * « 14:05 UTC-5 » en français, « 02:05 PM UTC-5 » en anglais.
 */
export const MONTREAL_TIME_ZONE = 'America/Toronto'; // même fuseau que Montréal

/**
 * @param {Date} date
 * @param {string} lang 'fr' pour le français ; toute autre langue donne l'anglais
 * @param {string} [timeZone] identifiant IANA
 * @returns {string}
 */
export function formatLocalTime(date, lang, timeZone = MONTREAL_TIME_ZONE) {
  const twelveHour = lang !== 'fr';
  // On assemble soi-même les morceaux (heure, minutes, AM/PM) : le format ne dépend ni de la langue
  // du navigateur ni de l'espace qu'il met dans « 14 h 05 ». hourCycle plutôt que hour12 :
  // minuit s'écrit « 00 » et jamais « 24 ».
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: twelveHour ? 'h12' : 'h23',
    timeZone,
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type).value;

  const time = `${part('hour')}:${part('minute')}${twelveHour ? ` ${part('dayPeriod')}` : ''}`;
  const offset = utcOffset(date, timeZone);
  return offset ? `${time} ${offset}` : time;
}

/**
 * Décalage du fuseau à cette date, par exemple « UTC-5 » (heure normale) ou « UTC-4 » (heure avancée) ;
 * undefined si le navigateur ne connaît pas l'option « shortOffset » (Safari avant 15.4).
 */
function utcOffset(date, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
      .formatToParts(date)
      .find((item) => item.type === 'timeZoneName')
      .value.replace('GMT', 'UTC');
    // Stryker disable next-line BlockStatement: mutant équivalent (vider le bloc renvoie aussi undefined)
  } catch {
    return undefined;
  }
}
