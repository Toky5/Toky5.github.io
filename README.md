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

## Voir le site sur son ordinateur

Les modules JavaScript ne fonctionnent pas en ouvrant `index.html` directement
(`file://`) : il faut un petit serveur local. Dans le dossier du site :

```powershell
npm start
```

puis ouvrir <http://127.0.0.1:8080>. Le serveur (`scripts/serve.mjs`) n'a besoin que de Node.js ;
sans Node, `py -m http.server 8080` fonctionne aussi.

Les archives `.zip` des polices restent sur ton ordinateur : `.gitignore` les exclut du dépôt.

## Qualité et tests

Il faut Node.js 22.13 ou plus récent. Une seule fois : `npm install`, puis
`npx playwright install chromium` pour les tests E2E.

- `npm test` : tests unitaires avec `node:test` et `node:assert` (intégrés à Node). Ils couvrent la logique du site : tracés à main levée, hasard reproductible, suivi du curseur, traductions, heure de Montréal, couvertures dessinées, serveur local, ainsi que la cohérence des données des projets et des traductions.
- `npm run test:coverage` : les mêmes tests avec la mesure de couverture. La commande échoue sous 95 % des lignes, 90 % des branches ou 95 % des fonctions.
- `npm run test:update-snapshots` : met à jour les instantanés (`tests/unit/*.snapshot`). Ils figent le dessin exact des tracés et des couvertures ; à relancer seulement après un changement voulu du dessin.
- `npm run test:e2e` : tests de bout en bout dans Chromium (Playwright), sur ordinateur et sur téléphone. Ils couvrent l'accueil, la langue, le survol des projets, la fiche projet, le menu, l'accessibilité, le mode « réduire les animations » et la page 404. Un test échoue aussi si la console affiche une erreur.
- `npm run test:mutation` : tests de mutation avec Stryker. Stryker modifie le code un endroit à la fois (`<` devient `<=`, `&&` devient `||`…) et vérifie qu'un test échoue à chaque fois. Le rapport est dans `reports/mutation/index.html`.
- `npm run lint`, `npm run format:check`, `npm run typecheck` : analyse statique avec ESLint, Prettier et TypeScript, qui vérifie le JavaScript sans le compiler.
- `npm run check` : analyse statique et tests avec couverture, en une commande.

Le code qui dépend du navigateur (canevas, observateurs, `requestAnimationFrame`) est testé
avec des doublures (`tests/helpers/`) ; l'interface elle-même est vérifiée par les tests E2E.

Sur GitHub, deux workflows (GitHub Actions, dans `.github/workflows/`) relancent ces vérifications :

- `qualite.yml` lance `npm run check` sous Node 22 et 24, puis les tests E2E, à chaque push sur `main` et sur chaque pull request ;
- `mutation.yml` lance Stryker quand le code testé ou ses tests changent sur `main`, ou à la demande depuis l'onglet Actions.

Les rapports de Playwright et de Stryker se téléchargent depuis le résumé de chaque exécution.
Garde `package-lock.json` dans git : la CI installe alors exactement les mêmes versions (`npm ci`).

## Crédits et licences

- **Nexa** (ExtraLight et Heavy) de Fontfabric et **Caviar Dreams Bold** de Lauren Thompson : un site public rend les fichiers de police téléchargeables. Vérifie que leurs licences permettent l'usage sur le web avant de publier.
- **React 19** (licence MIT), copie locale dans `assets/vendor/react/`.
