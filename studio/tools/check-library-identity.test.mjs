import { describe, expect, it } from 'bun:test';
import path from 'node:path';

import {
  DUPLICATE_LIBRARY_CARD_STEM_ISSUE_PREFIX,
  PRODUCT_CARD_IDENTITY_MISMATCH_ISSUE_PREFIX,
  RESERVED_LIBRARY_CONTEXT_ISSUE_PREFIX,
} from '../../packages/ax/src/domain/library-catalog.ts';
import {
  checkLibraryIdentity,
  checkLibraryIdentityRoot,
  libraryIdentityFixtureDir,
} from './check-library-identity.mjs';

function fixtureRoot(name) {
  return path.join(libraryIdentityFixtureDir, name);
}

describe('check-library-identity guard fixtures', () => {
  it('flags reserved runtime context cards with the shipped parser message', () => {
    const issues = checkLibraryIdentityRoot(fixtureRoot('reserved'));

    expect(issues).toHaveLength(1);
    expect(issues[0]).toStartWith(RESERVED_LIBRARY_CONTEXT_ISSUE_PREFIX);
    expect(issues[0]).toContain('runtime/Entity/Entity - X.md');
  });

  it('flags duplicate path-derived stems on both cards', () => {
    const issues = checkLibraryIdentityRoot(fixtureRoot('duplicate'));

    expect(issues).toHaveLength(2);
    expect(issues.every((issue) => issue.startsWith(DUPLICATE_LIBRARY_CARD_STEM_ISSUE_PREFIX))).toBe(
      true,
    );
    expect(issues[0]).toContain('alpha/Entity/Entity - Same.md');
    expect(issues[0]).toContain('beta/Entity/Entity - Same.md');
    expect(issues[1]).toContain('alpha/Entity/Entity - Same.md');
    expect(issues[1]).toContain('beta/Entity/Entity - Same.md');
  });

  it('flags frontmatter identity mismatch', () => {
    const issues = checkLibraryIdentityRoot(fixtureRoot('mismatch'));

    expect(issues).toEqual([
      `${PRODUCT_CARD_IDENTITY_MISMATCH_ISSUE_PREFIX} in alpha/Entity/Entity - X.md: frontmatter type "Concept" vs path "Entity"`,
    ]);
  });

  it('keeps matching legacy identity frontmatter silent', () => {
    expect(checkLibraryIdentityRoot(fixtureRoot('matching'))).toEqual([]);
  });

  it('keeps v2 _index frontmatter without identity fields silent', () => {
    expect(checkLibraryIdentityRoot(fixtureRoot('v2-index'))).toEqual([]);
  });

  it('passes all fixtures and the real library regression', () => {
    const { failures, sources } = checkLibraryIdentity();

    expect(sources.length).toBeGreaterThanOrEqual(6);
    expect(failures).toEqual([]);
  });
});
