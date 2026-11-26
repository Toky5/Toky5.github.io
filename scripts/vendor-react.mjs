/*
 * Régénère assets/vendor/react/ : React et ReactDOM sous forme de modules ES
 * prêts pour le navigateur (le site n'a besoin d'aucune compilation).
 * À lancer seulement pour mettre React à jour :  npm install && npm run vendor:react
 */
import { build } from 'esbuild';
import { copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outdir = join(root, 'assets/vendor/react');
const require = createRequire(import.meta.url);

process.env.NODE_ENV = 'production';
const React = require('react');
const ReactDOMClient = require('react-dom/client');

/** Point d'entrée qui réexporte un paquet CommonJS avec des exports ES nommés. */
const entry = (packageName, module) => {
  const names = Object.keys(module).filter((name) => !name.startsWith('__') && name !== 'default');
  return `import mod from '${packageName}';\nexport default mod;\nexport const { ${names.join(', ')} } = mod;\n`;
};

const entries = {
  react: entry('react', React),
  'react-dom-client': entry('react-dom/client', ReactDOMClient),
};

await build({
  entryPoints: Object.keys(entries).map((name) => ({ in: `vendor:${name}`, out: name })),
  plugins: [
    {
      name: 'vendor-entries',
      setup(builder) {
        builder.onResolve({ filter: /^vendor:/ }, (args) => ({ path: args.path, namespace: 'vendor' }));
        builder.onLoad({ filter: /.*/, namespace: 'vendor' }, (args) => ({
          contents: entries[args.path.slice('vendor:'.length)],
          resolveDir: root,
        }));
      },
    },
  ],
  bundle: true,
  splitting: true, // React n'existe qu'en un seul exemplaire, partagé par les deux modules
  format: 'esm',
  minify: true,
  target: 'es2020',
  define: { 'process.env.NODE_ENV': '"production"' },
  outdir,
  chunkNames: 'chunks/[name]-[hash]',
  legalComments: 'none',
  banner: { js: `/*! React ${React.version} | MIT License | généré par scripts/vendor-react.mjs */` },
});

await copyFile(join(dirname(require.resolve('react/package.json')), 'LICENSE'), join(outdir, 'LICENSE'));
console.log(`React ${React.version} → assets/vendor/react/`);
