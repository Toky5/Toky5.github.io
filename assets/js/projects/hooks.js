/* Petits hooks React partagés par l'îlot des projets. */
import { useMemo, useSyncExternalStore } from 'react';

/** Valeur d'une requête média, mise à jour quand elle change. */
export function useMediaQuery(query) {
  const media = useMemo(() => window.matchMedia(query), [query]);
  return useSyncExternalStore(
    (onChange) => {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => media.matches,
  );
}

/** Choisit le texte dans la langue courante si la valeur est traduite ({ fr, en }). */
export function localize(value, lang) {
  const isTranslated = value !== null && typeof value === 'object' && !Array.isArray(value);
  return isTranslated ? value[lang] : value;
}
