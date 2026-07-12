#!/usr/bin/env bun
//
// check-workflows.mjs — drift guard for the library-workflows.v1 work-thread
// contract (Capture the Work, Move S).
//
// WHY THIS EXISTS: Move S taught the Back-of-House Walk to emit a
// `workflows.json` work-thread, parsed by the viewer via the shipped
// parseLibraryCatalogWorkflows (packages/ax). But the conformance gate that
// consumes it only runs when a PR touches the app — so a play-only PR that
// drifts the brief's emit contract away from the parser would merge clean and
// only detonate at viewer-load. That is the exact trap check-risk-maps.mjs
// guards for risk-maps (issue #384). This is the studio-side early-warning: it
// runs the REAL catalog parser over (1) the contract example embedded in every
// play brief and (2) any committed workflows.json (the frozen sweep output,
// when it lands), failing a malformed contract AT THE PR THAT INTRODUCES IT.
// Importing the shipped parser keeps this guard byte-identical with the
// detonating viewer gate on contract failures.
//
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  buildLibraryCatalog,
  LIBRARY_CATALOG_MANIFEST_FILE,
  LIBRARY_CATALOG_WORKFLOWS_FILE,
  LIBRARY_CATALOG_WORKFLOWS_SCHEMA_VERSION,
  parseLibraryCatalogWorkflows,
  PRODUCT_CARD_SCHEMA_VERSION,
} from '../../packages/ax/src/domain/library-catalog.ts';
import { LIBRARY_GRAPH_SKIP_FILES } from '../../packages/ax/src/domain/library-graph.ts';

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

// Pull every fenced ```json block that declares the workflows schemaVersion out
// of a markdown doc — the contract example a play brief documents. JSON ignores
// the leading indentation the fence sits at, so the captured text parses as-is.
export function extractWorkflowJsonBlocks(markdown) {
  const blocks = [];
  const fence = /```json\b([\s\S]*?)```/g;
  let match;
  while ((match = fence.exec(markdown)) != null) {
    const body = match[1];
    if (body.includes(LIBRARY_CATALOG_WORKFLOWS_SCHEMA_VERSION)) {
      blocks.push(body.trim());
    }
  }
  return blocks;
}

// Validate one workflows.json-shaped string with the shipped parser; returns
// the parser's own metadataIssues so this guard never invents a second
// contract — a green result here means the viewer would decode it too.
export function checkWorkflowContent(content) {
  return parseLibraryCatalogWorkflows(content).metadataIssues;
}

function readJsonIfPresent(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
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

function collectMarkdownFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }
  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const sub = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(sub));
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.md') &&
      !entry.name.startsWith('.') &&
      !LIBRARY_GRAPH_SKIP_FILES.has(entry.name)
    ) {
      files.push({ content: fs.readFileSync(sub, 'utf8'), path: sub });
    }
  }
  return files;
}

function collectProductCatalogRoots(roots) {
  const catalogRoots = new Set();
  for (const root of Array.isArray(roots) ? roots : [roots]) {
    for (const manifest of findFiles(root, LIBRARY_CATALOG_MANIFEST_FILE)) {
      const parsed = readJsonIfPresent(manifest);
      if (parsed?.schemaVersion === PRODUCT_CARD_SCHEMA_VERSION) {
        catalogRoots.add(path.dirname(manifest));
      }
    }
  }
  return [...catalogRoots].sort((left, right) => rel(left).localeCompare(rel(right)));
}

function cardFlowMetadataIssues(issues) {
  return issues.filter(
    (issue) =>
      issue.startsWith(`Invalid ${LIBRARY_CATALOG_WORKFLOWS_FILE}:`) ||
      /^Invalid card .*flow/.test(issue),
  );
}

export function checkWorkflowCardRoot(root) {
  const catalog = buildLibraryCatalog({
    catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
    files: collectMarkdownFiles(root),
    libraryRoot: root,
  });
  return cardFlowMetadataIssues(catalog.meta.metadataIssues);
}

// The set of (label, content) pairs the guard validates: every brief's embedded
// contract example, every committed workflows.json (e.g. a frozen sweep), plus
// product-card roots whose aggregate-card flow blocks are parsed by AX.
export function collectWorkflowSources(plays = playsDir, sweeps = sweepRoots) {
  const sources = [];
  for (const brief of findFiles(plays, 'brief.md')) {
    const blocks = extractWorkflowJsonBlocks(fs.readFileSync(brief, 'utf8'));
    blocks.forEach((content, index) => {
      sources.push({ content, kind: 'json', label: `${rel(brief)} (json block ${index + 1})` });
    });
  }
  for (const root of Array.isArray(sweeps) ? sweeps : [sweeps]) {
    for (const file of findFiles(root, LIBRARY_CATALOG_WORKFLOWS_FILE)) {
      sources.push({ content: fs.readFileSync(file, 'utf8'), kind: 'json', label: rel(file) });
    }
  }
  for (const root of collectProductCatalogRoots(sweeps)) {
    sources.push({ kind: 'card-root', label: `${rel(root)} (card flow)`, root });
  }
  return sources;
}

export function checkWorkflows(plays = playsDir, sweeps = sweepRoots) {
  const sources = collectWorkflowSources(plays, sweeps);
  const failures = [];
  for (const source of sources) {
    const errors =
      source.kind === 'card-root'
        ? checkWorkflowCardRoot(source.root)
        : checkWorkflowContent(source.content);
    if (errors.length > 0) {
      failures.push({ errors, label: source.label });
    }
  }
  return { failures, sources };
}

function main() {
  const { failures, sources } = checkWorkflows();
  if (sources.length === 0) {
    console.error(
      `No ${LIBRARY_CATALOG_WORKFLOWS_SCHEMA_VERSION} contract example found under ${rel(playsDir)} — the emit contract lost its guarded example.`,
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
      `\nWorkflow contract check failed: ${failures.length} of ${sources.length} source(s) malformed.`,
    );
    process.exit(1);
  }

  console.log(
    `Workflow contract check passed: ${sources.length} ${LIBRARY_CATALOG_WORKFLOWS_SCHEMA_VERSION} source(s) parse with the shipped catalog parser.`,
  );
}

if (process.argv[1] != null && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
