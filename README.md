# Portfolio de Toky Erick Rabenantoandro


Lien vers le site: https://toky5.github.io

Site personnel : une phrase, deux projets, un contact. HTML, CSS et JavaScript, avec un
petit îlot React pour les projets.

## Contenu du dossier

```
index.html                 page principale (textes français)
404.html                   page « introuvable » de GitHub Pages
assets/
  css/                     une feuille par zone : tokens, base, boutons, annotations,
                           en-tête, menu, hero, projets, fiche projet, contact, mouvement, 404
  js/
    boot.js                langue appliquée avant l'affichage
    main.js                point d'entrée des modules
    not-found.js           script de la page 404
    core/                  magasin observable, préférences mémorisées, mouvement réduit
    features/              langue, menu, effet magnétique, annotations, heure de Montréal
    lib/                   logique sans navigateur : tracés à main levée, hasard reproductible,
                           suivi du curseur, traductions, heure locale
    projects/              îlot React : liste, cercle au survol, fiche projet, couvertures dessinées
    i18n/en.js             traductions anglaises
  vendor/react/            React 19 en modules ES (généré par scripts/vendor-react.mjs)
  fonts/                   Nexa (ExtraLight, Heavy) et Caviar Dreams Bold en WOFF2
  img/                     favicon, icône iOS, image d'aperçu des liens
  docs/                    CV en PDF
scripts/                   serveur local, régénération de React
tests/
  unit/                    tests unitaires (node:test)
  e2e/                     tests de bout en bout (Playwright)
  helpers/                 doublures de test : canevas et API du navigateur
```


- `qualite.yml` lance `npm run check` sous Node 22 et 24, puis les tests E2E, à chaque push sur `main` et sur chaque pull request ;
- `mutation.yml` lance Stryker quand le code testé ou ses tests changent sur `main`, ou à la demande depuis l'onglet Actions.

Les rapports de Playwright et de Stryker se téléchargent depuis le résumé de chaque exécution.
Garde `package-lock.json` dans git : la CI installe alors exactement les mêmes versions (`npm ci`).

## Crédits et licences

- **Nexa** (ExtraLight et Heavy) de Fontfabric et **Caviar Dreams Bold** de Lauren Thompson
- **React 19** (licence MIT), copie locale dans `assets/vendor/react/`.
