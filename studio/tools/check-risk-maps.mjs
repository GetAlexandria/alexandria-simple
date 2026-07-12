#!/usr/bin/env bun
//
// check-risk-maps.mjs — drift guard for every per-play risk-map.md.
//
// WHY THIS EXISTS: the precise risk-map conformance gate lives in the viewer
// (packages/pms/viewer/src/components/studio/riskMapConformance.test.ts, parsing
// via evalPlan.ts). But scripts/fabro-validate-impacted-if-changed only runs
// the viewer suite when a PR touches packages/viewer/. A play-only PR (e.g.
// #379, which added front-of-house-walk) never ran it, so a malformed risk-map
// merged and only detonated on the next viewer-touching build (issue #384).
// This is the studio-side early-warning: wired into check.sh and the validation
// router's `studio/` branch, it fails a bad map AT THE PR THAT INTRODUCES IT.
// It imports the viewer's real parser so this guard and the detonating viewer
// gate stay byte-identical on parser failures.
//
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  FAMILY_BY_PREFIX,
  parseRiskMap,
  riskFamily,
} from '../../packages/pms/viewer/src/components/studio/evalPlan.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const studioDir = path.resolve(__dirname, '..');
const repoDir = path.resolve(studioDir, '..');
export const playsDir = path.join(studioDir, 'plays');

const canonicalPrefixes = Object.keys(FAMILY_BY_PREFIX).sort();
const canonicalPrefixList = canonicalPrefixes.join(', ');

function rel(file) {
  return path.relative(repoDir, file);
}

// Every risk-map.md under studio/plays/, walking the play dirs — mirrors the
// viewer's findRiskMaps so this guard sees exactly the set the surface renders.
export function findRiskMaps(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const sub = path.join(dir, entry.name);
    const candidate = path.join(sub, 'risk-map.md');
    if (fs.existsSync(candidate)) {
      found.push(candidate);
    }
    found.push(...findRiskMaps(sub));
  }
  return found;
}

export function checkRiskMapText(text) {
  const errors = [];
  let map;
  try {
    map = parseRiskMap(text);
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return errors;
  }

  for (const row of map.coverage) {
    if (riskFamily(row.id) == null) {
      const prefix = row.id.split('-')[0]?.toUpperCase() ?? '';
      errors.push(
        `coverage id "${row.id}" bands to non-canonical family "${prefix}" (canonical: ${canonicalPrefixList})`,
      );
    }
  }

  for (const id of new Set(map.evals.map((row) => row.risk))) {
    if (riskFamily(id) == null) {
      const prefix = id.split('-')[0]?.toUpperCase() ?? '';
      errors.push(
        `eval-plan id "${id}" bands to non-canonical family "${prefix}" (canonical: ${canonicalPrefixList})`,
      );
    }
  }

  return errors;
}

export function checkRiskMap(file) {
  return checkRiskMapText(fs.readFileSync(file, 'utf8'));
}

export function checkRiskMaps(rootDir = playsDir) {
  const maps = findRiskMaps(rootDir);
  const failures = [];

  for (const file of maps) {
    const errors = checkRiskMap(file);
    if (errors.length > 0) {
      failures.push({ errors, file });
    }
  }

  return { failures, maps };
}

function main() {
  if (canonicalPrefixes.length === 0) {
    console.error('No canonical family prefixes exported by the viewer parser — cannot validate risk-maps.');
    process.exit(2);
  }

  const { failures, maps } = checkRiskMaps(playsDir);
  if (maps.length === 0) {
    console.error(`No risk-map.md found under ${rel(playsDir)} — the walk is broken.`);
    process.exit(2);
  }

  for (const failure of failures) {
    console.error(`FAIL ${rel(failure.file)}`);
    for (const error of failure.errors) {
      console.error(`     - ${error}`);
    }
  }

  if (failures.length > 0) {
    console.error(`\nRisk-map check failed: ${failures.length} of ${maps.length} map(s) malformed.`);
    process.exit(1);
  }

  console.log(
    `Risk-map check passed: ${maps.length} per-play risk-map(s) parse and band into canonical families (${canonicalPrefixList}).`,
  );
}

if (process.argv[1] != null && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
