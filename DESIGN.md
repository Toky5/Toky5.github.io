# Design : une page annotée au stylo

Le site se lit comme une feuille sur laquelle on a annoté l'essentiel au stylo-bille :
« RAG » est entouré, « Montréal » souligné, les projets sont séparés par des filets
tirés à la main. C'est aussi ce que fait un système RAG : retrouver les bons passages
d'un texte et les mettre en évidence. La couverture du projet RAG le montre en
surlignant, l'un après l'autre, des passages d'une page de loi.

Inspirations, sans reprise de mise en page, de couleurs, d'illustrations ni de textes :

- [Ellipsus](https://ellipsus.com) pour la sobriété, les grands titres fins et l'idée d'annoter le texte à la main ;
- [Dennis Snellenberg](https://dennissnellenberg.com) pour les interactions : boutons magnétiques, cercle qui suit le curseur, fiche projet qui monte, heure locale.

Toutes les valeurs ci-dessous sont des variables CSS dans `assets/css/tokens.css` ;
les autres feuilles n'utilisent que ces noms.

## Couleurs

De l'encre sur du papier :

- `--paper` `#f1f1ec` : fond de page, un blanc cassé neutre ;
- `--paper-bright` `#fafaf7` : feuilles posées dessus (fiche projet, menu) ;
- `--ink` `#1c1d22` : texte, bouton plein, une encre bleu-noir ;
- `--pen` `#2b47c9` : annotations, survols et cercle « Voir », le bleu d'un stylo-bille ;
- `--marker` `#f2e05a` : surligneur (couverture RAG, sélection de texte).

Le site n'existe qu'en clair, contact compris : même quand le système est en mode sombre,
il garde le papier et l'encre (`color-scheme: only light`).
Le texte atteint au moins 4,5:1 de contraste ; le gris des légendes (`--c-muted`) est
une transparence de l'encre, pas une couleur à part.

## Typographie

- **Nexa ExtraLight** (200) pour la phrase d'accroche, les titres et les noms de projets : grande et fine, elle laisse la place aux annotations.
- **Nexa Heavy** (900) pour le titre « Projets », souligné au stylo : bien distinct des noms de projets, il ne se lit pas comme un élément de la liste.
- **Caviar Dreams Bold** (700) pour tout le reste : la graisse normale est trop fine aux petites tailles.
- Échelle fluide (`clamp`) : 15, 17, 24 px pour le texte ; 52 px pour le titre de section ; 84, 96, 120 et 168 px environ pour les grands titres sur grand écran.
- Lignes de texte limitées à environ 70 caractères ; `text-wrap: balance` sur les titres, `pretty` sur les paragraphes.

## Espacement et formes

- Marges latérales `--gutter` (de 20 à 80 px) et sections espacées de `--section` (de 96 à 176 px).
- Une seule forme de bouton : la pilule (bord 1 px, remplissage qui monte au survol).
- Couvertures arrondies à 10 px ; aucune ombre.
- Aucune bordure droite : les séparations sont des filets tracés à la main.

## Annotations

Générées dans le navigateur (`assets/js/lib/sketch.js`) : une suite de points un peu
irréguliers lissée en courbe. Le hasard est « à graine » : un même mot reçoit toujours
le même tracé. Trois formes :

- `circle` : un tour et un peu plus, qui dépasse son point de départ ;
- `underline` : un trait qui remonte légèrement vers la droite ;
- `rule` : un filet sur toute la largeur.

Pour annoter un mot : `<span class="sketch" data-sketch="underline">mot</span>`,
avec `data-sketch-delay="300"` pour retarder le tracé (en ms).

## Mouvement

Peu d'animations, chacune avec un rôle :

1. Au chargement, le stylo entoure « RAG » puis souligne « Montréal » : c'est le seul moment mis en scène.
2. Les filets et le souligné du contact se tracent quand ils entrent dans l'écran.
3. Boutons magnétiques et remplissage au survol.
4. Cercle plein « Voir » qui suit le curseur sur la liste des projets, avec un léger retard (souris uniquement).
5. Fiche projet et menu qui glissent comme une feuille.
6. Changement de langue en fondu.

Avec « réduire les animations », tout s'affiche directement : tracés complets, pas de glissement.
