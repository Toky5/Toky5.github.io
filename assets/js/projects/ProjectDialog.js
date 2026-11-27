/*
 * Fiche projet en plein écran (élément <dialog>) : une feuille qui monte depuis le bas,
 * se ferme avec le bouton rond, Échap ou « Projet suivant ».
 * Le projet affiché est conservé pendant l'animation de fermeture.
 */
import { createElement as h, Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { localize } from '../lib/localize.js';
import { ProjectCover } from './ProjectCover.js';

const CLOSE_DURATION = 800; // ms, comme la transition CSS

export function ProjectDialog({ project, nextProject, lang, text, onNext, onClose }) {
  const dialogRef = useRef(null);
  const [shown, setShown] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!project || !dialog) return;
    setShown(project);
    dialog.scrollTop = 0;
    if (!dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => dialog.classList.add('is-open'));
    }
  }, [project]);

  const close = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    dialog.classList.remove('is-open');
    setTimeout(() => {
      dialog.close();
      onClose();
    }, CLOSE_DURATION);
  }, [onClose]);

  // Échap : fermeture animée plutôt qu'immédiate.
  useEffect(() => {
    const dialog = dialogRef.current;
    const onCancel = (event) => {
      event.preventDefault();
      close();
    };
    dialog.addEventListener('cancel', onCancel);
    return () => dialog.removeEventListener('cancel', onCancel);
  }, [close]);

  return h(
    'dialog',
    { ref: dialogRef, className: 'case', 'aria-labelledby': 'case-title' },
    shown &&
      h(
        Fragment,
        null,
        h(
          'button',
          { type: 'button', className: 'case__close', onClick: close, 'data-magnetic': '' },
          h('span', { className: 'case__close-lines', 'aria-hidden': true }),
          h('span', { className: 'visually-hidden' }, text.close),
        ),
        h(
          'article',
          { className: 'case__inner' },
          h('h2', { className: 'case__title', id: 'case-title' }, localize(shown.fullTitle, lang)),
          h(
            'dl',
            { className: 'case__meta' },
            metaItem(text.context, localize(shown.context, lang)),
            metaItem(text.stack, shown.stack.join(', ')),
            metaItem(text.period, localize(shown.period, lang)),
          ),
          h(
            'div',
            { className: 'case__cover', style: { '--cover-bg': shown.cover.background } },
            h(ProjectCover, { key: shown.id, kind: shown.cover.kind }),
          ),
          h(
            'div',
            { className: 'case__body' },
            h('p', { className: 'case__summary' }, localize(shown.summary, lang)),
            h(
              'div',
              { className: 'case__result' },
              h('p', { className: 'case__label' }, text.result),
              h('p', { className: 'case__result-value' }, localize(shown.result.value, lang)),
              h('p', { className: 'case__result-text' }, localize(shown.result.text, lang)),
            ),
            h(
              'ul',
              { className: 'case__points' },
              localize(shown.details, lang).map((point) => h('li', { key: point }, point)),
            ),
          ),
          h(
            'div',
            { className: 'case__links' },
            shown.privateCode && h('p', { className: 'button-pill button-pill--static' }, text.privateCode),
            nextProject &&
              h(
                'button',
                { type: 'button', className: 'button-pill', onClick: onNext, 'data-magnetic': '' },
                h('span', { className: 'button-fill', 'aria-hidden': true }),
                h('span', null, text.next(localize(nextProject.title, lang))),
              ),
          ),
        ),
      ),
  );
}

function metaItem(label, value) {
  return h('div', null, h('dt', { className: 'case__label' }, label), h('dd', null, value));
}
