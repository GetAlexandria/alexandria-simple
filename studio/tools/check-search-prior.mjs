#!/usr/bin/env bun
//
// check-search-prior.mjs — drift guard for the library-search-prior.v1
// search-prior contract (Back-of-House Walk opening prior).
//
// WHY THIS EXISTS: the Back-of-House Walk emits a `library-search-prior.json`
// before scanning source when a Basic Product Description is present. The prior
// is a lead list, not a fact layer, but malformed confidence fields or missing
// low-confidence questions would make the later workflow/thread handoff
// dishonest. This guard mirrors check-workflows/check-threads: it runs the
// shipped AX parser over (1) the contract example embedded in play briefs and
// (2) any committed library-search-prior.json sweep output, so play-only edits
// cannot drift the contract away from the parser.
//
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  LIBRARY_SEARCH_PRIOR_FILE,
  LIBRARY_SEARCH_PRIOR_SCHEMA_VERSION,
  parseLibrarySearchPrior,
} from '../../packages/ax/src/domain/library-search-prior.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const studioDir = path.resolve(__dirname, '..');
const repoDir = path.resolve(studioDir, '..');
export const playsDir = path.join(studioDir, 'plays');
export const sweepsDir = path.join(studioDir, 'sweeps');
// Alexandria's own product library lives in Alexandria's data home, not under
// studio/ (library migration, Slice 2).
export const sweepRoots = [
  sweepsDir,
  path.join(repoDir, 'docs/alexandria/library'),
  path.join(repoDir, 'docs/alexandria/sweeps'),
];

function rel(file) {
  return path.relative(repoDir, file);
}

export function extractSearchPriorJsonBlocks(markdown) {
  const blocks = [];
  const fence = /```json\b([\s\S]*?)```/g;
  let match;
  while ((match = fence.exec(markdown)) != null) {
    const body = match[1];
    if (body.includes(LIBRARY_SEARCH_PRIOR_SCHEMA_VERSION)) {
      blocks.push(body.trim());
    }
  }
  return blocks;
}

export function checkSearchPriorContent(content) {
  return parseLibrarySearchPrior(content).metadataIssues;
}

function findFiles(dir, name) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const sub = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...findFiles(sub, name));
    } else if (entry.name === name) {
      found.push(sub);
    }
  }
  return found;
}

export function collectSearchPriorSources(plays = playsDir, sweeps = sweepRoots) {
  const sources = [];
  for (const brief of findFiles(plays, 'brief.md')) {
    const blocks = extractSearchPriorJsonBlocks(fs.readFileSync(brief, 'utf8'));
    blocks.forEach((content, index) => {
      sources.push({ content, label: `${rel(brief)} (json block ${index + 1})` });
    });
  }
  for (const root of Array.isArray(sweeps) ? sweeps : [sweeps]) {
    for (const file of findFiles(root, LIBRARY_SEARCH_PRIOR_FILE)) {
      sources.push({ content: fs.readFileSync(file, 'utf8'), label: rel(file) });
    }
  }
  return sources;
}

export function checkSearchPrior(plays = playsDir, sweeps = sweepRoots) {
  const sources = collectSearchPriorSources(plays, sweeps);
  const failures = [];
  for (const source of sources) {
    const errors = checkSearchPriorContent(source.content);
    if (errors.length > 0) {
      failures.push({ errors, label: source.label });
    }
  }
  return { failures, sources };
}

function main() {
  const { failures, sources } = checkSearchPrior();
  if (sources.length === 0) {
    console.error(
      `No ${LIBRARY_SEARCH_PRIOR_SCHEMA_VERSION} contract example found under ${rel(playsDir)} — the search-prior emit contract lost its guarded example.`,
    );
    process.exit(2);
  }

  for (const failure of failures) {
    console.error(`FAIL ${failure.label}`);
    for (const error of failure.errors) {
      console.error(`     - ${error}`);
    }
  }

  if (failures.length > 0) {
    console.error(
      `\nSearch-prior contract check failed: ${failures.length} of ${sources.length} source(s) malformed.`,
    );
    process.exit(1);
  }

  console.log(
    `Search-prior contract check passed: ${sources.length} ${LIBRARY_SEARCH_PRIOR_SCHEMA_VERSION} source(s) parse with the shipped AX parser.`,
  );
}

if (process.argv[1] != null && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
