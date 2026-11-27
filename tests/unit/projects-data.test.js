/*
 * Contrat des données de l'îlot React : chaque projet a tout ce que la liste et la
 * fiche affichent, dans les deux langues, avec la typographie du reste du site.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { hasCover } from '../../assets/js/projects/covers/index.js';
import { projects, ui } from '../../assets/js/projects/projects-data.js';

const LANGS = ['fr', 'en'];
const TRANSLATED_FIELDS = ['title', 'category', 'fullTitle', 'context', 'period', 'summary'];

/** Tous les textes affichés d'un projet, avec leur langue. */
function displayedTexts(project) {
  const texts = [];
  for (const lang of LANGS) {
    for (const field of TRANSLATED_FIELDS) texts.push([lang, project[field][lang]]);
    texts.push([lang, project.result.value[lang]], [lang, project.result.text[lang]]);
    for (const detail of project.details[lang]) texts.push([lang, detail]);
  }
  return texts;
}

describe('projets', () => {
  it('ont chacun un identifiant unique en minuscules-avec-tirets', () => {
    const ids = projects.map((project) => project.id);
    assert.equal(new Set(ids).size, ids.length, `identifiants en double : ${ids}`);
    for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  for (const project of projects) {
    describe(project.id, () => {
      it('a chaque texte en français et en anglais, non vide', () => {
        for (const field of TRANSLATED_FIELDS) {
          for (const lang of LANGS) assert.ok(project[field][lang]?.trim(), `${field}.${lang}`);
        }
        for (const lang of LANGS) {
          assert.ok(project.result.value[lang]?.trim(), `result.value.${lang}`);
          assert.ok(project.result.text[lang]?.trim(), `result.text.${lang}`);
        }
      });

      it('a autant de points de détail dans les deux langues', () => {
        assert.ok(project.details.fr.length > 0);
        assert.equal(project.details.fr.length, project.details.en.length);
      });

      it('liste ses technologies', () => {
        assert.ok(Array.isArray(project.stack) && project.stack.length > 0);
        for (const technology of project.stack) assert.ok(typeof technology === 'string' && technology.trim());
      });

      it('a une couverture dessinée et une couleur de fond valide', () => {
        assert.ok(hasCover(project.cover.kind), `couverture inconnue : ${project.cover.kind}`);
        assert.match(project.cover.background, /^#[0-9a-f]{6}$/i);
      });

      it('suit la typographie du site (apostrophe ’, espace insécable avant « : » en français)', () => {
        for (const [lang, text] of displayedTexts(project)) {
          assert.doesNotMatch(text, /'/, `apostrophe droite (${lang}) : ${text}`);
          if (lang === 'fr') assert.doesNotMatch(text, / :/, `espace ordinaire avant « : » : ${text}`);
        }
      });

      it('déclare privateCode seulement comme un booléen', () => {
        if ('privateCode' in project) assert.equal(typeof project.privateCode, 'boolean');
      });
    });
  }
});

describe('textes de l’interface (ui)', () => {
  it('ont les mêmes clés, du même type, dans les deux langues', () => {
    assert.deepEqual(Object.keys(ui.en).sort(), Object.keys(ui.fr).sort());
    for (const key of Object.keys(ui.fr)) assert.equal(typeof ui.en[key], typeof ui.fr[key], key);
  });

  it('annoncent le projet suivant par son titre', () => {
    assert.equal(ui.fr.next('MaVille'), 'Projet suivant : MaVille');
    assert.equal(ui.en.next('Legal RAG'), 'Next project: Legal RAG');
  });
});
