#!/usr/bin/env node
//
// check-play-conformance.mjs — structural conformance check for the
// Back-of-House Walk Studio play (Gate 1 approved 2026-06-24, PR #377).
//
// SCOPE: intentionally specialized to `back-of-house-walk`. The expected
// moves, brief frontmatter, catalog home, and board state below are all
// hardcoded to that one play; running it against any other slug will fail.
//
// STANDALONE ON PURPOSE: this is a manually-run check (like the sibling
// check-catalog.mjs), NOT yet part of play-resync or any automated gate.
// Auto-wiring is premature until the play it guards is built and proven.
// The path before it earns a slot in the check matrix: (1) test it — add a
// failing-fixture pass so every rule is shown to fail when it should;
// (2) harden + generalize it past this single play; (3) integrate it into
// the resync/check matrix. Tracked in the issue-339 plan's Deferred Follow-Ups.
//
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
const boardPath = path.join(playsDir, 'board-state.json');

const SMALL_FIELDS = ['type', 'prefLabel', 'context', 'plane', 'status'];
const TYPED_LINK_KEYS = [
  'contains',
  'conforms_to',
  'operates_on',
  'produces',
  'related_to',
  'derived_from',
];
const RETIRED_TYPE_TERMS = ['Aggregate', 'Value', 'Read Model', 'Implementation'];
// The canonical 9-category card-type profile (§5b vocabulary reconciliation).
// This is the play's authored `type` vocabulary; there is no single code symbol
// to mirror (a card's `type` is an unconstrained string at load). The nearest
// shipped list, ATOMIC_CARD_CATEGORY_IDS in
// packages/ax/src/domain/atomic-card-categories.ts, is a different,
// folder-oriented taxonomy (plural ids, includes domains/rationale/research, no
// Component/Reference). Kept as a literal here because this standalone check has
// no package imports.
const CANONICAL_CARD_TYPES = [
  'Role',
  'Surface',
  'Entity',
  'Component',
  'Capability',
  'Mechanism',
  'Pattern',
  'Economy',
  'Reference',
];
const EXPECTED_MOVES = [
  'translate_search_prior',
  'survey',
  'pass1_events',
  'pass2_carve',
  'pass3_altitude',
  'emit_bundle',
  'check_bundle',
  'acp_failed',
];

function rel(file) {
  return path.relative(repoDir, file);
}

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

function readRequired(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required file: ${rel(file)}`);
  }
  return fs.readFileSync(file, 'utf8');
}

function frontmatterValue(text, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`^${escaped}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim() : null;
}

function containsWord(text, word) {
  return new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`).test(text);
}

function checkNoRetiredSyntax(files) {
  const errors = [];
  for (const [file, text] of files) {
    const fileRel = rel(file);
    if (/^job:/m.test(text)) {
      errors.push(`${fileRel} declares retired job frontmatter`);
    }
    if (text.includes('__AX2_')) {
      errors.push(`${fileRel} contains retired __AX2_ placeholder spelling`);
    }
    for (const match of text.matchAll(/__AX[A-Za-z0-9_]*__/g)) {
      const token = match[0];
      if (!/^__AX_[A-Z0-9_]+__$/.test(token)) {
        errors.push(`${fileRel} contains malformed AX placeholder ${token}`);
      }
    }
    if (/\bwikilinks?\b/i.test(text)) {
      errors.push(`${fileRel} still describes relationships as wikilinks`);
    }
  }
  return errors;
}

function checkBriefFrontmatter(briefPath, briefText) {
  const errors = [];
  const expected = {
    division: 'Product',
    function: 'Library Operations',
    'built-by': 'PlaymakerStudio',
  };

  for (const [key, value] of Object.entries(expected)) {
    const actual = frontmatterValue(briefText, key);
    if (actual !== value) {
      errors.push(`${rel(briefPath)} expected ${key}: ${value}, found ${actual ?? '(missing)'}`);
    }
  }

  // Gate 1 was approved 2026-06-24 (PR #377): the brief must now record that
  // approval. The pre-Gate-1 assertions this check once carried have served
  // their purpose and are retired with the gate.
  const gate = frontmatterValue(briefText, 'gate-1') ?? '';
  if (!/^approved\b/i.test(gate)) {
    errors.push(`${rel(briefPath)} no longer records Gate 1 approval (gate-1: ${gate || '(missing)'})`);
  }

  return errors;
}

function checkOutputContract(briefText, movesText, riskText) {
  const errors = [];
  const contractText = `${briefText}\n${movesText}\n${riskText}`;

  for (const field of SMALL_FIELDS) {
    if (!containsWord(contractText, field)) {
      errors.push(`output contract is missing Small frontmatter field ${field}`);
    }
  }

  for (const key of TYPED_LINK_KEYS) {
    if (!containsWord(contractText, key)) {
      errors.push(`output contract is missing typed-link key ${key}`);
    }
  }

  for (const term of RETIRED_TYPE_TERMS) {
    if (containsWord(contractText, term)) {
      errors.push(`output contract still contains retired type term ${term}`);
    }
  }

  // The canonical 9-category type profile (§5b vocabulary reconciliation) must
  // be declared — every category named, and the list signature "Role · Surface
  // · Entity" present (· or / separated) so it reads as a profile, not a stray
  // word or a link target like "Role - Director". Widened from the 7-term Brick
  // 0 Studio profile (Agent / System now ride as labels, not types).
  for (const category of CANONICAL_CARD_TYPES) {
    if (!containsWord(contractText, category)) {
      errors.push(`output contract is missing canonical card type ${category}`);
    }
  }
  if (!/\bRole\s*[/·]\s*Surface\s*[/·]\s*Entity\b/.test(contractText)) {
    errors.push(
      'output contract does not declare the canonical 9-category type profile (Role · Surface · Entity · …)',
    );
  }
  // The Small floor needs a real plane: field carrying a ruled value — not the
  // bare word "Product", which also names the division and appears in prose.
  if (!/\bplane:\s*(?:Strategy|Product|Learning)\b/.test(contractText)) {
    errors.push('output contract has no card example with a valid plane: (Strategy | Product | Learning)');
  }

  return errors;
}

function checkMoveGraph(briefText, movesText) {
  const errors = [];
  for (const move of EXPECTED_MOVES) {
    if (!new RegExp(`^${move}:\\s*$`, 'm').test(briefText)) {
      errors.push(`brief move graph is missing move ${move}`);
    }
    if (!new RegExp(`^###\\s+${move}\\s*$`, 'm').test(movesText)) {
      errors.push(`moves overlay is missing heading for ${move}`);
    }
  }
  if (!/REPAIR\s+→\s+emit_bundle/.test(briefText)) {
    errors.push('brief move graph is missing check_bundle REPAIR → emit_bundle bounce');
  }
  if (!/check_bundle/.test(movesText) || !/emit_bundle/.test(movesText)) {
    errors.push('moves overlay does not preserve check_bundle / emit_bundle route story');
  }
  return errors;
}

