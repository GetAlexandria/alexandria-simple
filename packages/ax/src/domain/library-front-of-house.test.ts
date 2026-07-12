import { describe, expect, test } from "bun:test";
import { applyFrontOfHouseCardUpdateToContent } from "./library-front-of-house.js";

// Minimal product-card fixture carrying `horizon: future`. FoH's frontmatter
// reader/writer (parseFrontmatter/renderFrontmatter) is a generic key/value
// round-trip with no explicit field allowlist, so an unrecognized-by-FoH
// field like `horizon` (issue #633) should survive a patch untouched — this
// is the only assertion this file owns; broader FoH coverage is out of scope
// for the ax-domain half of #633.
const CARD_WITH_FUTURE_HORIZON = `---
type: Surface
prefLabel: "Roadmap Item"
plane: product
context: board
status: stub
confidence: medium
horizon: future
proposed_by: scanner
source_evidence:
  - fixture.md
---

## WHAT
What it does. A planned surface.

## HOW
- Not built yet.

## WHEN
Planned per the release tracker; not built yet.
`;

describe("Front-of-House frontmatter round-trip (issue #633)", () => {
  test("applyFrontOfHouseCardUpdateToContent preserves horizon: future through an unrelated field patch", () => {
    const result = applyFrontOfHouseCardUpdateToContent(CARD_WITH_FUTURE_HORIZON, {
      cardPath: "board/Surface - Roadmap Item.md",
      set: { status: "confirmed" },
    });

    expect(result).not.toBeInstanceOf(Error);
    const content = result as string;
    expect(content).toContain("horizon: future");
    expect(content).toContain("status: confirmed");
  });

  test("applyFrontOfHouseCardUpdateToContent with no updates round-trips horizon: future verbatim", () => {
    const result = applyFrontOfHouseCardUpdateToContent(CARD_WITH_FUTURE_HORIZON, {
      cardPath: "board/Surface - Roadmap Item.md",
    });

    expect(result).not.toBeInstanceOf(Error);
    const content = result as string;
    expect(content).toContain("horizon: future");
  });
});
