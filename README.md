# Portfolio de Toky Erick Rabenantoandro

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
    boot.js                thème et langue appliqués avant l'affichage
    main.js                point d'entrée des modules
    not-found.js           script de la page 404
    core/                  magasin observable, préférences mémorisées, mouvement réduit
    features/              langue, thème, menu, effet magnétique, annotations, heure de Montréal
    lib/                   tracés à main levée, hasard reproductible
    projects/              îlot React : liste, aperçu au survol, fiche projet, couvertures dessinées
    i18n/en.js             traductions anglaises
  vendor/react/            React 19 en modules ES (généré par scripts/vendor-react.mjs)
  fonts/                   Nexa (ExtraLight, Heavy) et Caviar Dreams Bold en WOFF2
  img/                     favicon, icône iOS, image d'aperçu des liens
  docs/                    CV en PDF
scripts/                   vérification des traductions, régénération de React
```

## Voir le site sur son ordinateur

Les modules JavaScript ne fonctionnent pas en ouvrant `index.html` directement
(`file://`) : il faut un petit serveur local. Dans le dossier du site :

```powershell
py -m http.server 8080
```
puis ouvrir <http://localhost:8080>. (Avec Node : `npm start`.)

Les archives `.zip` des polices restent sur ton ordinateur : `.gitignore` les exclut du dépôt.

## Crédits et licences

- **Nexa** (ExtraLight et Heavy) de Fontfabric et **Caviar Dreams Bold** de Lauren Thompson : un site public rend les fichiers de police téléchargeables. Vérifie que leurs licences permettent l'usage sur le web avant de publier.
- **React 19** (licence MIT), copie locale dans `assets/vendor/react/`.
