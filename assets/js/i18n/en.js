/*
 * Traductions anglaises des textes de index.html (le français est la langue source).
 * Une clé manquante laisse le texte français et affiche un avertissement en console ;
 * les tests (tests/unit/i18n-keys.test.js) vérifient que les clés de la page et celles-ci
 * correspondent exactement.
 * Les clés *.statement et *.title utilisées avec data-i18n-html contiennent du HTML :
 * les mots annotés gardent leur <span class="sketch" data-sketch="…">.
 */
export default {
  'meta.title': 'Toky Erick Rabenantoandro | LLM agents and RAG, Montréal',
  'meta.description': 'Toky Erick Rabenantoandro is interested in building LLM agents and RAG systems in Montréal.',

  'nav.skip': 'Skip to content',
  'nav.label': 'Main navigation',
  'nav.home': 'Home',
  'nav.work': 'Projects',
  'nav.contact': 'Contact',
  'nav.menu': 'Menu',
  'nav.close': 'Close',

  'hero.statement':
    'I’m interested in building LLM agents and <span class="sketch" data-sketch="circle" data-sketch-delay="300">RAG</span> systems in <span class="sketch" data-sketch="underline" data-sketch-delay="1100">Montréal</span>.',
  'hero.work': 'See the projects',
  'hero.contact': 'Get in touch',

  'work.title': '<span class="sketch" data-sketch="underline">Projects</span>',

  'contact.title': 'Drop me a <span class="sketch" data-sketch="underline">line</span>.',
  'contact.text': 'To talk about LLM agents and RAG.',
  'contact.cv': 'Résumé (PDF)',
};
