/*
 * Vérifie que chaque clé de traduction utilisée dans index.html existe dans
 * assets/js/i18n/en.js, et signale les clés anglaises qui ne servent plus.
 * Utilisation : npm run check:i18n
 */
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = await readFile(join(root, 'index.html'), 'utf8');
const { default: english } = await import(pathToFileURL(join(root, 'assets/js/i18n/en.js')).href);

const usedKeys = new Set();
for (const [, key] of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) usedKeys.add(key);
for (const [, bindings] of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
  for (const binding of bindings.split(';')) usedKeys.add(binding.split(':')[1].trim());
}

const missing = [...usedKeys].filter((key) => !(key in english));
const unused = Object.keys(english).filter((key) => !usedKeys.has(key));

console.log(`${usedKeys.size} clés utilisées dans index.html`);
if (unused.length) console.log(`Clés anglaises inutilisées : ${unused.join(', ')}`);
if (missing.length) {
  console.error(`Traductions manquantes : ${missing.join(', ')}`);
  process.exit(1);
}
console.log('Toutes les clés ont leur traduction anglaise.');
