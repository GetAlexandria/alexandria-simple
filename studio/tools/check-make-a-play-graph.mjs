#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoDir = path.resolve(__dirname, '..', '..');
const playDir = path.resolve(process.argv[2] || path.join(repoDir, 'studio', 'plays', 'make-a-play'));
const briefPath = path.join(playDir, 'brief.md');
const gatePath = path.join(playDir, 'gates', 'gate-1.json');
const registryPath = path.join(repoDir, 'studio', 'plays', 'registry.js');
const allowedTags = new Set(['judgment', 'command', 'human-gate', 'contract']);

function loadCatalog() {
  const source = fs.readFileSync(registryPath, 'utf8');
  const context = { console };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(source, context, { filename: registryPath });
  if (!context.StudioCatalog) throw new Error('registry.js did not expose StudioCatalog');
  return context.StudioCatalog;
}

function section(text, startHeading, endHeading) {
  const start = text.indexOf(startHeading);
  if (start < 0) return '';
  const end = text.indexOf(endHeading, start + startHeading.length);
  return text.slice(start, end < 0 ? text.length : end);
}

function extractDoerTags(brief) {
  const graph = section(brief, '## 4.', '## 5.');
  const errors = [];
  const tags = {};
  let inFence = false;
  let current = null;
  let doerCount = 0;

  for (const rawLine of graph.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+$/, '');
    if (line.trim() === '```') {
      if (current && doerCount !== 1) errors.push(`${current} must declare exactly one doer tag`);
      inFence = !inFence;
      current = null;
      doerCount = 0;
      continue;
    }
    if (!inFence) continue;

    const node = line.match(/^([a-z][a-z0-9_]*):(?:\s|$)/);
    if (node) {
      if (current && doerCount !== 1) errors.push(`${current} must declare exactly one doer tag`);
      current = node[1];
      doerCount = 0;
      continue;
    }

    const doer = line.match(/^\s+doer:\s+(.+?)\s*$/);
    if (!doer || !current) continue;
    doerCount += 1;
    const tag = doer[1].replace(/\s*\(.*$/, '').trim();
    if (!allowedTags.has(tag)) {
      errors.push(`${current} declares invalid doer tag ${tag}`);
      continue;
    }
    tags[current] = tag;
  }
  if (current && doerCount !== 1) errors.push(`${current} must declare exactly one doer tag`);
  if (!Object.keys(tags).length) errors.push('no §4 doer tags found');
  return { errors, tags };
}

function frontmatterValue(text, key) {
  const match = text.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim() : null;
}

function checkNoBuiltByFilingFields(catalog, brief) {
  const errors = [];
  const retired = ['built-by', 'built_by', 'builtBy'];
  for (const field of retired) {
    if (new RegExp(`^${field}:\\s*`, 'm').test(brief)) {
      errors.push(`brief declares retired filing field ${field}`);
    }
  }
  const play = catalog.RUNGS.find(record => record.slug === 'make-a-play');
  if (!play) {
    errors.push('catalog is missing make-a-play');
    return errors;
  }
  for (const field of retired) {
    if (Object.prototype.hasOwnProperty.call(play, field)) {
      errors.push(`catalog make-a-play declares retired filing field ${field}`);
    }
  }
  return errors;
}

function gateErrors(tags) {
  if (!fs.existsSync(gatePath)) return [`missing Gate 1 approval record: ${path.relative(repoDir, gatePath)}`];
  const gate = JSON.parse(fs.readFileSync(gatePath, 'utf8'));
  const errors = [];
  if (gate.gate !== 'gate-1') errors.push('Gate 1 record gate must be gate-1');
  if (gate.play !== 'make-a-play') errors.push('Gate 1 record play must be make-a-play');
  if (gate.decision !== 'approved') errors.push('Gate 1 record decision must be approved');
  if (!gate.approvedDoerTags || typeof gate.approvedDoerTags !== 'object' || Array.isArray(gate.approvedDoerTags)) {
    errors.push('Gate 1 record must carry approvedDoerTags');
    return errors;
  }
  for (const [node, tag] of Object.entries(tags)) {
    if (gate.approvedDoerTags[node] !== tag) {
      errors.push(`Gate 1 approved ${node} as ${gate.approvedDoerTags[node]}, brief declares ${tag}`);
    }
  }
  for (const node of Object.keys(gate.approvedDoerTags)) {
    if (!tags[node]) errors.push(`Gate 1 approved unknown node ${node}`);
  }
  return errors;
}

const errors = [];
if (!fs.existsSync(briefPath)) errors.push(`missing brief: ${path.relative(repoDir, briefPath)}`);
const brief = errors.length ? '' : fs.readFileSync(briefPath, 'utf8');
const catalog = loadCatalog();

if (brief) {
  if (frontmatterValue(brief, 'division') !== 'PlaymakerStudio') {
    errors.push('brief division must be PlaymakerStudio');
  }
  if (frontmatterValue(brief, 'function') !== 'Production') {
    errors.push('brief function must be Production');
  }
  if (brief.includes('frame-the-problem-next')) {
    errors.push('brief still references retired frame-the-problem-next exemplar');
  }
  const graph = extractDoerTags(brief);
  errors.push(...graph.errors);
  errors.push(...gateErrors(graph.tags));
  errors.push(...checkNoBuiltByFilingFields(catalog, brief));
}

const play = catalog.RUNGS.find(record => record.slug === 'make-a-play');
if (play) {
  if (play.division !== 'PlaymakerStudio' || play.function !== 'Production') {
    errors.push('make-a-play must file as PlaymakerStudio / Production');
  }
  if (catalog.faceForPlay(play) !== 'William') {
    errors.push('make-a-play must derive face William from PlaymakerStudio');
  }
  if (!catalog.appearsOnBoard(play)) {
    errors.push('make-a-play must be board-visible');
  }
}

if (errors.length) {
  console.error('make-a-play graph check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`make-a-play graph check passed: ${Object.keys(extractDoerTags(brief).tags).length} doer-tagged nodes.`);
