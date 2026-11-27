import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer as createSocketServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { contentTypeFor, createStaticServer, resolveRequestPath } from '../../scripts/lib/static-server.mjs';

/** Démarre le serveur sur un port libre et rend son adresse. */
async function listen(server) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = /** @type {import('node:net').AddressInfo} */ (server.address());
  return `http://127.0.0.1:${port}`;
}

/** Arrête le serveur, connexions ouvertes comprises. */
async function stop(server) {
  server.closeAllConnections();
  server.close();
  await once(server, 'close');
}

describe('contentTypeFor', () => {
  it('donne le type MIME de chaque sorte de fichier du site', () => {
    const expected = {
      'index.html': 'text/html; charset=utf-8',
      'assets/css/base.css': 'text/css; charset=utf-8',
      'assets/js/main.js': 'text/javascript; charset=utf-8',
      'scripts/serve.mjs': 'text/javascript; charset=utf-8',
      'package.json': 'application/json; charset=utf-8',
      'README.md': 'text/markdown; charset=utf-8',
      'robots.txt': 'text/plain; charset=utf-8',
      'favicon.svg': 'image/svg+xml',
      'og-image.png': 'image/png',
      'favicon.ico': 'image/x-icon',
      'nexa-heavy.woff2': 'font/woff2',
      'CV.pdf': 'application/pdf',
    };
    for (const [file, type] of Object.entries(expected)) assert.equal(contentTypeFor(file), type, file);
  });

  it('ignore la casse de l’extension', () => {
    assert.equal(contentTypeFor('OG-IMAGE.PNG'), 'image/png');
  });

  it('se rabat sur un type binaire générique', () => {
    assert.equal(contentTypeFor('archive.zip'), 'application/octet-stream');
    assert.equal(contentTypeFor('LICENSE'), 'application/octet-stream');
  });
});

describe('resolveRequestPath', () => {
  const root = join(tmpdir(), 'site');

  it('sert index.html pour la racine et pour un dossier', () => {
    assert.equal(resolveRequestPath(root, '/'), join(root, 'index.html'));
    assert.equal(resolveRequestPath(root, '/docs/'), join(root, 'docs', 'index.html'));
  });

  it('retrouve un fichier, sans les paramètres ni l’ancre', () => {
    assert.equal(resolveRequestPath(root, '/assets/js/main.js?v=3#haut'), join(root, 'assets', 'js', 'main.js'));
  });

  it('décode les caractères encodés', () => {
    assert.equal(resolveRequestPath(root, '/mon%20CV.pdf'), join(root, 'mon CV.pdf'));
  });

  it('refuse de sortir du dossier du site', () => {
    assert.equal(resolveRequestPath(root, '/..%2f..%2fetc/passwd'), null);
    assert.equal(resolveRequestPath(root, '/assets/..%2f..%2fsecret.txt'), null);
  });

  it('garde dans le dossier les « .. » que l’adresse normalise d’elle-même', () => {
    assert.equal(resolveRequestPath(root, '/../index.html'), join(root, 'index.html'));
  });

  it('refuse un encodage invalide et le caractère nul', () => {
    assert.equal(resolveRequestPath(root, '/%E0%A4%A'), null);
    assert.equal(resolveRequestPath(root, '/index.html%00.js'), null);
  });
});

describe('createStaticServer (requêtes réelles sur un dossier temporaire)', () => {
  let folder;
  let server;
  let origin;

  before(async () => {
    folder = await mkdtemp(join(tmpdir(), 'portfolio-serve-'));
    const site = join(folder, 'site');
    await mkdir(join(site, 'docs'), { recursive: true });
    await writeFile(join(site, 'index.html'), '<h1>Accueil</h1>');
    await writeFile(join(site, '404.html'), '<h1>Introuvable</h1>');
    await writeFile(join(site, 'app.js'), 'export {};');
    await writeFile(join(site, 'docs', 'index.html'), '<h1>Docs</h1>');
    await writeFile(join(folder, 'secret.txt'), 'à ne jamais servir');

    server = createStaticServer(site);
    origin = await listen(server);
  });

  after(async () => {
    await stop(server);
    await rm(folder, { recursive: true, force: true });
  });

  const get = (path, init) => fetch(origin + path, init);

  it('sert la page d’accueil en HTML', async () => {
    const response = await get('/');
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(await response.text(), '<h1>Accueil</h1>');
  });

  it('sert les modules JavaScript avec le bon type (sinon le navigateur les refuse)', async () => {
    const response = await get('/app.js');
    assert.equal(response.headers.get('content-type'), 'text/javascript; charset=utf-8');
    assert.equal(response.headers.get('cache-control'), 'no-store');
  });

  it('sert l’index d’un dossier, avec ou sans « / » final', async () => {
    assert.equal(await (await get('/docs/')).text(), '<h1>Docs</h1>');
    assert.equal(await (await get('/docs')).text(), '<h1>Docs</h1>');
  });

  it('répond 404 avec la page 404.html, comme GitHub Pages', async () => {
    const response = await get('/nimporte-quoi');
    assert.equal(response.status, 404);
    assert.equal(await response.text(), '<h1>Introuvable</h1>');
  });

  it('ne sert jamais un fichier hors du dossier', async () => {
    const response = await get('/..%2fsecret.txt');
    assert.equal(response.status, 404);
    assert.doesNotMatch(await response.text(), /jamais/);
  });

  it(
    'ne sert pas un fichier spécial comme un socket',
    { skip: process.platform === 'win32' && 'pas de socket dans le système de fichiers sous Windows' },
    async (t) => {
      const socket = createSocketServer().listen(join(folder, 'site', 'prise'));
      await once(socket, 'listening');
      t.after(() => socket.close());

      const response = await get('/prise');
      assert.equal(response.status, 404);
    },
  );

  it('répond aux requêtes HEAD sans corps', async () => {
    const response = await get('/', { method: 'HEAD' });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), '');
  });

  it('refuse les autres méthodes (405)', async () => {
    const response = await get('/', { method: 'POST', body: 'x' });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'GET, HEAD');
  });
});

describe('npm start (scripts/serve.mjs)', () => {
  it('sert le vrai site sur un port libre et l’annonce', async (t) => {
    const script = fileURLToPath(new URL('../../scripts/serve.mjs', import.meta.url));
    const child = spawn(process.execPath, [script, '--port', '0'], { stdio: ['ignore', 'pipe', 'inherit'] });
    t.after(() => child.kill());

    const [line] = await once(child.stdout, 'data');
    const url = String(line).match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
    assert.ok(url, `adresse absente de : ${line}`);

    const response = await fetch(`${url}/`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /<title data-i18n="meta.title">Toky Erick Rabenantoandro/);
  });
});

describe('createStaticServer sans page 404.html', () => {
  it('répond un simple « 404 » en texte', async () => {
    const folder = await mkdtemp(join(tmpdir(), 'portfolio-serve-'));
    const server = createStaticServer(folder);
    const origin = await listen(server);
    try {
      const response = await fetch(`${origin}/absent`);
      assert.equal(response.status, 404);
      assert.equal(response.headers.get('content-type'), 'text/plain; charset=utf-8');
      assert.equal(await response.text(), '404');
    } finally {
      await stop(server);
      await rm(folder, { recursive: true, force: true });
    }
  });
});
