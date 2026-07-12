import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseRiskMap, riskFamily } from '../../packages/pms/viewer/src/components/studio/evalPlan.ts';
import { checkRiskMap, checkRiskMaps, playsDir } from './check-risk-maps.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixtureDir = path.join(__dirname, 'fixtures/risk-maps');

function fixtureRiskMap(name) {
  return path.join(fixtureDir, name, 'risk-map.md');
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function viewerParserMessage(file) {
  try {
    parseRiskMap(read(file));
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  throw new Error(`Expected viewer parser to reject ${file}`);
}

const parserFailures = [
  ['bad-coverage-state', 'risk-map: unparseable coverage state "blocked"'],
  ['bad-coverage-id-without-name', 'risk-map: coverage risk cell missing "<id> <name>": "IN-1"'],
  ['bad-scope', 'risk-map: unknown scope "galaxy"'],
  ['bad-test-type', 'risk-map: unknown test type "simulation"'],
  ['bad-target', 'risk-map: unparseable target "many"'],
  ['bad-built', 'risk-map: built must be yes/no, got "maybe"'],
  ['bad-runs', 'risk-map: runs must be a count, got "two"'],
  ['bad-missing-separator', 'risk-map: no Coverage table (| risk | state | \u2026 |)'],
];

describe('check-risk-maps guard parser parity', () => {
  for (const [name, expectedMessage] of parserFailures) {
    it(`${name} fails with the viewer parser message`, () => {
      const file = fixtureRiskMap(name);
      expect(viewerParserMessage(file)).toBe(expectedMessage);
      expect(checkRiskMap(file)).toEqual([expectedMessage]);
    });
  }

  it('rejects a first-cell-valid map that the old coarse mirror would have missed', () => {
    const file = fixtureRiskMap('bad-scope');
    const text = read(file);

    expect(riskFamily('IN-1')).toBe('Input');
    expect(text).toContain('| IN-1 Buried signal | gap | covered by fixture |');
    expect(text).toContain(
      '| IN-1 | parser parity scope | galaxy | metamorphic | no | 30 | 0 | pending |',
    );
    expect(checkRiskMap(file)).toEqual(['risk-map: unknown scope "galaxy"']);
  });
});

describe('check-risk-maps guard canonical family banding', () => {
  it('rejects a non-canonical coverage risk id', () => {
    expect(checkRiskMap(fixtureRiskMap('bad-family-coverage'))).toEqual([
      'coverage id "FTP-1" bands to non-canonical family "FTP" (canonical: ADV, CHN, IN, OUT, RE)',
    ]);
  });

  it('rejects a non-canonical eval-plan risk id', () => {
    expect(checkRiskMap(fixtureRiskMap('bad-family-eval'))).toEqual([
      'eval-plan id "FTP-1" bands to non-canonical family "FTP" (canonical: ADV, CHN, IN, OUT, RE)',
    ]);
  });
});

describe('check-risk-maps guard accepted maps', () => {
  it('passes a well-formed fixture map', () => {
    expect(checkRiskMap(fixtureRiskMap('good'))).toEqual([]);
  });

  it('ignores a sibling play directory that has no risk-map.md', () => {
    const root = path.join(fixtureDir, 'valid-with-sibling');
    const result = checkRiskMaps(root);

    expect(result.maps.map((file) => path.relative(root, file))).toEqual([
      path.join('good-play', 'risk-map.md'),
    ]);
    expect(result.failures).toEqual([]);
  });

  it('still exposes an empty walk when no risk-map.md files are found', () => {
    const result = checkRiskMaps(path.join(fixtureDir, 'no-risk-map-only'));

    expect(result.maps).toEqual([]);
    expect(result.failures).toEqual([]);
  });

  it('passes every current production Studio risk-map', () => {
    const result = checkRiskMaps(playsDir);

    expect(result.maps.length).toBeGreaterThan(0);
    expect(result.failures).toEqual([]);
  });
});
