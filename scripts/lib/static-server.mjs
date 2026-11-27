/*
 * Serveur statique sans dépendance (lancé par scripts/serve.mjs, testé dans tests/unit/serve.test.js).
 * Comme GitHub Pages : index.html pour un dossier, 404.html (statut 404) pour une page absente.
 * Il ne sert rien hors du dossier du site.
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { pipeline } from 'node:stream';

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

/** Type MIME d'un fichier d'après son extension. */
export function contentTypeFor(filePath) {
  return CONTENT_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

/**
 * Chemin sur le disque de l'adresse demandée, ou null si elle est invalide
 * ou sort du dossier du site (par exemple « /..%2f..%2fsecret »).
 * @param {string} root dossier du site
 * @param {string} requestUrl chemin de la requête, avec ou sans paramètres
 */
export function resolveRequestPath(root, requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  } catch {
    return null; // encodage invalide
  }
  if (pathname.includes('\0')) return null;

  const base = resolve(root);
  const filePath = resolve(base, `.${pathname}`);
  if (filePath !== base && !filePath.startsWith(base + sep)) return null;
  return pathname.endsWith('/') ? join(filePath, 'index.html') : filePath;
}

/** Serveur HTTP qui sert les fichiers de `root`. */
export function createStaticServer(root) {
  return createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { allow: 'GET, HEAD' }).end();
      return;
    }

    const requested = resolveRequestPath(root, request.url);
    const file = requested && (await findFile(requested));
    if (file) {
      send(response, 200, file);
      return;
    }

    const notFoundPage = await findFile(join(resolve(root), '404.html'));
    if (notFoundPage) send(response, 404, notFoundPage);
    else response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('404');
  });
}

/** Le fichier lui-même, l'index.html d'un dossier, ou null. */
async function findFile(filePath) {
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) return findFile(join(filePath, 'index.html'));
    return info.isFile() ? filePath : null; // ni dossier ni fichier (socket, tube) : rien à servir
    // Stryker disable next-line BlockStatement: mutant équivalent (sans return, la fonction rend undefined, lu comme null)
  } catch {
    return null;
  }
}

function send(response, status, filePath) {
  response.writeHead(status, { 'content-type': contentTypeFor(filePath), 'cache-control': 'no-store' });
  // pipeline ferme la réponse si la lecture échoue (fichier supprimé ou illisible) au lieu d'arrêter le serveur.
  pipeline(createReadStream(filePath), response, () => {});
}
