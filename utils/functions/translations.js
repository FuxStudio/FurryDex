const fs = require('fs');
const path = require('path');

const translationsDir = './src/locales/';
const outputFile = './src/build_locales.json';

// Charge récursivement toutes les clés d’un objet et les fusionne
function mergeDeep(target, source, lang) {
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      mergeDeep(target[key], source[key], lang);
    } else {
      // Si c’est une chaîne de texte, on crée un objet multilingue
      if (typeof target[key] !== 'object' || target[key] === null) {
        target[key] = {};
      }
      target[key][lang] = source[key];
    }
  }
}

async function main() {
  const files = fs.readdirSync(translationsDir).filter((f) => f.endsWith('.json'));
  const merged = {};

  for (const file of files) {
    const lang = path.basename(file, '.json');
    const content = JSON.parse(fs.readFileSync(path.join(translationsDir, file), 'utf8'));
    mergeDeep(merged, content, lang);
  }

  fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2), 'utf8');
  return true;
}

module.exports = main;
