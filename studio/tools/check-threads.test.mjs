import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  checkThreadContent,
  checkThreads,
  extractThreadEventJsonBlocks,
  playsDir,
  productionThreadEventDirs,
} from './check-threads.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixtureDir = path.join(__dirname, 'fixtures/threads');

function read(name) {
  return fs.readFileSync(path.join(fixtureDir, name, 'thread-events.jsonl'), 'utf8').trim();
}

// The guard must surface the shipped state-event parser's messages, so this
// studio-side check and the AX append surface agree on every failure.
const parserFailures = [
  ['bad-schema-version', 'schemaVersion'],
  ['bad-missing-concern-card', 'library.thread_opened payload'],
];

describe('check-threads guard parser parity', () => {
  for (const [name, expectedMessage] of parserFailures) {
    it(`${name} fails with the shipped parser message`, () => {
      const content = read(name);
      expect(checkThreadContent(content).join('\n')).toContain(expectedMessage);
    });
  }
});

describe('check-threads guard accepted contract', () => {
  it('passes a clean thread_opened event', () => {
    const content = read('good');

    expect(checkThreadContent(content)).toEqual([]);
  });

  it('passes a clean thread_resolved event', () => {
    const content = read('resolved');
    expect(checkThreadContent(content)).toEqual([]);
  });

  it("validates the Back-of-House brief's embedded contract example", () => {
    const brief = fs.readFileSync(path.join(playsDir, 'back-of-house-walk/brief.md'), 'utf8');
    const blocks = extractThreadEventJsonBlocks(brief);

    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      expect(checkThreadContent(block)).toEqual([]);
    }
  });

  it('every production source (briefs + play/sweep event fixtures) parses clean', () => {
    const { failures, sources } = checkThreads();
    const labels = sources.map((source) => source.label);

    expect(sources.length).toBeGreaterThan(0);
    expect(productionThreadEventDirs).toEqual([
      path.join(__dirname, '../plays'),
      path.join(__dirname, '../sweeps'),
    ]);
    expect(labels).toContain(
      'studio/plays/front-of-house-walk/fixtures/small-el2/bundle/thread-events.jsonl (event 1)',
    );
    expect(labels).toContain('studio/sweeps/playmaker-studio/thread-events.jsonl (event 1)');
    expect(failures).toEqual([]);
  });

  it('validates every non-empty JSONL fixture line instead of filtering by thread type text', () => {
    const root = fs.mkdtempSync(path.join(tmpdir(), 'check-threads-'));
    try {
      const plays = path.join(root, 'plays');
      const fixtures = path.join(root, 'fixtures');
      const fixtureDir = path.join(fixtures, 'non-thread');
      fs.mkdirSync(plays, { recursive: true });
      fs.mkdirSync(fixtureDir, { recursive: true });
      fs.writeFileSync(
        path.join(fixtureDir, 'thread-events.jsonl'),
        `${JSON.stringify({
          schemaVersion: 1,
          id: '00000000-0000-4000-8000-000000000605',
          type: 'play.started',
          at: '2026-07-08T00:00:00.000Z',
          actor: { kind: 'process', host: 'ax', process: 'cli' },
          payload: {
            agentId: 'raven',
            playId: 'source-assessment',
            playRunId: 'run-thread-guard',
          },
        })}\n`,
        'utf8',
      );

      const { failures, sources } = checkThreads(plays, fixtures);

      expect(sources).toHaveLength(1);
      expect(failures).toHaveLength(1);
      expect(failures[0].errors.join('\n')).toContain(
        'Expected library.thread_opened or library.thread_resolved, got play.started.',
      );
    } finally {
      fs.rmSync(root, { force: true, recursive: true });
    }
  });
});
