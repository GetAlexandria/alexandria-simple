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
const boardModelPath = path.join(playsDir, 'board-model.js');
const statePath = path.join(playsDir, 'board-state.json');

function loadGlobalScript(filePath, globalName) {
  const source = fs.readFileSync(filePath, 'utf8');
  const context = { console };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(source, context, { filename: filePath });
  if (!context[globalName]) {
    throw new Error(`${path.relative(repoDir, filePath)} did not expose globalThis.${globalName}`);
  }
  return context[globalName];
}

const catalog = loadGlobalScript(registryPath, 'StudioCatalog');
const board = loadGlobalScript(boardModelPath, 'StudioBoardModel');
const data = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const errors = [];

const boardVisibleSlugs = catalog.RUNGS
  .filter(play => catalog.appearsOnBoard(play))
  .map(play => play.slug);
const boardVisibleSet = new Set(boardVisibleSlugs);
const graduatedResult = board.normalizeGraduatedSlugs(data.graduated, {
  allowedSlugs: boardVisibleSlugs,
});
errors.push(...graduatedResult.errors);
const graduatedSlugs = graduatedResult.graduated;
const graduatedSet = new Set(graduatedSlugs);
const activeBoardVisibleSlugs = boardVisibleSlugs.filter(slug => !graduatedSet.has(slug));

if (!data.graduatedAt || typeof data.graduatedAt !== 'object' || Array.isArray(data.graduatedAt)) {
  errors.push('graduatedAt must be an object');
} else {
  for (const slug of graduatedSlugs) {
    if (!board.isDateOnly(data.graduatedAt[slug])) {
      errors.push(`graduatedAt ${slug} must be YYYY-MM-DD`);
    }
  }
  for (const slug of Object.keys(data.graduatedAt)) {
    if (!graduatedSet.has(slug)) errors.push(`graduatedAt has stale slug ${slug}`);
  }
}

errors.push(...board.validateCanonicalStages(data.stages, {
  allowedSlugs: activeBoardVisibleSlugs,
  requireAllSlugs: true,
}));

const placedSlugs = board.boardSlugs(data.stages);
const placedSet = new Set(placedSlugs);
for (const slug of placedSlugs) {
  if (graduatedSet.has(slug)) errors.push(`slug ${slug} appears in both stages and graduated`);
}
if (!Array.isArray(data.ready)) {
  errors.push('ready must be a list');
} else {
  for (const slug of data.ready) {
    if (typeof slug !== 'string' || !slug) {
      errors.push('ready slugs must be strings');
    } else if (!placedSet.has(slug)) {
      errors.push(`ready slug ${slug} is not on the board`);
    }
  }
}

errors.push(...board.validateCards(data.cards, {
  boardSlugs: placedSlugs,
  cardPlaySlugs: [...placedSlugs, ...graduatedSlugs],
  catalog,
  requireTestingForBoardSlugs: true,
}));

if (Array.isArray(data.cards)) {
  for (const card of data.cards) {
    if (board.isTerminalCard(card) && !board.isDateOnly(card.terminalAt)) {
      errors.push(`${card.id || 'terminal card'} terminalAt must be YYYY-MM-DD`);
    }
  }
}

const migratedSource = 'migrated:studio/plays/frame-the-problem/improvements.md';
const migrated = Array.isArray(data.cards)
  ? data.cards.filter(card => typeof card.source === 'string' && card.source.startsWith(migratedSource))
  : [];
// Key the seed-integrity check on the stable card id, not the title: the
// Board UI lets a Director edit a migrated card's title, so a title match
// would couple this invariant to an editable field.
const expectedMigratedIds = [
  'wo-frame-the-problem-improvement-word-count-software-node',
  'wo-frame-the-problem-improvement-goal-gate-attributes',
  'wo-frame-the-problem-improvement-raise-eval-n-hard-case-rules',
  'wo-frame-the-problem-improvement-relate-sub-play',
  'wo-frame-the-problem-improvement-mechanical-sizing-lexicon-scan',
  'wo-frame-the-problem-improvement-example-gallery-prompts',
  'wo-frame-the-problem-improvement-cold-reader-projected-in-run',
];

for (const card of migrated) {
  if (card.type === 'bug') {
    errors.push(`${card.id} migrated from improvements.md as a Bug`);
  }
}
for (const id of expectedMigratedIds) {
  const match = migrated.find(card => card.type === 'improvement' && card.id === id);
  if (!match) errors.push(`missing migrated Improvement card: ${id}`);
}

for (const slug of placedSlugs) {
  if (!boardVisibleSet.has(slug)) errors.push(`stage contains non-board-visible play ${slug}`);
}

if (errors.length) {
  console.error('Board state check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Board state check passed: ${placedSlugs.length} play cards, ${graduatedSlugs.length} graduated plays, and ${data.cards.length} work-order cards.`);
