/*
 * Sert le site en local, sans dépendance :
 *   npm start                            → http://127.0.0.1:8080
 *   node scripts/serve.mjs --port 4173   (utilisé par les tests E2E ; --port 0 = port libre)
 * N'écoute que sur la machine elle-même (127.0.0.1).
 */
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createStaticServer } from './lib/static-server.mjs';

const { values } = parseArgs({ options: { port: { type: 'string', default: '8080' } } });
const root = fileURLToPath(new URL('..', import.meta.url));
const server = createStaticServer(root);

server.listen(Number(values.port), '127.0.0.1', () => {
  const { port } = /** @type {import('node:net').AddressInfo} */ (server.address());
  console.log(`Site servi sur http://127.0.0.1:${port} (Ctrl+C pour arrêter)`);
});
