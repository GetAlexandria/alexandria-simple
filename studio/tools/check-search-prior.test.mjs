import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseLibrarySearchPrior } from '../../packages/ax/src/domain/library-search-prior.ts';
import {
  checkSearchPrior,
  checkSearchPriorContent,
  extractSearchPriorJsonBlocks,
  playsDir,
} from './check-search-prior.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixtureDir = path.join(__dirname, 'fixtures/search-prior');

function read(name) {
  return fs.readFileSync(path.join(fixtureDir, name, 'library-search-prior.json'), 'utf8');
}

const parserFailures = [
  [
    'bad-schema-version',
    'Invalid library-search-prior.json: schemaVersion must be library-search-prior.v1',
  ],
  [
    'bad-missing-confidence',
    'Invalid library-search-prior.json: domain.actors[0]: missing confidence',
  ],
  ['bad-shape', 'Invalid library-search-prior.json: workThread.shape: missing basis'],
  [
    'bad-low-no-question',
    'Invalid library-search-prior.json: low-confidence workThread.stateField must have an openQuestions entry',
  ],
];

describe('check-search-prior guard parser parity', () => {
  for (const [name, expectedMessage] of parserFailures) {
    it(`${name} fails with the shipped parser message`, () => {
      const content = read(name);
      expect(parseLibrarySearchPrior(content).metadataIssues).toContain(expectedMessage);
      expect(checkSearchPriorContent(content)).toContain(expectedMessage);
    });
  }
});

describe('check-search-prior guard accepted contract', () => {
  it('passes the canonical Back-of-House search prior example', () => {
    const content = read('good');
    const parsed = parseLibrarySearchPrior(content);

    expect(parsed.metadataIssues).toEqual([]);
    expect(parsed.prior?.workThread.shape.value).toBe('pipeline');
    expect(parsed.prior?.openQuestions.map((question) => question.about)).toContain('stateField');
    expect(checkSearchPriorContent(content)).toEqual([]);
  });

  it("validates the Back-of-House brief's embedded contract example", () => {
    const brief = fs.readFileSync(path.join(playsDir, 'back-of-house-walk/brief.md'), 'utf8');
    const blocks = extractSearchPriorJsonBlocks(brief);

    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      expect(checkSearchPriorContent(block)).toEqual([]);
    }
  });

  it('every production source (briefs + swept outputs) parses clean', () => {
    const { failures, sources } = checkSearchPrior();

    expect(sources.length).toBeGreaterThan(0);
    expect(failures).toEqual([]);
  });
});
