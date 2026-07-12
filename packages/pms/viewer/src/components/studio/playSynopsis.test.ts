import { describe, expect, it } from "bun:test";
import { parseSynopsis } from "./playSynopsis";

const SAMPLE = `# Synopsis — Frame the Problem (next)

<!-- authored, director-facing. -->

## What it does

Recovers the real problem(s) underneath a conversation.

## Reach for it when

- someone pitched a **solution** and you want the problem behind it
- you're **workshopping a problem statement**

## The story

The team behind **Lantern** is in a meeting. Then Maya says **"Raven, frame that."**

## Trigger

**⚡ "Raven, frame that."** — That's the cue.
`;

describe("parseSynopsis", () => {
  it("lifts each H2 section as markdown", () => {
    const s = parseSynopsis(SAMPLE);
    expect(s.whatItDoes).toBe("Recovers the real problem(s) underneath a conversation.");
    expect(s.reachForItWhen).toContain("- someone pitched a **solution**");
    expect(s.reachForItWhen).toContain("**workshopping a problem statement**");
    expect(s.story).toContain('Maya says **"Raven, frame that."**');
    expect(s.trigger).toContain("That's the cue.");
  });

  it("accepts either 'The story' or 'Story' as the scene heading", () => {
    expect(parseSynopsis("## Story\nA scene.").story).toBe("A scene.");
    expect(parseSynopsis("## The story\nA scene.").story).toBe("A scene.");
  });

  it("returns nulls for missing or empty sections", () => {
    const s = parseSynopsis("# Title only\n\nno sections here");
    expect(s.whatItDoes).toBeNull();
    expect(s.reachForItWhen).toBeNull();
    expect(s.story).toBeNull();
    expect(s.trigger).toBeNull();
  });

  it("ignores an empty section body", () => {
    expect(parseSynopsis("## What it does\n\n## Trigger\nfires").whatItDoes).toBeNull();
  });
});
