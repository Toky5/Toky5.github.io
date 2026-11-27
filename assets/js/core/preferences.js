/**
 * Préférences mémorisées entre deux visites (la langue).
 * Mêmes clés que boot.js. Le stockage peut être bloqué : on ignore alors l'erreur,
 * et le choix ne vaut que pour la visite en cours.
 */
const PREFIX = 'portfolio:';

export function readPreference(name) {
  try {
    return localStorage.getItem(PREFIX + name);
  } catch {
    return null;
  }
}

export function writePreference(name, value) {
  try {
    localStorage.setItem(PREFIX + name, value);
  } catch {
    // Pas de stockage disponible.
  }
}
