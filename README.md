# Portfolio de Toky Erick Rabenantoandro

Site personnel : une phrase, deux projets, un contact. HTML, CSS et JavaScript, avec un
petit îlot React pour les projets. **Aucune compilation** : les fichiers sont servis
tels quels, ce qui convient à GitHub Pages.

Le parti pris graphique (une page annotée au stylo) est décrit dans [DESIGN.md](DESIGN.md).

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

## Modifier le contenu

- **Textes français** : directement dans `index.html`.
- **Textes anglais** : `assets/js/i18n/en.js`, avec la même clé que l'attribut `data-i18n` (ou `data-i18n-html`) du texte français. `npm run check:i18n` vérifie qu'aucune traduction ne manque.
- **Mots annotés** : `<span class="sketch" data-sketch="circle">RAG</span>` (formes : `circle`, `underline`, `rule`). Dans une phrase traduite, l'annotation fait partie du HTML de la clé anglaise.
- **Projets** : `assets/js/projects/projects-data.js` (chaque texte en `fr` et `en`).
- **CV** : remplacer `assets/docs/CV_Toky_Erick_Rabenantoandro.pdf` (même nom de fichier), ou retirer le lien dans `index.html`.

## Voir le site sur son ordinateur

Les modules JavaScript ne fonctionnent pas en ouvrant `index.html` directement
(`file://`) : il faut un petit serveur local. Dans le dossier du site :

```powershell
py -m http.server 8080
```

puis ouvrir <http://localhost:8080>. (Avec Node : `npm start`.)

## Déployer sur GitHub Pages

1. Sur GitHub, créer un dépôt **public** nommé `Toky5.github.io` (sans README).
2. Dans le dossier du site, dans PowerShell :

   ```powershell
   git init
   git add .
   git commit -m "Portfolio"
   git branch -M main
   git remote add origin https://github.com/Toky5/Toky5.github.io.git
   git push -u origin main
   ```

3. Sur GitHub : **Settings → Pages → Build and deployment → Source : Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
4. Après une minute environ, le site est en ligne à <https://toky5.github.io>.

Avec un autre nom de dépôt, le site sera à `https://toky5.github.io/<nom-du-depot>/` :
il faudra alors adapter l'adresse de l'image d'aperçu (`og:image` dans `index.html`)
et les chemins absolus de `404.html`.

Les archives `.zip` des polices restent sur ton ordinateur : `.gitignore` les exclut du dépôt.

## Crédits et licences

- **Nexa** (ExtraLight et Heavy) de Fontfabric et **Caviar Dreams Bold** de Lauren Thompson : un site public rend les fichiers de police téléchargeables. Vérifie que leurs licences permettent l'usage sur le web avant de publier.
- **React 19** (licence MIT), copie locale dans `assets/vendor/react/`.
