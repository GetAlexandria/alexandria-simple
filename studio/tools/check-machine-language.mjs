#!/usr/bin/env node
//
// check-machine-language.mjs — hygiene gate for de-machined product-library
// card bodies.
//
// WHY THIS EXISTS: Back-of-House scanner cards describe the product in
// implementation terms — file paths, code identifiers, route names, and
// scanner event indices. The director's standard is that a card BODY reads as
// product English; any code reference belongs in `source_evidence:` (and any
// ruling id in `rulings:`), never in the prose. This gate scans card bodies
// (never frontmatter) for machine tokens so a de-machining pass cannot regress
// and raw scanner output cannot land unnoticed.
//
// Scope: product cards only — a `.md` file whose frontmatter carries
// `prefLabel`, `context`, and `type`. Walk artifacts (HOT-SPOTS.md, runtime/…)
// have no such frontmatter and are skipped. Frontmatter is never scanned, so
// `source_evidence` paths and `rulings` ids are allowed to carry code.
//
// Usage:
//   node studio/tools/check-machine-language.mjs [bundle-path ...]
// With no argument it scans the Studio sweep roots and the live Alexandria
// product library.
//
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const studioDir = path.resolve(__dirname, '..');
const repoDir = path.resolve(studioDir, '..');

const DEFAULT_ROOTS = [
  path.join(studioDir, 'sweeps'),
  path.join(repoDir, 'docs/alexandria/library'),
  path.join(repoDir, 'docs/alexandria/sweeps'),
];

const rel = (file) => path.relative(repoDir, file);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.name.endsWith('.md')) out.push(p);
  }
  return out;
}

// A product card is a `.md` file whose frontmatter carries prefLabel/context/type.
function splitFrontmatter(content) {
  if (!content.startsWith('---')) return null;
  const end = content.indexOf('\n---', 3);
  if (end < 0) return null;
  const fm = '\n' + content.slice(3, end);
  const bodyStart = content.indexOf('\n', end + 1);
  return { fm, body: bodyStart < 0 ? '' : content.slice(bodyStart + 1) };
}

const isProductCard = (fm) =>
  /\nprefLabel:/.test(fm) && /\ncontext:/.test(fm) && /\ntype:/.test(fm);

// Post frontmatter-v2 (library-migration plan §2.2), identity lives in the
// path: a product card is a `<Type> - <Name>.md` file with any frontmatter.
const isCardPath = (filePath) => / - [^/]+\.md$/.test(filePath);

const CODE_EXT = 'ts|tsx|js|mjs|cjs|jsonl|json|py|sh|rs|go|rb';
// Both derive only from CODE_EXT — built once here, not recompiled per card/span.
// FILENAME_RE is global; String.matchAll iterates a clone, so reuse is safe.
const FILENAME_RE = new RegExp(`\\b[\\w.-]+\\.(?:${CODE_EXT})\\b`, 'g');
const CODE_EXT_RE = new RegExp(`\\.(?:${CODE_EXT})\\b`);
const ALLOW_BACKTICK = new Set(['ax', 'AX']);

// Detect implementation tokens in a card body. Wikilink targets are stripped
// first — `[[Entity - Ledger Event]]` is a card name, never machine speak.
function findMachineTokens(body) {
  const tokens = new Set();
  const text = body.replace(/\[\[[^\]]*\]\]/g, '');

  // 1) Bare filenames with a code extension (state-events.ts, events.jsonl).
  for (const m of text.matchAll(FILENAME_RE)) {
    tokens.add(m[0]);
  }
  // 2) Repo path segments (packages/…, src/…). `docs` is deliberately kept out
  //    of this alternation so bare prose like "see the docs" doesn't match;
  //    only the unambiguous `docs/alexandria/…` path is flagged, on the next line.
  for (const m of text.matchAll(/\b(?:packages|src|studio|repos)\/[\w./-]+/g)) {
    tokens.add(m[0]);
  }
  for (const m of text.matchAll(/\bdocs\/alexandria\/[\w./-]+/g)) tokens.add(m[0]);
  // 3) Scanner event indices and inline ruling ids — provenance belongs in the
  //    `rulings:` frontmatter list, not the prose.
  for (const m of text.matchAll(/\bevent \d{1,3}\b/g)) tokens.add(m[0]);
  for (const m of text.matchAll(/\bevent [0-9a-f]{6,}/g)) tokens.add(m[0]);
  // 4) Process-narrative formulas — ruling/session narration in the body (the
  //    "origin story of the chat that built it" tic). The card describes the
  //    product; who ruled what when belongs in `rulings:` frontmatter. Kept to
  //    exact formulas so legitimate prose about the ruling *mechanic* (e.g. the
  //    Director Ruling card) never trips it.
  for (const re of [
    /\b(?:the )?director ruled\b/gi,
    /\bby director ruling\b/gi,
    /\bruled retired\b/gi,
    /\bparked, not deleted\b/gi,
    /\bkept only as the record\b/gi,
    /\b20\d{2}-\d{2}-\d{2}\b/g, // ISO dates narrate sessions, not the product
  ]) {
    for (const m of text.matchAll(re)) tokens.add(m[0]);
  }
  // 5) Backticked code-ish spans (identifiers, dotted names, routes, paths).
  for (const m of text.matchAll(/`([^`]+)`/g)) {
    const inner = m[1].trim();
    if (ALLOW_BACKTICK.has(inner)) continue;
    if (
      inner.includes('/') ||
      CODE_EXT_RE.test(inner) ||
      /[a-z][A-Z]/.test(inner) || // camelCase: appendEvent
      /\w\.\w/.test(inner) || //     dotted: raven.vision.*, source.added
      /_/.test(inner) //             snake_case: state_store
    ) {
      tokens.add('`' + inner + '`');
    }
  }
  return [...tokens];
}

function main() {
  const argRoots = process.argv.slice(2).map((a) => path.resolve(repoDir, a));
  const roots = argRoots.length > 0 ? argRoots : DEFAULT_ROOTS;

  const failures = [];
  let scanned = 0;
  for (const root of roots) {
    for (const file of walk(root)) {
      const split = splitFrontmatter(fs.readFileSync(file, 'utf8'));
      if (split == null || !(isProductCard(split.fm) || isCardPath(file))) continue;
      scanned += 1;
      const tokens = findMachineTokens(split.body);
      if (tokens.length > 0) failures.push({ label: rel(file), tokens });
    }
  }

  if (scanned === 0) {
    console.error(`No product cards found under: ${roots.map(rel).join(', ')}`);
    process.exit(2);
  }

  failures.sort((a, b) => a.label.localeCompare(b.label));
  for (const f of failures) {
    console.error(`FAIL ${f.label}`);
    console.error(`     ${f.tokens.join('  ·  ')}`);
  }

  if (failures.length > 0) {
    console.error(
      `\nMachine-language check: ${failures.length} of ${scanned} card(s) carry machine tokens in the body.`,
    );
    process.exit(1);
  }
  console.log(
    `Machine-language check passed: ${scanned} card body(ies) read as product English.`,
  );
}

main();
