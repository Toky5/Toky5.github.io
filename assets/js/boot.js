/*
 * Exécuté avant le premier affichage (script classique, volontairement minimal) :
 * applique le thème et la langue mémorisés, ou ceux du système.
 * Tout le reste est chargé en modules depuis main.js.
 */
(function () {
  var root = document.documentElement;

  function read(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null; // stockage bloqué : on suit les réglages du système
    }
  }

  var storedTheme = read('portfolio:theme');
  var storedLang = read('portfolio:lang');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  root.setAttribute('data-theme', storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : prefersDark ? 'dark' : 'light');

  var browserLang = (navigator.languages && navigator.languages[0]) || navigator.language || 'fr';
  var lang = storedLang === 'fr' || storedLang === 'en' ? storedLang : /^fr\b/i.test(browserLang) ? 'fr' : 'en';
  root.setAttribute('data-lang', lang);

  // La page est écrite en français : on la cache le temps de la traduire.
  if (lang !== 'fr') {
    root.classList.add('is-translating');
    window.setTimeout(function () {
      root.classList.remove('is-translating'); // si les modules ne se chargent pas
    }, 3000);
  }
})();
