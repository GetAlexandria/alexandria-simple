#!/usr/bin/env bun
//
// check-library-identity.mjs — drift guard for path-first product-card identity.
//
// The guard imports the shipped AX catalog builder and asserts the parser's own
// metadataIssues over focused fixture roots plus the real Alexandria library.
// It does not duplicate the catalog validation rules.
//
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  buildLibraryCatalog,
  DUPLICATE_LIBRARY_CARD_STEM_ISSUE_PREFIX,
  PRODUCT_CARD_IDENTITY_MISMATCH_ISSUE_PREFIX,
  PRODUCT_CARD_SCHEMA_VERSION,
  RESERVED_LIBRARY_CONTEXT_ISSUE_PREFIX,
} from '../../packages/ax/src/domain/library-catalog.ts';
import { LIBRARY_GRAPH_SKIP_FILES } from '../../packages/ax/src/domain/library-graph.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const studioDir = path.resolve(__dirname, '..');
const repoDir = path.resolve(studioDir, '..');

export const libraryIdentityFixtureDir = path.join(__dirname, 'fixtures/library-identity');
export const realLibraryRoot = path.join(repoDir, 'docs/alexandria/library');

export const libraryIdentityFixtureCases = [
  {
    expectedIssues: [
      {
        count: 1,
        includes: ['runtime/Entity/Entity - X.md'],
        prefix: RESERVED_LIBRARY_CONTEXT_ISSUE_PREFIX,
      },
    ],
    name: 'reserved',
  },
  {
    expectedIssues: [
      {
        count: 2,
        includes: ['alpha/Entity/Entity - Same.md', 'beta/Entity/Entity - Same.md'],
        prefix: DUPLICATE_LIBRARY_CARD_STEM_ISSUE_PREFIX,
      },
    ],
    name: 'duplicate',
  },
  {
    expectedIssues: [
      {
        count: 1,
        includes: ['frontmatter type "Concept" vs path "Entity"'],
        prefix: PRODUCT_CARD_IDENTITY_MISMATCH_ISSUE_PREFIX,
      },
    ],
    name: 'mismatch',
  },
  {
    expectedIssues: [],
    name: 'matching',
  },
  {
    expectedIssues: [],
    name: 'v2-index',
  },
];

function rel(file) {
  return path.relative(repoDir, file);
}

function collectMarkdownFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const files = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true }).sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const sub = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(sub));
      continue;
    }
    if (
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

export function checkLibraryIdentityRoot(root) {
  return buildLibraryCatalog({
    catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
    files: collectMarkdownFiles(root),
    libraryRoot: root,
  }).meta.metadataIssues;
}

function checkExpectedIssues(expectedIssues, issues) {
  const failures = [];
  const expectedCount = expectedIssues.reduce((total, expected) => total + expected.count, 0);

  for (const expected of expectedIssues) {
    const matches = issues.filter((issue) => issue.startsWith(expected.prefix));
    if (matches.length !== expected.count) {
      failures.push(
        `expected ${expected.count} issue(s) starting "${expected.prefix}", saw ${matches.length}`,
      );
      continue;
    }
    for (const requiredText of expected.includes ?? []) {
      if (!matches.some((issue) => issue.includes(requiredText))) {
        failures.push(`expected a "${expected.prefix}" issue containing "${requiredText}"`);
      }
    }
  }

  if (issues.length !== expectedCount) {
    failures.push(`expected ${expectedCount} total issue(s), saw ${issues.length}`);
  }

  return failures;
}

export function checkLibraryIdentityFixtures(fixtureDir = libraryIdentityFixtureDir) {
  const failures = [];
  const sources = [];

  for (const fixture of libraryIdentityFixtureCases) {
    const root = path.join(fixtureDir, fixture.name);
    const issues = checkLibraryIdentityRoot(root);
    sources.push({ issues, label: `fixture:${fixture.name}`, root });

    const fixtureFailures = checkExpectedIssues(fixture.expectedIssues, issues);
    if (fixtureFailures.length > 0) {
      failures.push({
        errors: [...fixtureFailures, ...issues.map((issue) => `parser issue: ${issue}`)],
        label: `fixture:${fixture.name}`,
      });
    }
  }

  return { failures, sources };
}

export function checkLibraryIdentity(options = {}) {
  const fixtureResult = checkLibraryIdentityFixtures(options.fixtureDir ?? libraryIdentityFixtureDir);
  const realRoot = options.realRoot ?? realLibraryRoot;
  const realIssues = checkLibraryIdentityRoot(realRoot);
  const sources = [
    ...fixtureResult.sources,
    {
      issues: realIssues,
      label: rel(realRoot),
      root: realRoot,
    },
  ];
  const failures = [...fixtureResult.failures];

  if (realIssues.length > 0) {
    failures.push({
      errors: realIssues,
      label: rel(realRoot),
    });
  }

  return { failures, sources };
}

function main() {
  const { failures, sources } = checkLibraryIdentity();

  for (const failure of failures) {
    console.error(`FAIL ${failure.label}`);
    for (const error of failure.errors) {
      console.error(`     - ${error}`);
    }
  }

  if (failures.length > 0) {
    console.error(
      `\nLibrary identity check failed: ${failures.length} of ${sources.length} source(s) malformed.`,
    );
    process.exit(1);
  }

  console.log(
    `Library identity check passed: ${sources.length} source(s) exercise path-first catalog identity with the shipped parser.`,
  );
}

if (process.argv[1] != null && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main();
}
