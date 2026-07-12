#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const studioDir = path.resolve(__dirname, '..');
const repoDir = path.resolve(studioDir, '..');
const playsDir = path.join(studioDir, 'plays');
const registryPath = path.join(playsDir, 'registry.js');
const allowedRepoDocs = new Set([
  'docs/alexandria/plans/studio-fixes/F7-review-levels.md',
  'docs/alexandria/plans/studio-fixes/play-re-sync.md',
]);

function loadCatalog() {
  const source = fs.readFileSync(registryPath, 'utf8');
  const context = { console };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(source, context, { filename: registryPath });
  if (!context.StudioCatalog) {
    throw new Error('registry.js did not expose globalThis.StudioCatalog');
  }
  return context.StudioCatalog;
}

function briefFiles() {
  const files = [path.join(playsDir, 'TEMPLATE-brief.md')];
  for (const entry of fs.readdirSync(playsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const briefPath = path.join(playsDir, entry.name, 'brief.md');
    if (fs.existsSync(briefPath)) files.push(briefPath);
  }
  return files.sort();
}

function parseFrontmatterValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim() : null;
}

function checkBriefFrontmatter(catalog) {
  const errors = [];
  for (const file of briefFiles()) {
    const text = fs.readFileSync(file, 'utf8');
    const rel = path.relative(repoDir, file);
    if (/^job:/m.test(text)) {
      errors.push(`${rel} declares retired job frontmatter`);
    }
    const isTemplate = path.basename(file) === 'TEMPLATE-brief.md';
    const division = parseFrontmatterValue(text, 'division');
    const fn = parseFrontmatterValue(text, 'function');
    if (!division) errors.push(`${rel} is missing division frontmatter`);
    if (!fn) errors.push(`${rel} is missing function frontmatter`);
    if (isTemplate || !division || !fn) continue;
    const divisionDef = catalog.DIVISIONS[division];
    if (!divisionDef) {
      errors.push(`${rel} declares unknown division ${division}`);
      continue;
    }
    if (!divisionDef.functions.includes(fn)) {
      errors.push(`${rel} declares ${division} / ${fn}, but ${fn} is not in ${division}'s function set`);
    }
  }
  return errors;
}

function checkCatalogLinks(catalog) {
  const errors = [];
  for (const play of catalog.RUNGS) {
    const href = catalog.playHref(play);
    if (href.includes('../')) {
      errors.push(`${play.slug} href escapes the Studio server root: ${href}`);
      continue;
    }
    if (!href.startsWith('doc.html?repo=')) continue;

    const query = href.slice(href.indexOf('?') + 1);
    const repoDoc = new URLSearchParams(query).get('repo');
    if (!repoDoc) {
      errors.push(`${play.slug} repo-doc href is missing repo query`);
      continue;
    }
    if (!allowedRepoDocs.has(repoDoc)) {
      errors.push(`${play.slug} repo-doc href is outside the Studio spec allowlist: ${repoDoc}`);
      continue;
    }
    const docPath = path.resolve(repoDir, repoDoc);
    if (!docPath.startsWith(repoDir + path.sep)) {
      errors.push(`${play.slug} repo-doc href escapes the repository: ${repoDoc}`);
    } else if (!fs.existsSync(docPath)) {
      errors.push(`${play.slug} repo-doc href does not exist: ${repoDoc}`);
    }
  }
  return errors;
}

function isAbsoluteOrAnchorHref(href) {
  return href.startsWith('/') || href.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(href);
}

function checkRootCatalogLinks(catalog) {
  const errors = [];
  if (typeof catalog.playHrefFromRoot !== 'function') {
    return ['registry.js does not expose playHrefFromRoot for root catalog links'];
  }

  for (const play of catalog.RUNGS) {
    const playHref = catalog.playHref(play);
    const rootHref = catalog.playHrefFromRoot(play);
    if (rootHref.includes('../')) {
      errors.push(`${play.slug} root href escapes the Studio server root: ${rootHref}`);
      continue;
    }
    if (isAbsoluteOrAnchorHref(rootHref)) continue;
    if (!rootHref.startsWith('plays/')) {
      errors.push(`${play.slug} root href is not routed through plays/: ${rootHref}`);
    }
    if (playHref.startsWith('doc.html?') && !rootHref.startsWith('plays/doc.html?')) {
      errors.push(`${play.slug} doc href will not resolve from the Studio root: ${rootHref}`);
    }
  }

  return errors;
}

const catalog = loadCatalog();
const errors = [];

for (const error of catalog.validateCatalog(catalog.RUNGS, catalog.DIVISIONS)) {
  errors.push(error.message);
}

const negative = {
  n: 'negative',
  name: 'Negative invalid function fixture',
  slug: 'negative-invalid-function-fixture',
  glyph: '!',
  tier: 'PM',
  division: 'PlaymakerStudio',
  function: 'Definition',
  prio: 'test',
  status: 'slot',
  surface: 'test fixture',
  d: 'Deliberately invalid fixture.',
};
const negativeErrors = catalog.validateCatalog([negative], catalog.DIVISIONS);
if (!negativeErrors.some(error => error.code === 'invalid-function' && error.slug === negative.slug)) {
  errors.push('negative fixture PlaymakerStudio / Definition was accepted');
}

errors.push(...checkBriefFrontmatter(catalog));
errors.push(...checkCatalogLinks(catalog));
errors.push(...checkRootCatalogLinks(catalog));

if (errors.length) {
  console.error('Catalog check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Catalog check passed: ${catalog.RUNGS.length} records across ${Object.keys(catalog.DIVISIONS).length} divisions.`);
