#!/usr/bin/env bun
//
// check-threads.mjs — drift guard for ledger-sourced library thread events.
//
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  parseLibraryThreadOpened,
  parseLibraryThreadResolved,
  validateAlexandriaStateEvent,
} from '../../packages/ax/src/domain/state-events.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const studioDir = path.resolve(__dirname, '..');
const repoDir = path.resolve(studioDir, '..');
export const playsDir = path.join(studioDir, 'plays');
export const productionThreadEventDirs = [
  path.join(studioDir, 'plays'),
  path.join(studioDir, 'sweeps'),
];

function rel(file) {
  return path.relative(repoDir, file);
}

function isThreadEventJson(content) {
  return (
    content.includes('"library.thread_opened"') || content.includes('"library.thread_resolved"')
  );
}

// Pull every fenced ```json block that declares a library thread event out of a
// markdown doc. JSON ignores the leading indentation the fence sits at, so the
// captured text parses as-is.
export function extractThreadEventJsonBlocks(markdown) {
  const blocks = [];
  const fence = /```json\b([\s\S]*?)```/g;
  let match;
  while ((match = fence.exec(markdown)) != null) {
    const body = match[1];
    if (isThreadEventJson(body)) {
      blocks.push(body.trim());
    }
  }
  return blocks;
}

// Validate one full ledger event JSON object with AX's shipped state-event
// parser; returns parser messages so this guard never invents a second contract.
export function checkThreadContent(content) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    return [error instanceof Error ? error.message : String(error)];
  }

  const event = validateAlexandriaStateEvent(parsed);
  if (event instanceof Error) {
    return [event.message];
  }

  if (parseLibraryThreadOpened(event) == null && parseLibraryThreadResolved(event) == null) {
    return [`Expected library.thread_opened or library.thread_resolved, got ${event.type}.`];
  }

  return [];
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

function readJsonlEvents(file) {
  return fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// The set of (label, content) pairs the guard validates: every brief's embedded
// event contract example, plus committed thread-event fixture JSONL files.
export function collectThreadSources(plays = playsDir, fixtures = productionThreadEventDirs) {
  const sources = [];
  for (const brief of findFiles(plays, 'brief.md')) {
    const blocks = extractThreadEventJsonBlocks(fs.readFileSync(brief, 'utf8'));
    blocks.forEach((content, index) => {
      sources.push({ content, label: `${rel(brief)} (json block ${index + 1})` });
    });
  }
  for (const root of Array.isArray(fixtures) ? fixtures : [fixtures]) {
    for (const file of findFiles(root, 'thread-events.jsonl')) {
      readJsonlEvents(file).forEach((content, index) => {
        sources.push({ content, label: `${rel(file)} (event ${index + 1})` });
      });
    }
  }
  return sources;
}

export function checkThreads(plays = playsDir, fixtures = productionThreadEventDirs) {
  const sources = collectThreadSources(plays, fixtures);
  const failures = [];
  for (const source of sources) {
    const errors = checkThreadContent(source.content);
    if (errors.length > 0) {
      failures.push({ errors, label: source.label });
    }
  }
  return { failures, sources };
}

function main() {
  const { failures, sources } = checkThreads();
  if (sources.length === 0) {
    console.error(
      `No library thread event contract example found under ${rel(playsDir)} — the emit contract lost its guarded example.`,
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
      `\nThread contract check failed: ${failures.length} of ${sources.length} source(s) malformed.`,
    );
    process.exit(1);
  }

  console.log(
    `Thread contract check passed: ${sources.length} source(s) parse with the shipped event parser.`,
  );
}

if (process.argv[1] != null && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
