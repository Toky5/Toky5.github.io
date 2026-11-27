/**
 * Choisit le texte dans la langue demandée quand la valeur est traduite ({ fr, en }) ;
 * une valeur non traduite (texte, liste, nombre) est rendue telle quelle.
 */
export function localize(value, lang) {
  const isTranslated = value !== null && typeof value === 'object' && !Array.isArray(value);
  return isTranslated ? value[lang] : value;
}
