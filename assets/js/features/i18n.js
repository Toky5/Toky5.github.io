/*
 * Français / anglais.
 * Le français est écrit directement dans index.html ; l'anglais vit dans i18n/en.js.
 * Chaque élément traduisible porte une clé :
 *   data-i18n="cle"                      → son texte
 *   data-i18n-html="cle"                 → son contenu HTML (texte avec mots annotés)
 *   data-i18n-attr="attribut:cle; ..."   → un ou plusieurs attributs
 * Le contenu français d'origine est conservé pour revenir en arrière sans recharger.
 * Le HTML traduit vient uniquement du dictionnaire du site, jamais de l'extérieur.
 */
import { createStore } from '../core/store.js';
import { writePreference } from '../core/preferences.js';
import { prefersReducedMotion } from '../core/motion.js';
import en from '../i18n/en.js';

const SOURCE_LANG = 'fr';
const dictionaries = { en };

const root = document.documentElement;
const originalTexts = new WeakMap();
const originalHtml = new WeakMap();
const originalAttributes = new WeakMap();
const reportedMissingKeys = new Set();

/** Langue courante : « fr » ou « en ». */
export const langStore = createStore(root.dataset.lang === 'en' ? 'en' : SOURCE_LANG);

export function initI18n() {
  langStore.subscribe(applyLanguage);
  applyLanguage(langStore.get());
  root.classList.remove('is-translating');

  for (const toggle of document.querySelectorAll('[data-lang-toggle]')) {
    toggle.addEventListener('click', () => {
      const nextLang = langStore.get() === 'fr' ? 'en' : 'fr';
      writePreference('lang', nextLang);

      if (document.startViewTransition && !prefersReducedMotion()) {
        document.startViewTransition(() => langStore.set(nextLang));
      } else {
        langStore.set(nextLang);
      }
    });
  }
}

function applyLanguage(lang) {
  const dictionary = dictionaries[lang];
  root.lang = lang;
  root.dataset.lang = lang;

  for (const element of document.querySelectorAll('[data-i18n]')) {
    if (!originalTexts.has(element)) originalTexts.set(element, element.textContent);
    element.textContent = translate(dictionary, element.dataset.i18n) ?? originalTexts.get(element);
  }

  for (const element of document.querySelectorAll('[data-i18n-html]')) {
    if (!originalHtml.has(element)) originalHtml.set(element, element.innerHTML);
    const html = translate(dictionary, element.dataset.i18nHtml) ?? originalHtml.get(element);
    // Seulement si le contenu change : les annotations déjà tracées restent en place.
    if (element.innerHTML !== html) element.innerHTML = html;
  }

  for (const element of document.querySelectorAll('[data-i18n-attr]')) {
    if (!originalAttributes.has(element)) originalAttributes.set(element, new Map());
    const originals = originalAttributes.get(element);

    for (const binding of element.dataset.i18nAttr.split(';')) {
      const [attribute, key] = binding.split(':').map((part) => part.trim());
      if (!originals.has(attribute)) originals.set(attribute, element.getAttribute(attribute));
      element.setAttribute(attribute, translate(dictionary, key) ?? originals.get(attribute));
    }
  }
}

/** Renvoie la traduction, ou undefined pour garder le texte français d'origine. */
function translate(dictionary, key) {
  if (!dictionary) return undefined;
  if (key in dictionary) return dictionary[key];

  if (!reportedMissingKeys.has(key)) {
    reportedMissingKeys.add(key);
    console.warn(`[i18n] Traduction manquante : « ${key} »`);
  }
  return undefined;
}
