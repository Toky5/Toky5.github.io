/*
 * Îlot React des projets : liste en grandes lignes séparées par des filets
 * tracés à la main, aperçu qui suit le curseur et fiche projet en plein écran.
 * Écrit sans JSX (createElement, abrégé `h`), pour fonctionner sans compilation.
 */
import { createElement as h, Fragment, useState, useSyncExternalStore } from 'react';
import { langStore } from '../features/i18n.js';
import { localize, useMediaQuery } from './hooks.js';
import { ProjectCover } from './ProjectCover.js';
import { ProjectDialog } from './ProjectDialog.js';
import { WorkPreview } from './WorkPreview.js';

/** Filet dessiné par features/doodles.js. */
const rule = (className) => h('span', { className: `sketch-rule ${className}`, 'data-sketch': 'rule', 'aria-hidden': true });

export function ProjectsApp({ projects, ui }) {
  const lang = useSyncExternalStore(langStore.subscribe, langStore.get);
  const text = ui[lang];
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine) and (min-width: 50.01rem)');

  const showNext = () => setOpenIndex((index) => (index + 1) % projects.length);

  return h(
    Fragment,
    null,
    h(
      'ul',
      { className: 'work-list', onMouseLeave: () => setHoveredIndex(null) },
      projects.map((project, index) =>
        h(
          'li',
          { key: project.id, className: 'work-row' },
          rule('work-row__rule'),
          h(
            'button',
            {
              type: 'button',
              className: 'work-row__button',
              'aria-haspopup': 'dialog',
              onMouseEnter: () => setHoveredIndex(index),
              onClick: () => {
                setHoveredIndex(null);
                setOpenIndex(index);
              },
            },
            !canHover &&
              h(
                'span',
                { className: 'work-row__cover', style: { '--cover-bg': project.cover.background } },
                h(ProjectCover, { kind: project.cover.kind }),
              ),
            h('span', { className: 'work-row__title' }, localize(project.title, lang)),
            h('span', { className: 'work-row__meta' }, localize(project.category, lang)),
          ),
        ),
      ),
    ),
    rule('work-list__end'),
    canHover && h(WorkPreview, { projects, activeIndex: hoveredIndex, label: text.view }),
    h(ProjectDialog, {
      project: openIndex === null ? null : projects[openIndex],
      nextProject: openIndex === null || projects.length < 2 ? null : projects[(openIndex + 1) % projects.length],
      lang,
      text,
      onNext: showNext,
      onClose: () => setOpenIndex(null),
    }),
  );
}
