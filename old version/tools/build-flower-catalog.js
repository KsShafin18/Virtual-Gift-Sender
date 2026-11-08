const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const folder = path.join(__dirname, '..', 'models', 'flowers_Model');
const files = fs.readdirSync(folder).filter(file => /^[A-Za-z0-9][A-Za-z0-9_-]*\.html$/i.test(file)).sort();
const ids = new Map();
const catalog = files.flatMap(file => {
  const html = fs.readFileSync(path.join(folder, file), 'utf8');
  const id = html.match(/<meta\s+name=["']flower-id["']\s+content=["']([^"']+)["']/i)?.[1];
  const name = html.match(/<meta\s+name=["']flower-name["']\s+content=["']([^"']+)["']/i)?.[1];
  const description = html.match(/<meta\s+name=["']flower-description["']\s+content=["']([^"']+)["']/i)?.[1];
  if (!/^[a-z][a-z0-9-]*$/.test(id || '') || ['letter', 'constructor', 'prototype'].includes(id))
    throw new Error(`Invalid flower-id "${id}" in ${file}.`);
  if (!name || !description) throw new Error(`Missing flower-name or flower-description in ${file}.`);
  if (!/<template\s+id=["']flower-art["']\s*>[\s\S]*?<svg\b/i.test(html))
    throw new Error(`Missing <template id="flower-art"> with an SVG in ${file}.`);
  if (ids.has(id)) throw new Error(`Duplicate flower-id "${id}" in ${ids.get(id)} and ${file}.`);
  ids.set(id, file);
  return [{ file, version: crypto.createHash('sha256').update(html).digest('hex').slice(0, 12) }];
});

fs.writeFileSync(path.join(folder, 'manifest.json'), `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Generated flower catalog with ${catalog.length} model(s).`);
