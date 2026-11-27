/*
 * Outils de traduction indépendants de la page : features/i18n.js les applique
 * aux éléments, les tests les vérifient seuls.
 */

/**
 * Lit la valeur d'un attribut data-i18n-attr : « attribut:clé; attribut:clé ».
 * Les morceaux vides ou sans « : » sont ignorés.
 * @param {string} spec
 * @returns {Array<[string, string]>} paires [attribut, clé]
 */
export function parseAttributeBindings(spec) {
  /** @type {Array<[string, string]>} */
  const bindings = [];
  for (const binding of spec.split(';')) {
    const separator = binding.indexOf(':');
    if (separator === -1) continue;
    const attribute = binding.slice(0, separator).trim();
    const key = binding.slice(separator + 1).trim();
    if (attribute && key) bindings.push([attribute, key]);
  }
  return bindings;
}

/**
 * Crée la fonction de traduction : elle renvoie le texte de la clé, ou undefined
 * pour garder le texte d'origine. Chaque clé absente est signalée une seule fois.
 * @param {(key: string) => void} onMissing
 * @returns {(dictionary: Record<string, string> | undefined, key: string) => string | undefined}
 */
export function createTranslator(onMissing) {
  const reported = new Set();

  return function translate(dictionary, key) {
    if (!dictionary) return undefined;
    // hasOwn et non `in` : « constructor » ou « toString » ne sont pas des traductions.
    if (Object.hasOwn(dictionary, key)) return dictionary[key];

    if (!reported.has(key)) {
      reported.add(key);
      onMissing(key);
    }
    return undefined;
  };
}