function checkCatalogHome(catalog, slug) {
  const errors = [];
  const play = catalog.RUNGS.find(record => record.slug === slug);
  if (!play) {
    return [`registry.js is missing ${slug}`];
  }
  const pathLabel = catalog.catalogPath(play);
  if (pathLabel !== 'Product / Library Operations / Raven') {
    errors.push(`${slug} catalog path is ${pathLabel}, expected Product / Library Operations / Raven`);
  }
  if (play.doc !== `${slug}/brief.md`) {
    errors.push(`${slug} registry doc is ${play.doc ?? '(missing)'}, expected ${slug}/brief.md`);
  }
  if (Object.prototype.hasOwnProperty.call(play, 'builtBy') || Object.prototype.hasOwnProperty.call(play, 'built_by')) {
    errors.push(`${slug} stores built-by provenance in registry.js instead of the brief/Ledger`);
  }
  return errors;
}

function checkBoard(slug) {
  const errors = [];
  const board = JSON.parse(fs.readFileSync(boardPath, 'utf8'));
  if (!Array.isArray(board.ready) || !board.ready.includes(slug)) {
    errors.push(`board-state.json ready list does not include ${slug}`);
  }
  if (!board.stages || !Array.isArray(board.stages.designed) || !board.stages.designed.includes(slug)) {
    errors.push(`board-state.json designed stage does not include ${slug}`);
  }
  for (const stage of ['built', 'proven', 'live']) {
    if (Array.isArray(board.stages?.[stage]) && board.stages[stage].includes(slug)) {
      errors.push(`board-state.json incorrectly places ${slug} in ${stage}`);
    }
  }
  return errors;
}

function main() {
  const playDirArg = process.argv[2];
  if (!playDirArg) {
    console.error('Usage: node studio/tools/check-play-conformance.mjs <studio/plays/<slug>>');
    process.exit(2);
  }

  const playDir = path.resolve(process.cwd(), playDirArg);
  const slug = path.basename(playDir);
  const briefPath = path.join(playDir, 'brief.md');
  const movesPath = path.join(playDir, 'moves.md');
  const riskPath = path.join(playDir, 'risk-map.md');

  const briefText = readRequired(briefPath);
  const movesText = readRequired(movesPath);
  const riskText = readRequired(riskPath);
  const files = [
    [briefPath, briefText],
    [movesPath, movesText],
    [riskPath, riskText],
  ];
  const catalog = loadCatalog();

  const errors = [
    ...checkNoRetiredSyntax(files),
    ...checkBriefFrontmatter(briefPath, briefText),
    ...checkOutputContract(briefText, movesText, riskText),
    ...checkMoveGraph(briefText, movesText),
    ...checkCatalogHome(catalog, slug),
    ...checkBoard(slug),
  ];

  if (errors.length > 0) {
    console.error(`Play conformance check failed for ${slug}:`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Play conformance check passed: ${slug} is ready to derive.`);
}

main();
