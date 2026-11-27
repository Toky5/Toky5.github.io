/*
 * Projets affichés par l'îlot React, en français (fr) et en anglais (en).
 * Pour ajouter un projet : ajouter un objet à `projects` (du plus récent au plus ancien)
 * et, si besoin, une couverture dans covers/.
 */
const NBSP = ' '; // espace insécable : « Loi 25 », « 205 extraits », avant « : »

export const projects = [
  {
    id: 'legal-rag',
    title: { fr: 'RAG juridique', en: 'Legal RAG' },
    category: { fr: 'Agents LLM et RAG', en: 'LLM agents & RAG' },
    fullTitle: { fr: 'Assistant RAG juridique et agents LLM', en: 'Legal RAG Assistant & LLM Agents' },
    context: { fr: 'Projet personnel, en cours', en: 'Personal project, in progress' },
    period: { fr: 'Sept. 2026 – aujourd’hui', en: 'Sept. 2026 – present' },
    stack: ['Python', 'LangGraph', 'PostgreSQL', 'pgvector', 'Docker', 'BeautifulSoup'],
    cover: { kind: 'rag', background: '#2b47c9' },
    summary: {
      fr: `Un assistant qui répond aux questions sur la loi québécoise sur la protection des renseignements personnels dans le secteur privé (P-39.1, modifiée par la Loi${NBSP}25), en s’appuyant sur le texte de loi.`,
      en: 'An assistant that answers questions about Quebec’s private-sector privacy act (P-39.1, amended by Law 25), grounded in the legal text.',
    },
    result: {
      value: { fr: `205${NBSP}extraits`, en: '205 chunks' },
      text: {
        fr: 'découpés selon les frontières juridiques et chargés dans PostgreSQL',
        en: 'split along legal boundaries and loaded into PostgreSQL',
      },
    },
    details: {
      fr: [
        'Agent LLM écrit de zéro (boucle d’appels d’outils sur une API compatible OpenAI, gpt-oss-20b via Groq, gestion des erreurs), puis porté vers LangGraph avec une mémoire de conversation.',
        `Pipeline d’ingestion${NBSP}: analyse du HTML de LégisQuébec avec BeautifulSoup, découpage selon les frontières juridiques (900${NBSP}caractères au plus), articles abrogés écartés, chargement idempotent dans PostgreSQL.`,
        `En cours${NBSP}: recherche sémantique avec pgvector et réponses qui citent les articles pertinents (Loi${NBSP}25, RGPD, LPRPDE).`,
      ],
      en: [
        'Built an LLM agent from scratch (tool-calling loop on an OpenAI-compatible API, gpt-oss-20b via Groq, error handling), then ported it to LangGraph with conversation memory.',
        'Ingestion pipeline: LégisQuébec HTML parsing with BeautifulSoup, chunking along legal boundaries (at most 900 characters), repealed sections filtered out, idempotent loading into PostgreSQL.',
        'In progress: semantic search with pgvector and answers citing the relevant articles (Law 25, GDPR, PIPEDA).',
      ],
    },
    privateCode: true,
  },
  {
    id: 'maville',
    title: { fr: 'MaVille', en: 'MaVille' },
    category: { fr: 'Travaux publics de Montréal', en: 'Montréal public works' },
    fullTitle: {
      fr: 'MaVille, plateforme citoyenne des travaux publics de Montréal',
      en: 'MaVille, a Citizen Platform for Montréal Public Works',
    },
    context: { fr: 'Cours de génie logiciel, équipe de 3', en: 'Software engineering course, team of 3' },
    period: { fr: 'Sept. – déc. 2024', en: 'Sept. – Dec. 2024' },
    stack: ['Java', 'Javalin', 'Maven', 'JUnit 5', 'Mockito'],
    cover: { kind: 'maville', background: '#23252b' },
    summary: {
      fr: `Une plateforme pour les travaux publics de Montréal${NBSP}: demandes de travaux, soumissions et notifications, branchée sur les données ouvertes de la Ville.`,
      en: 'A citizen platform for Montréal public works: work requests, bids and notifications, connected to the City’s open data.',
    },
    result: {
      value: { fr: 'A-', en: 'A-' },
      text: {
        fr: 'note finale, de l’analyse des exigences à 3 prototypes itératifs',
        en: 'final grade, from requirements analysis to 3 iterative prototypes',
      },
    },
    details: {
      fr: [
        `Analyse des exigences${NBSP}: cas d’utilisation, scénarios et diagrammes d’activités, puis architecture et 3${NBSP}prototypes itératifs.`,
        'API REST avec Javalin (comptes, demandes de travaux, soumissions, notifications) intégrant les données ouvertes de la Ville de Montréal, testée avec JUnit 5 et Mockito.',
      ],
      en: [
        'Requirements analysis (use cases, scenarios, activity diagrams), then architecture and 3 iterative prototypes.',
        'REST API with Javalin (accounts, work requests, bids, notifications) integrating the City of Montréal open data, tested with JUnit 5 and Mockito.',
      ],
    },
  },
];

/** Textes de l'interface de l'îlot. */
export const ui = {
  fr: {
    view: 'Voir',
    close: 'Fermer le projet',
    context: 'Contexte',
    stack: 'Technologies',
    period: 'Période',
    result: 'Résultat clé',
    next: (title) => `Projet suivant${NBSP}: ${title}`,
    privateCode: 'Code privé pour l’instant',
  },
  en: {
    view: 'View',
    close: 'Close project',
    context: 'Context',
    stack: 'Technologies',
    period: 'Period',
    result: 'Key result',
    next: (title) => `Next project: ${title}`,
    privateCode: 'Code is private for now',
  },
};
