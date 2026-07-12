import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import { parseLibraryCatalogWorkflows } from '../../packages/ax/src/domain/library-catalog.ts';
import {
  checkWorkflowCardRoot,
  checkWorkflowContent,
  checkWorkflows,
  extractWorkflowJsonBlocks,
  playsDir,
} from './check-workflows.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixtureDir = path.join(__dirname, 'fixtures/workflows');

function read(name) {
  return fs.readFileSync(path.join(fixtureDir, name, 'workflows.json'), 'utf8');
}

function cardRoot(name) {
  return path.join(fixtureDir, name);
}

// The guard must surface exactly the shipped parser's metadataIssues — so this
// studio-side check and the detonating viewer gate agree on every failure.
const parserFailures = [
  ['bad-schema-version', 'Invalid workflows.json: schemaVersion must be library-workflows.v1'],
  ['bad-missing-context', 'Invalid workflows.json: workflow "play-production" step 2: missing context'],
  ['bad-cardrefs', 'Invalid workflows.json: workflow "play-production" step 3: cardRefs[0] must be a non-empty string'],
];

describe('check-workflows guard parser parity', () => {
  for (const [name, expectedMessage] of parserFailures) {
    it(`${name} fails with the shipped parser message`, () => {
      const content = read(name);
      expect(parseLibraryCatalogWorkflows(content).metadataIssues).toContain(expectedMessage);
      expect(checkWorkflowContent(content)).toContain(expectedMessage);
    });
  }
});

describe('check-workflows guard accepted contract', () => {
  it('passes the canonical 9-step PMS work-thread (the OUT-6 answer key)', () => {
    const content = read('good');
    const parsed = parseLibraryCatalogWorkflows(content);

    expect(parsed.metadataIssues).toEqual([]);
    expect(parsed.workflows).toHaveLength(1);
    expect(parsed.workflows[0].id).toBe('play-production');
    expect(parsed.workflows[0].steps).toHaveLength(9);
    // The thread revisits a place — board at order 3 and 7 (the two gates) —
    // which is the recurring-context shape the Workflow lens (#448) renders.
    const board = parsed.workflows[0].steps.filter((step) => step.context === 'board');
    expect(board.map((step) => step.order)).toEqual([3, 7]);
    expect(checkWorkflowContent(content)).toEqual([]);
  });

  it("validates the Back-of-House brief's embedded contract example", () => {
    // The emit contract moved from a workflows.json sidecar to a `flow:`
    // block on the central record's aggregate card (2026-07-08). The brief
    // documents the flow shape as YAML; extract it and run it through the
    // shipped card-flow parser exactly as the loader would.
    const brief = fs.readFileSync(path.join(playsDir, 'back-of-house-walk/brief.md'), 'utf8');
    expect(extractWorkflowJsonBlocks(brief)).toEqual([]); // sidecar examples retired

    const flowBlocks = [...brief.matchAll(/```yaml\r?\n([\s\S]*?)```/g)]
      .map((m) => m[1])
      .filter((block) => /(^|\n)\s*flow:/.test(block))
      .map((block) => {
        // Dedent: the brief embeds the example inside an indented prompt.
        const lines = block.split('\n').filter((line) => line.trim().length > 0);
        const indent = Math.min(...lines.map((line) => line.length - line.trimStart().length));
        return block
          .split('\n')
          .map((line) => line.slice(indent))
          .join('\n');
      });
    expect(flowBlocks.length).toBeGreaterThan(0);

    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'boh-flow-'));
    try {
      for (const [index, flow] of flowBlocks.entries()) {
        const dir = path.join(root, 'playbook/Entity');
        fs.mkdirSync(dir, { recursive: true });
        // refs in the brief's example name illustrative cards; emit stubs so
        // the parser validates shape without dangling-ref noise.
        const refs = [...flow.matchAll(/refs: \[([^\]]*)\]/g)]
          .flatMap((m) => m[1].split(',').map((r) => r.trim()))
          .filter((r) => r.length > 0);
        for (const ref of refs) {
          const [refType] = ref.split(' - ');
          const refDir = path.join(root, 'playbook', refType);
          fs.mkdirSync(refDir, { recursive: true });
          fs.writeFileSync(
            path.join(refDir, `${ref}.md`),
            `---\nplane: product\nstatus: stub\naltitude: component\n---\n\n## WHAT\nStub.\n\n## WHERE\nStub.\n\n## HOW\nStub.\n`,
          );
        }
        fs.writeFileSync(
          path.join(dir, `Entity - Flow Example ${index}.md`),
          `---\nplane: product\nstatus: stub\naltitude: aggregate\n${flow}---\n\n## WHAT\nStub.\n\n## WHERE\nStub.\n\n## HOW\nStub.\n`,
        );
      }
      expect(checkWorkflowCardRoot(root)).toEqual([]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('every production source (briefs + swept outputs) parses clean', () => {
    const { failures, sources } = checkWorkflows();

    expect(sources.length).toBeGreaterThan(0);
    expect(failures).toEqual([]);
  });
});

describe('check-workflows guard card-flow contract', () => {
  it('passes aggregate-card flow through the shipped catalog builder', () => {
    expect(checkWorkflowCardRoot(cardRoot('card-good'))).toEqual([]);
  });

  it('reports object-list flow on a non-aggregate card', () => {
    expect(checkWorkflowCardRoot(cardRoot('card-bad-owner'))).toContain(
      'Invalid card playbook/Value/Value - Stage.md: workflow flow is valid only on altitude aggregate cards',
    );
  });

  it('reports staged string-list flow on a non-Pattern non-Mechanism card', () => {
    expect(checkWorkflowCardRoot(cardRoot('card-bad-staged-owner'))).toContain(
      'Invalid card playbook/Value/Value - Stage.md: staged flow is valid only on Pattern or Mechanism cards',
    );
  });

  it('reports malformed card-flow steps', () => {
    const errors = checkWorkflowCardRoot(cardRoot('card-bad-step'));
    expect(errors).toContain(
      'Invalid card playbook/Entity/Entity - Play Run.md: flow[0].refs must be a list of strings',
    );
    expect(errors).toContain(
      'Invalid card playbook/Entity/Entity - Play Run.md: flow produced no valid workflow steps',
    );
  });

  it('reports dangling card-flow refs through the workflow cardRefs validator', () => {
    expect(checkWorkflowCardRoot(cardRoot('card-dangling-ref'))).toContain(
      'Invalid workflows.json: workflow "entity-play-run" step 0 references unknown card "Entity - Ghost"',
    );
  });
});
