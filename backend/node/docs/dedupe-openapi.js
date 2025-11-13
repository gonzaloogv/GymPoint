// docs/dedupe-openapi.js
const fs = require('fs');
const yaml = require('js-yaml');

const file = 'docs/openapi.yaml';
const doc = yaml.load(fs.readFileSync(file, 'utf8'));
const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

const mergeParams = (a = [], b = []) => {
  const key = p => `${p?.name}|${p?.in}`;
  const map = new Map(a.map(p => [key(p), p]));
  for (const p of b) if (!map.has(key(p))) map.set(key(p), p);
  return [...map.values()];
};

const mergeMethods = (A = {}, B = {}) => {
  const out = { ...A };
  for (const [verb, def] of Object.entries(B)) {
    if (!out[verb]) out[verb] = def;
    else {
      // si ya existe el mismo verbo, unimos parámetros de nivel método
      if (Array.isArray(out[verb]?.parameters) || Array.isArray(def?.parameters)) {
        out[verb] = { ...out[verb], ...def,
          parameters: mergeParams(out[verb].parameters || [], def.parameters || [])
        };
      }
    }
  }
  return out;
};

// 1) paths: fusiona bloques duplicados
const mergedPaths = {};
for (const [path, val] of Object.entries(doc.paths || {})) {
  if (!mergedPaths[path]) mergedPaths[path] = val;
  else mergedPaths[path] = mergeMethods(mergedPaths[path], val);
}
doc.paths = mergedPaths;

// 2) components.schemas: deja el primero si hay duplicados de nombre
if (doc.components?.schemas) {
  const cleaned = {};
  for (const [name, schema] of Object.entries(doc.components.schemas)) {
    if (!cleaned[name]) cleaned[name] = schema;
  }
  doc.components.schemas = cleaned;
}

// 3) components.parameters: idem, merge por nombre
if (doc.components?.parameters) {
  const cleaned = {};
  for (const [name, param] of Object.entries(doc.components.parameters)) {
    if (!cleaned[name]) cleaned[name] = param;
  }
  doc.components.parameters = cleaned;
}

// 4) Arreglo rápido de mojibake
const fixUtf = s => typeof s === 'string' ? s.replace(/invÃ¡lidos/g,'inválidos') : s;
const walk = o => Array.isArray(o) ? o.map(walk)
  : isObj(o) ? (Object.keys(o).forEach(k => o[k]=walk(o[k])), o)
  : fixUtf(o);
walk(doc);

fs.writeFileSync(file, yaml.dump(doc, { lineWidth: 120 }));
console.log('OK: paths fusionados, schemas/parameters deduplicados.');
