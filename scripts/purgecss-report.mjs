import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { PurgeCSS } from 'purgecss';

const root = process.cwd();

const walk = async dir => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
      continue;
    }

    files.push(fullPath);
  }

  return files;
};

const relative = file => path.relative(root, file);

const getAstroStyles = async () => {
  const files = await walk(path.join(root, 'src'));
  const astroFiles = files.filter(file => file.endsWith('.astro'));
  const styles = [];

  for (const file of astroFiles) {
    const source = await readFile(file, 'utf8');
    const matches = source.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g);
    let index = 0;

    for (const match of matches) {
      index += 1;
      styles.push({
        raw: match[1],
        name: `${relative(file)}#style-${index}`,
      });
    }
  }

  return styles;
};

const results = await new PurgeCSS().purge({
  content: [
    'src/**/*.astro',
    'src/**/*.ts',
    'src/**/*.json',
  ],
  css: [
    'public/**/*.css',
    'src/**/*.css',
    ...await getAstroStyles(),
  ],
  rejected: true,
});

const findings = results
  .map(result => ({
    file: result.file,
    selectors: [...new Set((result.rejected || []).map(selector => selector.trim()))],
  }))
  .filter(result => result.selectors.length > 0);

if (findings.length === 0) {
  console.log('PurgeCSS: no unused selectors found.');
  process.exit(0);
}

const count = findings.reduce((sum, result) => sum + result.selectors.length, 0);
console.log(`PurgeCSS: found ${count} potentially unused selector(s).`);

for (const result of findings) {
  console.log(`\n${result.file}`);

  for (const selector of result.selectors) {
    console.log(`  ${selector}`);
  }
}

process.exit(1);
