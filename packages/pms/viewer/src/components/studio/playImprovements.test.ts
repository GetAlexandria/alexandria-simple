import { describe, expect, it } from "bun:test";
import { parseImprovements } from "./playImprovements";

const SAMPLE = `# Improvement Plan — sample

<!-- header, ignored -->

## Backlog
- [decision] **Gate attributes** — test on the factory, then gate if safe.
- **Raise eval N** — add hard-case fixtures.
- a bare card with no bold and no dash

## In progress
- (none yet)

## Shipped
- **Sizing-lexicon scan** — closed a 100% failure. (2026-06-11)
`;

describe("parseImprovements", () => {
  const cols = parseImprovements(SAMPLE);

  it("makes one column per H2, in order", () => {
    expect(cols.map((c) => c.title)).toEqual(["Backlog", "In progress", "Shipped"]);
  });

  it("splits a card into tag, title (bold stripped), and detail", () => {
    expect(cols[0]?.items[0]).toEqual({
      detail: "test on the factory, then gate if safe.",
      tag: "decision",
      title: "Gate attributes",
    });
  });

  it("treats an untagged card as tag null", () => {
    expect(cols[0]?.items[1]).toMatchObject({
      tag: null,
      title: "Raise eval N",
    });
  });

  it("accepts a bare card with no bold and no dash", () => {
    expect(cols[0]?.items[2]).toEqual({
      detail: "",
      tag: null,
      title: "a bare card with no bold and no dash",
    });
  });

  it("drops a (none yet) placeholder, leaving the column empty", () => {
    const inProgress = cols.find((c) => c.title === "In progress");
    expect(inProgress?.items).toEqual([]);
  });

  it("keeps a trailing (date) inside the detail", () => {
    expect(cols[2]?.items[0]?.detail).toContain("(2026-06-11)");
  });

  it("returns [] when there are no columns", () => {
    expect(parseImprovements("# Title\n\njust prose")).toEqual([]);
  });
});
