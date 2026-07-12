/**
 * Parser for a play's authored `synopsis.md` — the director-facing framing the
 * Play-page explainer renders (What it does · Reach for it when · The story ·
 * Trigger). Unlike story.md (derived) and brief.md (engineering canon),
 * synopsis.md is a deliberate human/agent-written simplification that points
 * back at canon — see the file's own header. It is optional: a play without one
 * falls back to the registry description.
 *
 * Format is plain markdown sectioned by H2, so it stays readable and editable
 * (the same shape playNarrative.ts relies on for story.md). Section bodies are
 * returned as markdown; the explainer renders them with StudioMarkdown.
 *
 *   ## What it does
 *   <one paragraph>
 *   ## Reach for it when
 *   - …
 *   ## The story
 *   <a concrete, fictional scene>
 *   ## Trigger
 *   **"…"** — …
 *
 * Caveat: any `## ` line starts a new section, so a section body must not carry
 * its own H2 sub-headings (use H3+ within a section if one is ever needed).
 */

export interface PlaySynopsis {
  /** one-paragraph "what it does", markdown, or null */
  whatItDoes: string | null;
  /** the "reach for it when" list, markdown, or null */
  reachForItWhen: string | null;
  /** the fictional in-use scene, markdown, or null */
  story: string | null;
  /** the trigger callout, markdown, or null */
  trigger: string | null;
}

const H2 = /^##\s+(.+?)\s*$/;

/** Split a markdown doc into a map of lowercased H2 title → body markdown. */
function sectionsByHeading(text: string): Map<string, string> {
  const lines = text.split("\n");
  const sections = new Map<string, string>();
  let key: string | null = null;
  let buf: string[] = [];
  const flush = (): void => {
    if (key != null) {
      const body = buf.join("\n").trim();
      if (body.length > 0) {
        sections.set(key, body);
      }
    }
  };
  for (const raw of lines) {
    const head = H2.exec(raw ?? "");
    if (head != null) {
      flush();
      key = (head[1] ?? "").toLowerCase();
      buf = [];
      continue;
    }
    if (key != null) {
      buf.push(raw ?? "");
    }
  }
  flush();
  return sections;
}

export function parseSynopsis(text: string): PlaySynopsis {
  const s = sectionsByHeading(text);
  return {
    reachForItWhen: s.get("reach for it when") ?? null,
    story: s.get("the story") ?? s.get("story") ?? null,
    trigger: s.get("trigger") ?? null,
    whatItDoes: s.get("what it does") ?? null,
  };
}
