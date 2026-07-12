import { readdirSync, readFileSync } from "fs";
import { join, relative, sep } from "path";
import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import {
  buildLibraryCatalog,
  compareProductPlanes,
  DUPLICATE_LIBRARY_CARD_STEM_ISSUE_PREFIX,
  FUTURE_HORIZON_MISSING_CITATION_ISSUE_PREFIX,
  orderProductCardPlanes,
  parseLibraryCatalogExtras,
  parseLibraryCatalogWorkflows,
  parseLibraryFrontmatter,
  PRODUCT_CARD_IDENTITY_MISMATCH_ISSUE_PREFIX,
  PRODUCT_CARD_SCHEMA_VERSION,
  RESERVED_LIBRARY_CONTEXT_ISSUE_PREFIX,
  type LibraryCatalogThread,
} from "./library-catalog.js";
import {
  createCatalogCardResolver,
  extractCatalogMarkdownSections,
  extractCatalogWikilinks,
} from "./library-catalog-story.js";
import { NodeFileSystem } from "../effects/filesystem.js";
import { loadLibraryCatalogRoot } from "../effects/library-graph-loader.js";

interface ProductCardFixtureFields {
  altitude?: string | null;
  confidence?: string | null;
  body?: string;
  context?: string | null;
  extra?: string;
  horizon?: string | null;
  plane?: string | null;
  prefLabel?: string | null;
  proposed_by?: string | null;
  source_evidence?: string[] | null;
  status?: string | null;
  type?: string | null;
}

function productCardFixture(fields: ProductCardFixtureFields = {}): string {
  const values: Required<
    Omit<ProductCardFixtureFields, "extra" | "source_evidence" | "horizon">
  > & {
    body: string;
    extra: string;
    horizon?: string | null;
    source_evidence: string[] | null;
  } = {
    body:
      fields.body ??
      "## WHAT\nA fixture card.\n\n## WHY\nIt exists to keep the fixture grounded.\n\n## WHERE\nIt lives in the fixture shelf.\n\n## HOW\nIt is filled by test data.",
    altitude: null,
    confidence: "medium",
    context: "library",
    extra: fields.extra ?? "",
    plane: "Product",
    prefLabel: "Library",
    proposed_by: "scanner",
    source_evidence: ["docs/source.md"],
    status: "stub",
    type: "Surface",
    ...fields,
  };
  const lines = ["---"];
  for (const key of [
    "type",
    "prefLabel",
    "plane",
    "context",
    "status",
    "confidence",
    "altitude",
    "proposed_by",
  ] as const) {
    const value = values[key];
    if (value != null) {
      lines.push(`${key}: ${value}`);
    }
  }
  if (values.source_evidence != null) {
    lines.push("source_evidence:");
    for (const source of values.source_evidence) {
      lines.push(`  - ${source}`);
    }
  }
  if (values.horizon != null) {
    lines.push(`horizon: ${values.horizon}`);
  }
  if (values.extra.trim().length > 0) {
    lines.push(values.extra.trimEnd());
  }
  lines.push("---", "", values.body.trimEnd());
  return lines.join("\n");
}

function threadFixture(fields: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    concerns: [{ type: "card", cardId: "Value - Stage" }],
    confidence: "high",
    family: "hot_spot",
    id: "thread:fixture",
    kind: "polysemy",
    reason: "Fixture thread reason.",
    severity: "medium",
    ...fields,
  };
}

function isRecordValue(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function recordString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeThreadStatus(value: unknown): LibraryCatalogThread["status"] {
  return value === "answered" || value === "residual" ? value : "open";
}

function parseTestMissingSections(value: unknown): LibraryCatalogThread["missingSections"] {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const allowed = ["WHAT", "WHY", "WHERE", "HOW", "WHEN"] as const;
  const seen = new Set<(typeof allowed)[number]>();
  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }
    const normalized = item.trim().toUpperCase();
    if ((allowed as readonly string[]).includes(normalized)) {
      seen.add(normalized as (typeof allowed)[number]);
    }
  }
  return seen.size === 0 ? undefined : allowed.filter((section) => seen.has(section));
}

function parseTestStringArray(record: Record<string, unknown>, key: string): string[] | undefined {
  const value = record[key];
  return Array.isArray(value)
    ? value.flatMap((item) => (typeof item === "string" && item.trim() ? [item.trim()] : []))
    : undefined;
}

function parseTestThreadRecords(content: string): {
  metadataIssues: string[];
  threads: LibraryCatalogThread[];
} {
  const parsed = JSON.parse(content) as unknown;
  if (!isRecordValue(parsed) || parsed.schemaVersion !== "library-threads.v1") {
    return {
      metadataIssues: ["Invalid library thread events: unsupported fixture schema"],
      threads: [],
    };
  }
  if (parsed.threads !== undefined && !Array.isArray(parsed.threads)) {
    return {
      metadataIssues: ["Invalid library thread events: threads must be an array"],
      threads: [],
    };
  }

  const metadataIssues: string[] = [];
  const seen = new Set<string>();
  const threads: LibraryCatalogThread[] = [];
  for (const record of Array.isArray(parsed.threads) ? parsed.threads : []) {
    if (!isRecordValue(record)) {
      continue;
    }
    const id = recordString(record, "id");
    if (id == null) {
      continue;
    }
    if (seen.has(id)) {
      metadataIssues.push(`Invalid library thread events: duplicate thread id "${id}"`);
      continue;
    }
    seen.add(id);
    const missingSections = parseTestMissingSections(record.missingSections);
    const sourceEvidence = parseTestStringArray(record, "sourceEvidence");
    threads.push({
      confidence:
        recordString(record, "confidence") === "low"
          ? "low"
          : recordString(record, "confidence") === "medium"
            ? "medium"
            : "high",
      concerns: Array.isArray(record.concerns)
        ? record.concerns.filter(isRecordValue).map((concern) => ({
            ...(recordString(concern, "cardId") == null
              ? {}
              : { cardId: recordString(concern, "cardId")! }),
            ...(recordString(concern, "context") == null
              ? {}
              : { context: recordString(concern, "context")! }),
            ...(recordString(concern, "label") == null
              ? {}
              : { label: recordString(concern, "label")! }),
            ...(recordString(concern, "plane") == null
              ? {}
              : { plane: recordString(concern, "plane")! }),
            ...(recordString(concern, "sourceCardId") == null
              ? {}
              : { sourceCardId: recordString(concern, "sourceCardId")! }),
            type:
              recordString(concern, "type") === "context"
                ? "context"
                : recordString(concern, "type") === "noun"
                  ? "noun"
                  : "card",
          }))
        : [],
      family: recordString(record, "family") === "gap" ? "gap" : "hot_spot",
      id,
      kind: recordString(record, "kind")?.toLowerCase() ?? "polysemy",
      ...(missingSections == null ? {} : { missingSections }),
      ...(recordString(record, "question") == null
        ? {}
        : { question: recordString(record, "question")! }),
      reason: recordString(record, "reason") ?? "Fixture thread reason.",
      ...(recordString(record, "emittingMove") == null
        ? {}
        : { emittingMove: recordString(record, "emittingMove")! }),
      ...(recordString(record, "resolvingEventId") == null
        ? {}
        : { resolvingEventId: recordString(record, "resolvingEventId")! }),
      severity:
        recordString(record, "severity") === "low"
          ? "low"
          : recordString(record, "severity") === "high"
            ? "high"
            : "medium",
      ...(sourceEvidence == null ? {} : { sourceEvidence }),
      source: "authored",
      status: normalizeThreadStatus(record.status),
    });
  }

  return { metadataIssues, threads };
}

function collectMarkdownFiles(root: string): Array<{ content: string; path: string }> {
  const files: Array<{ content: string; path: string }> = [];
  for (const entry of readdirSync(root, { withFileTypes: true }).sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(path));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push({ content: readFileSync(path, "utf8"), path });
    }
  }
  return files;
}

function hasAnyLifecycleProvenanceKey(thread: LibraryCatalogThread): boolean {
  return (
    "question" in thread ||
    "emittingMove" in thread ||
    "sourceEvidence" in thread ||
    "resolvingEventId" in thread
  );
}

describe("library catalog", () => {
  test("parses Small-floor frontmatter with list provenance fields", () => {
    const fields = parseLibraryFrontmatter(`---
# scanner-authored fixture comment
type: Surface

prefLabel: "Library"
context: library
plane: Product
status: stub
confidence: 'high'
altLabels: ["Library", 'Catalog']
source_evidence:
  - docs/source-a.md
  - "docs/source-b.md"
---

Body`);

    expect(fields).toMatchObject({
      altLabels: ["Library", "Catalog"],
      confidence: "high",
      context: "library",
      plane: "Product",
      prefLabel: "Library",
      source_evidence: ["docs/source-a.md", "docs/source-b.md"],
      status: "stub",
      type: "Surface",
    });
  });

  test("a folded (`>-`) block scalar joins its lines with spaces, not the literal marker", () => {
    const fields = parseLibraryFrontmatter(`---
type: Experiment
expected: >-
  Most testers reach the task, but the probe is watching for where, not
  whether the friction shows up.
kind: probe
---

Body`);

    expect(fields.expected).toBe(
      "Most testers reach the task, but the probe is watching for where, not whether the friction shows up.",
    );
    expect(fields.kind).toBe("probe");
  });

  test("a literal (`|`) block scalar preserves line breaks", () => {
    const fields = parseLibraryFrontmatter(`---
type: Experiment
verdict: |
  Line one.
  Line two.
kind: probe
---

Body`);

    expect(fields.verdict).toBe("Line one.\nLine two.");
    expect(fields.kind).toBe("probe");
  });

  test("chomping indicators (`>`, `>-`, `>+`, `|-`) all parse as block scalars, not literal markers", () => {
    for (const indicator of [">", ">-", ">+", "|-", "|+"] as const) {
      const fields = parseLibraryFrontmatter(`---
type: Experiment
expected: ${indicator}
  Some content.
---

Body`);
      expect(fields.expected).toBe("Some content.");
    }
  });

  test("orders product card planes with canonical fallback and duplicate dedupe", () => {
    expect(["product", "zeta", "learning", "alpha", "strategy"].sort(compareProductPlanes)).toEqual(
      ["strategy", "product", "learning", "alpha", "zeta"],
    );
    expect(orderProductCardPlanes(["zeta", "product", "alpha", "strategy", "product"])).toEqual([
      "strategy",
      "product",
      "alpha",
      "zeta",
    ]);
    expect(compareProductPlanes("alpha", "zeta")).toBeLessThan(0);
    expect(compareProductPlanes("product", "alpha")).toBeLessThan(0);
  });

  test("builds cards, typed edges, areas, and first-class gaps", () => {
    const extras = parseLibraryCatalogExtras(
      JSON.stringify({
        areas: [
          {
            id: "area-learning-evidence",
            label: "Evidence",
            context: "evidence",
            plane: "Learning",
          },
        ],
        gaps: [
          {
            id: "gap-product-engine",
            label: "Engine View",
            context: "library",
            plane: "Product",
            reason: "No Product-plane engine view has been confirmed yet.",
            confidence: "medium",
            provenance: {
              label: "EL4 scan",
              sourceRefs: ["docs/source.md"],
            },
          },
        ],
      }),
    );

    const catalog = buildLibraryCatalog({
      explicitAreas: extras.areas,
      files: [
        {
          path: "/project/docs/alexandria/library/product/surfaces/Surface - Library.md",
          content: `---
type: Surface
prefLabel: Library
context: library
plane: Product
status: stub
confidence: high
proposed_by: scanner
source_evidence:
  - packages/viewer/src/components/library/LibraryBrowserApp.tsx
---

## WHERE
- Contains: [[Component - Card Drawer]]
`,
        },
      ],
      gaps: extras.gaps,
      libraryRoot: "/project/docs/alexandria/library",
      metadataIssues: extras.metadataIssues,
    });

    expect(catalog.cards).toHaveLength(1);
    expect(catalog.cards[0]).toMatchObject({
      confidence: "high",
      context: "library",
      id: "Surface - Library",
      plane: "Product",
      prefLabel: "Library",
      provenance: {
        label: "scanner",
        sourceRefs: ["packages/viewer/src/components/library/LibraryBrowserApp.tsx"],
      },
    });
    expect(catalog.edges).toEqual([
      {
        from: "Surface - Library",
        id: "edge:Surface - Library:contains:Component - Card Drawer",
        to: "Component - Card Drawer",
        type: "contains",
      },
    ]);
    expect(catalog.cards[0]?.edgeIds).toEqual([
      "edge:Surface - Library:contains:Component - Card Drawer",
    ]);
    expect(catalog.gaps).toHaveLength(1);
    expect(catalog.cards.some((card) => card.id === "gap-product-engine")).toBeFalse();
    expect(catalog.areas).toEqual([
      {
        cardIds: [],
        context: "evidence",
        gapIds: [],
        id: "area-learning-evidence",
        label: "Evidence",
        plane: "Learning",
        status: "empty",
      },
      {
        cardIds: ["Surface - Library"],
        context: "library",
        gapIds: ["gap-product-engine"],
        id: "area:Product:library",
        label: "Library",
        plane: "Product",
        status: "partial",
      },
    ]);
    expect(catalog.meta).toMatchObject({
      areaCount: 2,
      cardCount: 1,
      edgeCount: 1,
      gapCount: 1,
      metadataIssues: [],
      planes: ["Learning", "Product"],
    });
  });

  test("excludes cards missing confidence or provenance and rejects markdown gaps", () => {
    const catalog = buildLibraryCatalog({
      files: [
        {
          path: "/project/docs/alexandria/library/product/surfaces/Surface - Missing Confidence.md",
          content: `---
type: Surface
prefLabel: Missing Confidence
context: library
plane: Product
status: stub
proposed_by: scanner
source_evidence: docs/source.md
---`,
        },
        {
          path: "/project/docs/alexandria/library/product/surfaces/Surface - Missing Provenance.md",
          content: `---
type: Surface
prefLabel: Missing Provenance
context: library
plane: Product
status: stub
confidence: low
---`,
        },
        {
          path: "/project/docs/alexandria/library/product/surfaces/Surface - Fake Gap.md",
          content: `---
type: Surface
prefLabel: Fake Gap
context: library
plane: Product
status: gap
confidence: low
proposed_by: scanner
source_evidence: docs/source.md
---`,
        },
      ],
      libraryRoot: "/project/docs/alexandria/library",
    });

    expect(catalog.cards).toEqual([]);
    expect(catalog.gaps).toEqual([]);
    expect(catalog.meta.metadataIssues).toHaveLength(3);
    expect(catalog.meta.metadataIssues.join("\n")).toContain("missing confidence");
    expect(catalog.meta.metadataIssues.join("\n")).toContain("missing provenance");
    expect(catalog.meta.metadataIssues.join("\n")).toContain(
      "markdown status gap is not a catalog card",
    );
  });

  test("keeps otherwise valid cards missing context for Engine unfiled projection", () => {
    const catalog = buildLibraryCatalog({
      files: [
        {
          path: "/project/docs/alexandria/library/product/components/Component - Unfiled.md",
          content: `---
type: Component
prefLabel: Unfiled
plane: Product
status: stub
confidence: medium
proposed_by: scanner
source_evidence: docs/source.md
---`,
        },
      ],
      libraryRoot: "/project/docs/alexandria/library",
    });

    expect(catalog.cards).toHaveLength(1);
    expect(catalog.cards[0]).toMatchObject({
      confidence: "medium",
      context: "",
      id: "Component - Unfiled",
      plane: "Product",
      provenance: {
        label: "scanner",
        sourceRefs: ["docs/source.md"],
      },
    });
    expect(catalog.areas).toEqual([
      {
        cardIds: ["Component - Unfiled"],
        context: "",
        gapIds: [],
        id: "area:Product:",
        label: "",
        plane: "Product",
        status: "filled",
      },
    ]);
    expect(catalog.meta.metadataIssues).toEqual([
      "Invalid catalog card product/components/Component - Unfiled.md: missing context",
    ]);
  });

  test("edge type comes from a leading prefix, not a colon after a wikilink", () => {
    const catalog = buildLibraryCatalog({
      files: [
        {
          path: "/project/docs/alexandria/library/product/surfaces/Surface - Prose.md",
          content: `---
type: Surface
prefLabel: Prose
context: library
plane: Product
status: stub
confidence: high
proposed_by: scanner
source_evidence: docs/source.md
---

Relates to: [[Component - Typed]]
See [[Component - Prose]] for the rationale: details here.
`,
        },
      ],
      libraryRoot: "/project/docs/alexandria/library",
    });

    expect(catalog.edges).toEqual([
      {
        from: "Surface - Prose",
        id: "edge:Surface - Prose:related:Component - Prose",
        to: "Component - Prose",
        type: "related",
      },
      {
        from: "Surface - Prose",
        id: "edge:Surface - Prose:relates-to:Component - Typed",
        to: "Component - Typed",
        type: "relates-to",
      },
    ]);
  });

  test("validates product-card schema roots and normalizes closed enum fields", () => {
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: "/project/studio/library/product/Surface - Library.md",
          content: productCardFixture({
            confidence: "HIGH",
            plane: "Product",
            status: "Stub",
          }),
        },
        {
          path: "/project/studio/library/strategy/System - Direction.md",
          content: productCardFixture({
            context: "direction",
            plane: "strategy",
            prefLabel: "Direction",
            status: "confirmed",
            type: "System",
          }),
        },
        {
          path: "/project/studio/library/learning/experiments/Experiment - Pilot.md",
          content: productCardFixture({
            context: "experiments",
            plane: "Learning",
            prefLabel: "Pilot",
            type: "Experiment",
          }),
        },
        {
          path: "/project/studio/library/learning/measures/Measure - Golden Metric.md",
          content: productCardFixture({
            context: "measures",
            plane: "learning",
            prefLabel: "Golden Metric",
            type: "Measure",
          }),
        },
        {
          path: "/project/studio/library/learning/arcs/Arc - Launch.md",
          content: productCardFixture({
            context: "arcs",
            plane: "learning",
            prefLabel: "Launch",
            type: "Arc",
          }),
        },
        {
          path: "/project/studio/library/product/Value - Priority.md",
          content: productCardFixture({
            context: "board",
            prefLabel: "Priority",
            type: "Value",
          }),
        },
      ],
      libraryRoot: "/project/studio/library",
    });

    expect(catalog.meta.metadataIssues).toEqual([]);
    expect(catalog.cards).toHaveLength(6);
    expect(
      catalog.cards.map((card) => ({
        confidence: card.confidence,
        id: card.id,
        plane: card.plane,
        status: card.status,
        type: card.type,
      })),
    ).toEqual([
      {
        confidence: "medium",
        id: "Arc - Launch",
        plane: "learning",
        status: "stub",
        type: "Arc",
      },
      {
        confidence: "medium",
        id: "Experiment - Pilot",
        plane: "learning",
        status: "stub",
        type: "Experiment",
      },
      {
        confidence: "medium",
        id: "Measure - Golden Metric",
        plane: "learning",
        status: "stub",
        type: "Measure",
      },
      {
        confidence: "medium",
        id: "Value - Priority",
        plane: "product",
        status: "stub",
        type: "Value",
      },
      {
        confidence: "high",
        id: "Surface - Library",
        plane: "product",
        status: "stub",
        type: "Surface",
      },
      {
        confidence: "medium",
        id: "System - Direction",
        plane: "strategy",
        status: "confirmed",
        type: "System",
      },
    ]);
    expect(catalog.meta.planes).toEqual(["strategy", "product", "learning"]);
    expect(catalog.areas.map((area) => [area.id, area.plane, area.cardIds])).toEqual([
      ["area:learning:arcs", "learning", ["Arc - Launch"]],
      ["area:learning:experiments", "learning", ["Experiment - Pilot"]],
      ["area:learning:measures", "learning", ["Measure - Golden Metric"]],
      ["area:product:board", "product", ["Value - Priority"]],
      ["area:product:library", "product", ["Surface - Library"]],
      ["area:strategy:direction", "strategy", ["System - Direction"]],
    ]);
  });

  test("uses ruled path identity before mismatched legacy frontmatter", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/alpha/Entity/Entity - X.md`,
          content: productCardFixture({
            context: "alpha",
            prefLabel: "X",
            type: "Concept",
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.cards).toHaveLength(1);
    expect(catalog.cards[0]).toMatchObject({
      context: "alpha",
      id: "Entity - X",
      prefLabel: "X",
      type: "Entity",
    });
    expect(catalog.meta.metadataIssues).toEqual([
      `${PRODUCT_CARD_IDENTITY_MISMATCH_ISSUE_PREFIX} in alpha/Entity/Entity - X.md: frontmatter type "Concept" vs path "Entity"`,
    ]);
  });

  test("keeps matching legacy identity frontmatter silent on path-shaped cards", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/alpha/Entity/Entity - X.md`,
          content: productCardFixture({
            context: "alpha",
            prefLabel: "X",
            type: "Entity",
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.cards[0]).toMatchObject({
      context: "alpha",
      prefLabel: "X",
      type: "Entity",
    });
    expect(catalog.meta.metadataIssues).toEqual([]);
  });

  test("preserves frontmatter identity fallback for non-shaped filenames", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/legacy/Identity.md`,
          content: productCardFixture({
            context: "frontmatter-context",
            prefLabel: "Frontmatter Label",
            type: "Concept",
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.cards[0]).toMatchObject({
      context: "frontmatter-context",
      id: "Identity",
      prefLabel: "Frontmatter Label",
      type: "Concept",
    });
    expect(catalog.meta.metadataIssues).toEqual([]);
  });

  test("flags reserved card-bearing runtime contexts without dropping the card", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/runtime/Entity/Entity - X.md`,
          content: productCardFixture({
            context: "runtime",
            prefLabel: "X",
            type: "Entity",
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.cards.map((card) => card.id)).toEqual(["Entity - X"]);
    expect(catalog.meta.metadataIssues).toEqual([
      `${RESERVED_LIBRARY_CONTEXT_ISSUE_PREFIX} in runtime/Entity/Entity - X.md: context "runtime" is reserved for operational runtime state`,
    ]);
  });

  test("flags duplicate path-derived stems across contexts on both cards", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/alpha/Entity/Entity - Same.md`,
          content: productCardFixture({
            context: "alpha",
            prefLabel: "Same",
            type: "Entity",
          }),
        },
        {
          path: `${libraryRoot}/beta/Entity/Entity - Same.md`,
          content: productCardFixture({
            context: "beta",
            prefLabel: "Same",
            type: "Entity",
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.cards.map((card) => card.path)).toEqual([
      "alpha/Entity/Entity - Same.md",
      "beta/Entity/Entity - Same.md",
    ]);
    expect(catalog.meta.metadataIssues).toEqual([
      `${DUPLICATE_LIBRARY_CARD_STEM_ISSUE_PREFIX} "Entity - Same" in alpha/Entity/Entity - Same.md: stem is shared by alpha/Entity/Entity - Same.md, beta/Entity/Entity - Same.md`,
      `${DUPLICATE_LIBRARY_CARD_STEM_ISSUE_PREFIX} "Entity - Same" in beta/Entity/Entity - Same.md: stem is shared by alpha/Entity/Entity - Same.md, beta/Entity/Entity - Same.md`,
    ]);
  });

  test("loads _index path identity with v2 frontmatter and no identity fields silently", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/_index/Concept - Learning.md`,
          content: productCardFixture({
            context: null,
            plane: "learning",
            prefLabel: null,
            type: null,
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.cards).toHaveLength(1);
    expect(catalog.cards[0]).toMatchObject({
      context: "_index",
      id: "Concept - Learning",
      prefLabel: "Learning",
      type: "Concept",
    });
    expect(catalog.meta.metadataIssues).toEqual([]);
  });

  test("warns on unknown altitude words without rejecting product cards", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/board/Aggregate - Typo.md`,
          content: productCardFixture({
            extra: "altitude: pilar",
            prefLabel: "Typo",
            type: "Aggregate",
          }),
        },
        {
          path: `${libraryRoot}/board/Concept - Keystone.md`,
          content: productCardFixture({
            extra: "altitude: Keystone",
            prefLabel: "Keystone",
            type: "Concept",
          }),
        },
        {
          path: `${libraryRoot}/board/Value - No Altitude.md`,
          content: productCardFixture({
            prefLabel: "No Altitude",
            type: "Value",
          }),
        },
      ],
      libraryRoot,
    });

    const cardById = new Map(catalog.cards.map((card) => [card.id, card]));
    expect(cardById.get("Aggregate - Typo")?.altitude).toBe("pilar");
    expect(cardById.get("Concept - Keystone")?.altitude).toBe("Keystone");
    expect(cardById.get("Value - No Altitude")?.altitude).toBeUndefined();
    expect(catalog.meta.metadataIssues).toEqual([
      'Invalid card board/Aggregate - Typo.md: altitude "pilar" is not one of keystone, pillar, context, aggregate, component, value, capability',
    ]);
  });
  test("warns on unknown altitude words without rejecting legacy catalog cards", () => {
    const catalog = buildLibraryCatalog({
      files: [
        {
          path: "/project/docs/alexandria/library/product/components/Component - Typo.md",
          content: `---
type: Component
prefLabel: Typo
context: board
plane: Product
status: stub
confidence: medium
altitude: pilar
proposed_by: scanner
source_evidence: docs/source.md
---`,
        },
      ],
      libraryRoot: "/project/docs/alexandria/library",
    });

    expect(catalog.cards).toHaveLength(1);
    expect(catalog.cards[0]?.altitude).toBe("pilar");
    expect(catalog.meta.metadataIssues).toEqual([
      'Invalid card product/components/Component - Typo.md: altitude "pilar" is not one of keystone, pillar, context, aggregate, component, value, capability',
    ]);
  });

  test("parses deprecated product-card status", () => {
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: "/project/studio/library/product/Value - Legacy Status.md",
          content: productCardFixture({
            prefLabel: "Legacy Status",
            status: "Deprecated",
            type: "Value",
          }),
        },
      ],
      libraryRoot: "/project/studio/library",
    });

    expect(catalog.meta.metadataIssues).toEqual([]);
    expect(catalog.cards).toHaveLength(1);
    expect(catalog.cards[0]?.status).toBe("deprecated");
  });

  test("exposes strategy-plane Bet/Principle fields on the catalog card record when present (issue #628)", () => {
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: "/project/studio/library/strategy/Bet - Corporate Wager.md",
          content: productCardFixture({
            context: "strategy",
            plane: "strategy",
            prefLabel: "Corporate Wager",
            type: "Bet",
            extra: `cost: high
home: company-library
transfer: pending
risks:
  - tag: Value
    note: "Businesses may prefer AI kept hidden inside their tools."
  - tag: Reversibility
    note: "Hard to walk back — it is the company's core wager."`,
          }),
        },
        {
          path: "/project/studio/library/strategy/Principle - Never Violate.md",
          content: productCardFixture({
            context: "strategy",
            plane: "strategy",
            prefLabel: "Never Violate",
            type: "Principle",
            extra: `kind: standard
strength: hard`,
          }),
        },
      ],
      libraryRoot: "/project/studio/library",
    });

    expect(catalog.meta.metadataIssues).toEqual([]);
    const bet = catalog.cards.find((card) => card.id === "Bet - Corporate Wager");
    expect(bet?.cost).toBe("high");
    expect(bet?.home).toBe("company-library");
    expect(bet?.transfer).toBe("pending");
    expect(bet?.risks).toEqual([
      { note: "Businesses may prefer AI kept hidden inside their tools.", tag: "Value" },
      { note: "Hard to walk back — it is the company's core wager.", tag: "Reversibility" },
    ]);

    const principle = catalog.cards.find((card) => card.id === "Principle - Never Violate");
    expect(principle?.kind).toBe("standard");
    expect(principle?.strength).toBe("hard");
  });

  test("omits the six optional strategy fields without error when absent (issue #628)", () => {
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: "/project/studio/library/product/Concept - Plain.md",
          content: productCardFixture({
            context: "library",
            prefLabel: "Plain",
            type: "Concept",
          }),
        },
      ],
      libraryRoot: "/project/studio/library",
    });

    expect(catalog.meta.metadataIssues).toEqual([]);
    const card = catalog.cards[0];
    expect(card).toBeDefined();
    for (const key of ["cost", "risks", "home", "transfer", "kind", "strength"] as const) {
      expect(card).not.toHaveProperty(key);
    }
  });

  test("preserves a risk tag containing a dash and rejects an incomplete risk entry as a soft issue (issue #628)", () => {
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: "/project/studio/library/strategy/Bet - Mixed Risks.md",
          content: productCardFixture({
            context: "strategy",
            plane: "strategy",
            prefLabel: "Mixed Risks",
            type: "Bet",
            extra: `risks:
  - tag: Feasibility — retired
    note: "Already prototyped."
  - tag: Orphan Tag`,
          }),
        },
      ],
      libraryRoot: "/project/studio/library",
    });

    const card = catalog.cards.find((candidate) => candidate.id === "Bet - Mixed Risks");
    // The verbatim, dash-containing tag survives untouched (no special-casing).
    expect(card?.risks).toEqual([{ note: "Already prototyped.", tag: "Feasibility — retired" }]);
    // The incomplete second entry (no note) is dropped, but only as a soft
    // metadata issue — the card itself still loads.
    expect(catalog.meta.cardCount).toBe(1);
    expect(
      catalog.meta.metadataIssues.some((issue) => issue.includes("risks[1] missing note")),
    ).toBeTrue();
  });

  test("loads the real Strategy plane bundle with zero errors and exposes the acceptance-criteria fields (issue #628)", async () => {
    const repoRoot = join(import.meta.dir, "../../../..");
    const catalog = await Effect.runPromise(
      loadLibraryCatalogRoot(repoRoot, "docs/alexandria/library", {
        isProductLibraryRoot: true,
      }).pipe(Effect.provide(NodeFileSystem)),
    );

    expect(catalog.meta.metadataIssues).toEqual([]);
    // Merged census: main's 133 (127 product/strategy + L1's first learning
    // shelves) plus the branch's L2-L4 shelves, the arcs shelf (LP-W4b), and
    // the knowledge-organization plane/vocabulary cards (#730/#733).
    expect(catalog.meta.cardCount).toBe(171);

    const coin = catalog.cards.find((card) => card.id === "Bet - The Coin as Abstract Token");
    expect(coin?.confidence).toBe("low");
    expect(coin?.cost).toBe("low");
    expect(coin?.risks?.map((risk) => risk.tag)).toEqual(["Value", "Reversibility"]);
    expect(coin?.transfer).toBeUndefined();

    const corporateBet = catalog.cards.find(
      (card) => card.id === "Bet - Colleagues as the Interaction Layer",
    );
    expect(corporateBet?.transfer).toBe("pending");
    expect(corporateBet?.home).toBe("company-library");

    const principle = catalog.cards.find(
      (card) => card.id === "Principle - Never-Violate User Assumptions",
    );
    expect(principle?.kind).toBe("standard");
    expect(principle?.strength).toBe("hard");

    const aiColleague = catalog.cards.find((card) => card.id === "Entity - AI Colleague");
    expect(aiColleague?.plane).toBe("product");
    for (const key of ["cost", "risks", "home", "transfer", "kind", "strength"] as const) {
      expect(aiColleague).not.toHaveProperty(key);
    }

    // Learning-card vitals (issue #675), path-derived identity, and the
    // `evidence:` provenance rename all round-trip scan -> catalog.
    const pilot = catalog.cards.find(
      (card) => card.id === "Experiment - Ten-Director Library Pilot",
    );
    expect(pilot?.plane).toBe("learning");
    expect(pilot?.type).toBe("Experiment");
    expect(pilot?.prefLabel).toBe("Ten-Director Library Pilot");
    expect(pilot?.context).toBe("experiments");
    expect(pilot?.kind).toBe("experiment");
    expect(pilot?.grade).toBe("piloted");
    expect(pilot?.state).toBe("planned");
    expect(pilot?.horizon).toBe("future");
    expect(pilot?.arc).toBe("onboard-raven-get-good-work");
    expect(pilot?.role).toBe("headline");
    expect(pilot?.expected).toBeTruthy();
    expect(pilot?.stop?.map((entry) => entry.tag)).toEqual(["reps", "time"]);
    expect(pilot?.guardrails?.map((entry) => entry.tag)).toEqual(["focus", "reputation"]);
    expect(pilot?.provenance.sourceRefs.length).toBeGreaterThan(0);
    expect(pilot).not.toHaveProperty("verdict");

    const lesson = catalog.cards.find((card) => card.id === "Research - Build Beats Read");
    expect(lesson?.plane).toBe("learning");
    expect(lesson?.kind).toBe("founding-lesson");
    expect(lesson?.origin).toBe("desk-research");
    expect(lesson?.grade).toBe("reported");

    const measure = catalog.cards.find((card) => card.id === "Measure - Adoption and Substitution");
    expect(measure?.plane).toBe("learning");
    expect(measure?.target).toBeTruthy();
    expect(measure?.trend).toBeTruthy();
    expect(measure).not.toHaveProperty("grade");
    // Both authored as folded (`>-`) block scalars; a parser that only
    // handles inline scalars/lists would serve the literal marker string
    // instead of the joined prose (block-scalar regression, PR #712 follow-up).
    expect(measure?.target).not.toBe(">-");
    expect(measure?.trend).not.toBe(">-");

    const mapWalk = catalog.cards.find(
      (card) => card.id === "Experiment - Finding Your Way on the Map",
    );
    expect(mapWalk?.expected).toBeTruthy();
    expect(mapWalk?.expected).not.toBe(">-");
    expect(mapWalk?.expected).toContain("the map's own friction shows up");

    // No card in the real bundle should ever serve a vital equal to a bare
    // YAML block-scalar marker: that's the frontmatter parser leaking its own
    // syntax instead of the authored text.
    const freeStringVitals = [
      "expected",
      "verdict",
      "target",
      "trend",
      "arc",
      "role",
      "kind",
      "grade",
      "state",
      "origin",
    ] as const;
    for (const card of catalog.cards) {
      for (const vital of freeStringVitals) {
        const value = card[vital];
        if (value == null) {
          continue;
        }
        expect(value).not.toBe(">-");
        expect(value).not.toBe("|-");
        expect(value).not.toBe(">");
        expect(value).not.toBe("|");
      }
    }
  });

  // Regression for issue #633 plus the issue #673 live-bundle smoke, updated
  // for issue #675: the six `horizon: future` learning Experiments (planned,
  // not yet running) are the only cards in the bundle carrying `horizon` —
  // every product/strategy card is still horizon-absent. WHEN is filled on
  // every one of those six PLUS on every other learning-plane card (WHEN is
  // now unconditionally required for `plane: learning`, issue #675), so no
  // readiness row names WHEN; WHY gaps should surface only for non-exempt
  // cards.
  test("the real Strategy plane bundle has no WHEN gaps and no WHY gaps", async () => {
    const repoRoot = join(import.meta.dir, "../../../..");
    const catalog = await Effect.runPromise(
      loadLibraryCatalogRoot(repoRoot, "docs/alexandria/library", {
        isProductLibraryRoot: true,
      }).pipe(Effect.provide(NodeFileSystem)),
    );

    expect(catalog.meta.metadataIssues).toEqual([]);
    expect(
      catalog.meta.metadataIssues.some((issue) =>
        issue.includes(FUTURE_HORIZON_MISSING_CITATION_ISSUE_PREFIX),
      ),
    ).toBeFalse();
    const horizonCards = catalog.cards.filter((card) => card.horizon !== undefined);
    expect(
      horizonCards.every((card) => card.plane === "learning" && card.horizon === "future"),
    ).toBeTrue();
    expect(
      catalog.cards.every((card) => card.plane === "learning" || card.horizon === undefined),
    ).toBeTrue();
    expect(
      catalog.fillReadiness?.cards.every((card) => !card.missingSections.includes("WHEN")),
    ).toBeTrue();

    // The A3 WHY fill cleared the burndown the F1 gate opened (#701): every
    // non-exempt card carries a WHY, so the fill-readiness list derives none.
    const whyGapCards =
      catalog.fillReadiness?.cards.filter((card) => card.missingSections.includes("WHY")) ?? [];
    expect(whyGapCards.map((card) => card.cardId)).toEqual([]);
  });

  describe("learning-card vitals and WHEN (issue #675)", () => {
    const libraryRoot = "/project/studio/library";
    const withWhen =
      "## WHAT\nA fixture card.\n\n## WHY\nIt exists to keep the fixture grounded.\n\n## WHERE\nIt lives in the fixture shelf.\n\n## HOW\nIt is filled by test data.\n\n## WHEN\nN/A — no past yet. Planned now.";
    const withoutWhen =
      "## WHAT\nA fixture card.\n\n## WHY\nIt exists to keep the fixture grounded.\n\n## WHERE\nIt lives in the fixture shelf.\n\n## HOW\nIt is filled by test data.";

    test("parses Experiment vitals as tolerant free strings, and stop/guardrails as {tag, note} lists", () => {
      const catalog = buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/experiments/Experiment - Fixture Run.md`,
            content: productCardFixture({
              body: withWhen,
              context: "experiments",
              plane: "learning",
              prefLabel: "Fixture Run",
              type: "Experiment",
              extra: `kind: experiment
grade: demonstrated
state: called
expected: "A rise in usage."
arc: fixture-arc
role: headline
verdict: confirms
stop:
  - tag: time
    note: "Two weeks."
guardrails:
  - tag: focus
    note: "Do not slip the roadmap."`,
            }),
          },
        ],
        libraryRoot,
      });

      expect(catalog.meta.metadataIssues).toEqual([]);
      const card = catalog.cards.find((candidate) => candidate.id === "Experiment - Fixture Run");
      expect(card?.kind).toBe("experiment");
      expect(card?.grade).toBe("demonstrated");
      expect(card?.state).toBe("called");
      expect(card?.expected).toBe("A rise in usage.");
      expect(card?.arc).toBe("fixture-arc");
      expect(card?.role).toBe("headline");
      expect(card?.verdict).toBe("confirms");
      expect(card?.stop).toEqual([{ note: "Two weeks.", tag: "time" }]);
      expect(card?.guardrails).toEqual([{ note: "Do not slip the roadmap.", tag: "focus" }]);
    });

    test("a folded (`>-`) block-scalar `expected` round-trips as the joined text, not the literal `>-` marker", () => {
      const catalog = buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/experiments/Experiment - Folded Expected.md`,
            content: productCardFixture({
              body: withWhen,
              context: "experiments",
              plane: "learning",
              prefLabel: "Folded Expected",
              type: "Experiment",
              extra: `expected: >-
  Most testers reach the task, but the probe is watching for where, not
  whether the friction shows up.
kind: probe`,
            }),
          },
        ],
        libraryRoot,
      });

      expect(catalog.meta.metadataIssues).toEqual([]);
      const card = catalog.cards.find(
        (candidate) => candidate.id === "Experiment - Folded Expected",
      );
      expect(card?.expected).toBe(
        "Most testers reach the task, but the probe is watching for where, not whether the friction shows up.",
      );
      expect(card?.expected).not.toContain(">-");
      expect(card?.kind).toBe("probe");
    });

    test("a literal (`|`) block-scalar `verdict` preserves its line breaks", () => {
      const catalog = buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/experiments/Experiment - Literal Verdict.md`,
            content: productCardFixture({
              body: withWhen,
              context: "experiments",
              plane: "learning",
              prefLabel: "Literal Verdict",
              type: "Experiment",
              extra: `verdict: |-
  Confirmed on the first rep.
  Watching for a second before calling it durable.`,
            }),
          },
        ],
        libraryRoot,
      });

      expect(catalog.meta.metadataIssues).toEqual([]);
      const card = catalog.cards.find(
        (candidate) => candidate.id === "Experiment - Literal Verdict",
      );
      expect(card?.verdict).toBe(
        "Confirmed on the first rep.\nWatching for a second before calling it durable.",
      );
    });

    test("an unrecognized vital value is stored verbatim, never rejected as an invalid enum", () => {
      const catalog = buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/experiments/Experiment - Odd Vocabulary.md`,
            content: productCardFixture({
              body: withWhen,
              context: "experiments",
              plane: "learning",
              prefLabel: "Odd Vocabulary",
              type: "Experiment",
              extra: `kind: exploratory-spike
grade: somewhere-between-demo-and-pilot
state: paused
verdict: needs-a-rerun`,
            }),
          },
        ],
        libraryRoot,
      });

      expect(catalog.meta.metadataIssues).toEqual([]);
      const card = catalog.cards.find(
        (candidate) => candidate.id === "Experiment - Odd Vocabulary",
      );
      expect(card?.kind).toBe("exploratory-spike");
      expect(card?.grade).toBe("somewhere-between-demo-and-pilot");
      expect(card?.state).toBe("paused");
      expect(card?.verdict).toBe("needs-a-rerun");
    });

    test("a malformed stop entry is a soft metadataIssue; the Experiment card still loads", () => {
      const catalog = buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/experiments/Experiment - Mixed Stop.md`,
            content: productCardFixture({
              body: withWhen,
              context: "experiments",
              plane: "learning",
              prefLabel: "Mixed Stop",
              type: "Experiment",
              extra: `stop:
  - tag: time
    note: "Two weeks."
  - tag: reps`,
            }),
          },
        ],
        libraryRoot,
      });

      const card = catalog.cards.find((candidate) => candidate.id === "Experiment - Mixed Stop");
      expect(card).toBeDefined();
      expect(card?.stop).toEqual([{ note: "Two weeks.", tag: "time" }]);
      expect(catalog.meta.cardCount).toBe(1);
      expect(
        catalog.meta.metadataIssues.some((issue) => issue.includes("stop[1] missing note")),
      ).toBeTrue();
    });

    test("a malformed guardrails entry is a soft metadataIssue; the Experiment card still loads", () => {
      const catalog = buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/experiments/Experiment - Mixed Guardrails.md`,
            content: productCardFixture({
              body: withWhen,
              context: "experiments",
              plane: "learning",
              prefLabel: "Mixed Guardrails",
              type: "Experiment",
              extra: `guardrails:
  - tag: focus
    detail: "Wrong key name."`,
            }),
          },
        ],
        libraryRoot,
      });

      const card = catalog.cards.find(
        (candidate) => candidate.id === "Experiment - Mixed Guardrails",
      );
      expect(card).toBeDefined();
      expect(card).not.toHaveProperty("guardrails");
      expect(catalog.meta.cardCount).toBe(1);
      expect(
        catalog.meta.metadataIssues.some((issue) =>
          issue.includes('unknown guardrails key "detail" (expected note, tag)'),
        ),
      ).toBeTrue();
    });

    test("parses Research vitals: kind, origin, grade as tolerant free strings", () => {
      const catalog = buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/research/Research - Fixture Lesson.md`,
            content: productCardFixture({
              body: withWhen,
              context: "research",
              plane: "learning",
              prefLabel: "Fixture Lesson",
              type: "Research",
              extra: `kind: founding-lesson
origin: desk-research
grade: reported`,
            }),
          },
        ],
        libraryRoot,
      });

      expect(catalog.meta.metadataIssues).toEqual([]);
      const card = catalog.cards.find((candidate) => candidate.id === "Research - Fixture Lesson");
      expect(card?.kind).toBe("founding-lesson");
      expect(card?.origin).toBe("desk-research");
      expect(card?.grade).toBe("reported");
    });

    test("parses Measure vitals: target, trend as tolerant free strings", () => {
      const catalog = buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/measurement/Measure - Fixture Watch.md`,
            content: productCardFixture({
              body: withWhen,
              context: "measurement",
              plane: "learning",
              prefLabel: "Fixture Watch",
              type: "Measure",
              extra: `target: "Rising and holding."
trend: "Not yet reading."`,
            }),
          },
        ],
        libraryRoot,
      });

      expect(catalog.meta.metadataIssues).toEqual([]);
      const card = catalog.cards.find((candidate) => candidate.id === "Measure - Fixture Watch");
      expect(card?.target).toBe("Rising and holding.");
      expect(card?.trend).toBe("Not yet reading.");
      expect(card).not.toHaveProperty("grade");
    });

    test("a plane: learning card missing ## WHEN is flagged even with horizon absent", () => {
      const catalog = buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/research/Research - No When.md`,
            content: productCardFixture({
              body: withoutWhen,
              context: "research",
              plane: "learning",
              prefLabel: "No When",
              type: "Research",
            }),
          },
        ],
        libraryRoot,
      });

      const card = catalog.cards.find((candidate) => candidate.id === "Research - No When");
      expect(card).not.toHaveProperty("horizon");
      const readiness = catalog.fillReadiness?.cards.find(
        (candidate) => candidate.cardId === "Research - No When",
      );
      expect(readiness).toMatchObject({ fillable: false, missingSections: ["WHEN"] });
    });

    test("a plane: learning card WITH ## WHEN and horizon absent is not flagged", () => {
      const catalog = buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/research/Research - Has When.md`,
            content: productCardFixture({
              body: withWhen,
              context: "research",
              plane: "learning",
              prefLabel: "Has When",
              type: "Research",
            }),
          },
        ],
        libraryRoot,
      });

      const readiness = catalog.fillReadiness?.cards.find(
        (candidate) => candidate.cardId === "Research - Has When",
      );
      expect(readiness).toMatchObject({ fillable: true, missingSections: [] });
    });

    // Unchanged product-plane behavior (issue #633): a product card with no
    // `horizon: future` and no `## WHEN` is still NOT flagged — only
    // `plane: learning` cards get the unconditional requirement.
    test("a product-plane card without horizon: future and no ## WHEN is NOT flagged", () => {
      const catalog = buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/library/Surface - No Horizon No When.md`,
            content: productCardFixture({
              body: withoutWhen,
              context: "library",
              plane: "product",
              prefLabel: "No Horizon No When",
              type: "Surface",
            }),
          },
        ],
        libraryRoot,
      });

      const card = catalog.cards.find(
        (candidate) => candidate.id === "Surface - No Horizon No When",
      );
      expect(card).not.toHaveProperty("horizon");
      const readiness = catalog.fillReadiness?.cards.find(
        (candidate) => candidate.cardId === "Surface - No Horizon No When",
      );
      expect(readiness).toMatchObject({ fillable: true, missingSections: [] });
    });

    test("path-derived identity: a card omitting type/prefLabel/context/proposed_by resolves them from its path and defaults confidence", () => {
      const catalog = buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/experiments/Experiment/Experiment - Path Identity.md`,
            content: [
              "---",
              "plane: learning",
              "status: stub",
              "evidence:",
              "  - docs/fixture.md",
              "---",
              "",
              withWhen,
            ].join("\n"),
          },
        ],
        libraryRoot,
      });

      expect(catalog.meta.metadataIssues).toEqual([]);
      const card = catalog.cards.find((candidate) => candidate.id === "Experiment - Path Identity");
      expect(card?.type).toBe("Experiment");
      expect(card?.prefLabel).toBe("Path Identity");
      expect(card?.context).toBe("experiments");
      // Unstated confidence projects conservatively as "low" (main's v2
      // doctrine, #735 - supersedes the branch's earlier "medium" default).
      expect(card?.confidence).toBe("low");
      expect(card?.provenance.sourceRefs).toEqual(["docs/fixture.md"]);
    });
  });

  // The {horizon} x {## WHEN} x {source_evidence} matrix from the #633 plan.
  // horizon absent/"now" behave identically; only horizon "future" ever
  // requires WHEN or triggers the citation metadataIssue.
  describe("horizon (issue #633)", () => {
    const libraryRoot = "/project/studio/library";
    const withWhen =
      "## WHAT\nA fixture card.\n\n## WHY\nIt exists to keep the fixture grounded.\n\n## WHERE\nIt lives in the fixture shelf.\n\n## HOW\nIt is filled by test data.\n\n## WHEN\nPlanned per the release tracker; not built yet.";
    const withoutWhen =
      "## WHAT\nA fixture card.\n\n## WHY\nIt exists to keep the fixture grounded.\n\n## WHERE\nIt lives in the fixture shelf.\n\n## HOW\nIt is filled by test data.";

    function fixtureCatalog(fields: ProductCardFixtureFields) {
      return buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/horizon/Surface - Horizon Fixture.md`,
            content: productCardFixture({
              context: "horizon",
              prefLabel: "Horizon Fixture",
              type: "Surface",
              ...fields,
            }),
          },
        ],
        libraryRoot,
      });
    }

    test("horizon absent: no field on the card, WHEN never required", () => {
      const catalog = fixtureCatalog({ body: withoutWhen });
      const card = catalog.cards.find((candidate) => candidate.id === "Surface - Horizon Fixture");
      expect(card).not.toHaveProperty("horizon");
      expect(catalog.meta.metadataIssues).toEqual([]);
      expect(
        catalog.fillReadiness?.cards.find(
          (candidate) => candidate.cardId === "Surface - Horizon Fixture",
        ),
      ).toMatchObject({ fillable: true, missingSections: [] });
    });

    test('horizon "now" is stored (round-trip fidelity) but behaves identically to absent', () => {
      const withNow = fixtureCatalog({ body: withoutWhen, horizon: "now" });
      const withoutHorizon = fixtureCatalog({ body: withoutWhen });

      const nowCard = withNow.cards.find(
        (candidate) => candidate.id === "Surface - Horizon Fixture",
      );
      expect(nowCard?.horizon).toBe("now");
      expect(withNow.meta.metadataIssues).toEqual([]);

      // Identical catalog output modulo the stored `horizon` field.
      const nowRest: Record<string, unknown> = { ...nowCard };
      delete nowRest.horizon;
      const absentCard = withoutHorizon.cards.find(
        (candidate) => candidate.id === "Surface - Horizon Fixture",
      );
      expect(absentCard).toBeDefined();
      expect(nowRest).toEqual({ ...absentCard });
      expect(withNow.fillReadiness?.cards).toEqual(withoutHorizon.fillReadiness?.cards);
    });

    test('horizon "future" with ## WHEN and source_evidence loads clean', () => {
      const catalog = fixtureCatalog({ body: withWhen, horizon: "future" });
      const card = catalog.cards.find((candidate) => candidate.id === "Surface - Horizon Fixture");
      expect(card?.horizon).toBe("future");
      expect(catalog.meta.metadataIssues).toEqual([]);
      expect(
        catalog.fillReadiness?.cards.find(
          (candidate) => candidate.cardId === "Surface - Horizon Fixture",
        ),
      ).toMatchObject({ fillable: true, missingSections: [] });
    });

    test('horizon "future" without ## WHEN: missingSections includes "WHEN" (ordered after HOW) and the derived thread names it', () => {
      const catalog = fixtureCatalog({ body: withoutWhen, horizon: "future" });
      const readiness = catalog.fillReadiness?.cards.find(
        (candidate) => candidate.cardId === "Surface - Horizon Fixture",
      );
      expect(readiness).toMatchObject({ fillable: false, missingSections: ["WHEN"] });

      const thread = catalog.threads?.find(
        (candidate) => candidate.id === "thread:derived:missing-material:Surface - Horizon Fixture",
      );
      expect(thread).toMatchObject({
        missingSections: ["WHEN"],
        reason: "Missing WHEN for Horizon Fixture.",
      });
    });

    test('horizon "future" with ## WHEN but no source_evidence flags the citation metadataIssue', () => {
      // Under the v1 contract `source_evidence` was hard-required, so this
      // citation issue was dead code (the parse-issue channel fired first).
      // The v2 read tolerance (evidence optional, 2026-07-08) made the #633
      // acceptance criterion reachable end-to-end: the card builds, and the
      // citation gate flags the uncited future-horizon claim.
      const catalog = buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/horizon/Surface - No Evidence.md`,
            content: productCardFixture({
              body: withWhen,
              context: "horizon",
              horizon: "future",
              prefLabel: "No Evidence",
              source_evidence: [],
              type: "Surface",
            }),
          },
        ],
        libraryRoot,
      });

      expect(catalog.cards).toHaveLength(1);
      expect(catalog.meta.metadataIssues).toEqual([
        `${FUTURE_HORIZON_MISSING_CITATION_ISSUE_PREFIX} in horizon/Surface - No Evidence.md.`,
      ]);
    });

    test("invalid horizon value is a hard parse issue naming the allowed values", () => {
      const catalog = fixtureCatalog({ body: withoutWhen, horizon: "scheduled" });
      expect(catalog.cards).toEqual([]);
      expect(catalog.meta.metadataIssues).toEqual([
        'Invalid card horizon/Surface - Horizon Fixture.md: horizon "scheduled" is not one of now, future',
      ]);
    });

    test("a WHEN-section wikilink feeds missing-card detection like WHAT/WHERE/HOW ones", () => {
      // WHEN folds into the rendered story, so its nouns are scanned exactly
      // like the other sections' — this is why the template's W2 rule tells
      // authors to cite plan origins as plain text, not wikilinks.
      const catalog = fixtureCatalog({
        body: `${withoutWhen}\n\n## WHEN\nPlanned per [[Ghost Release Plan]]; not built yet.`,
        horizon: "future",
      });
      expect(
        catalog.threads?.find(
          (candidate) =>
            candidate.id ===
            "thread:derived:missing-card:Surface - Horizon Fixture:Ghost Release Plan",
        ),
      ).toMatchObject({ family: "gap", kind: "missing_card" });
    });

    test("re-parsing a card flipped future→now drops the WHEN requirement", () => {
      const future = fixtureCatalog({ body: withoutWhen, horizon: "future" });
      expect(
        future.fillReadiness?.cards.find(
          (candidate) => candidate.cardId === "Surface - Horizon Fixture",
        ),
      ).toMatchObject({ fillable: false, missingSections: ["WHEN"] });

      const flippedToNow = fixtureCatalog({ body: withoutWhen, horizon: "now" });
      expect(
        flippedToNow.fillReadiness?.cards.find(
          (candidate) => candidate.cardId === "Surface - Horizon Fixture",
        ),
      ).toMatchObject({ fillable: true, missingSections: [] });
    });
  });

  describe("required WHY fill section (issue #673)", () => {
    const libraryRoot = "/project/studio/library";
    const withoutWhy =
      "## WHAT\nA fixture card.\n\n## WHERE\nIt lives in the fixture shelf.\n\n## HOW\nIt is filled by test data.";
    const withoutWhyOrHow =
      "## WHAT\nA fixture card.\n\n## WHERE\nIt lives in the fixture shelf.\n\n## HOW\n";

    function fixtureCatalog(fields: ProductCardFixtureFields = {}) {
      return buildLibraryCatalog({
        catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
        files: [
          {
            path: `${libraryRoot}/${fields.context ?? "why"}/Surface - Why Fixture.md`,
            content: productCardFixture({
              body: withoutWhy,
              context: "why",
              prefLabel: "Why Fixture",
              type: "Surface",
              ...fields,
            }),
          },
        ],
        libraryRoot,
      });
    }

    test("a non-exempt product card without WHY is non-fillable and gets a derived thread", () => {
      const catalog = fixtureCatalog();
      expect(
        catalog.fillReadiness?.cards.find((card) => card.cardId === "Surface - Why Fixture"),
      ).toMatchObject({ fillable: false, missingSections: ["WHY"] });

      expect(
        catalog.threads?.find(
          (thread) => thread.id === "thread:derived:missing-material:Surface - Why Fixture",
        ),
      ).toMatchObject({
        missingSections: ["WHY"],
        reason: "Missing WHY for Why Fixture.",
      });
    });

    test("deprecated cards are exempt from WHY only", () => {
      const noWhy = fixtureCatalog({ status: "deprecated" });
      expect(
        noWhy.fillReadiness?.cards.find((card) => card.cardId === "Surface - Why Fixture"),
      ).toMatchObject({ fillable: true, missingSections: [] });

      const missingHow = fixtureCatalog({ body: withoutWhyOrHow, status: "deprecated" });
      expect(
        missingHow.fillReadiness?.cards.find((card) => card.cardId === "Surface - Why Fixture"),
      ).toMatchObject({ fillable: false, missingSections: ["HOW"] });
    });

    test("_index cards stay out of readiness and derived threads even without WHY", () => {
      const catalog = fixtureCatalog({ context: "_index" });
      expect(catalog.fillReadiness?.cards).toEqual([]);
      expect(catalog.threads).toEqual([]);
    });

    test("keystone cards are exempt from WHY only", () => {
      const noWhy = fixtureCatalog({ altitude: "keystone" });
      expect(
        noWhy.fillReadiness?.cards.find((card) => card.cardId === "Surface - Why Fixture"),
      ).toMatchObject({ fillable: true, missingSections: [] });

      const missingHow = fixtureCatalog({ altitude: "KEYSTONE", body: withoutWhyOrHow });
      expect(
        missingHow.fillReadiness?.cards.find((card) => card.cardId === "Surface - Why Fixture"),
      ).toMatchObject({ fillable: false, missingSections: ["HOW"] });
    });

    test("future cards missing WHY and WHEN report them in canonical order", () => {
      const catalog = fixtureCatalog({ horizon: "future" });
      expect(
        catalog.fillReadiness?.cards.find((card) => card.cardId === "Surface - Why Fixture"),
      ).toMatchObject({ fillable: false, missingSections: ["WHY", "WHEN"] });
      expect(
        catalog.threads?.find(
          (thread) => thread.id === "thread:derived:missing-material:Surface - Why Fixture",
        ),
      ).toMatchObject({
        missingSections: ["WHY", "WHEN"],
        reason: "Missing WHY and WHEN for Why Fixture.",
      });
    });

    test("a non-empty WHY in the wrong position satisfies the fill gate", () => {
      const catalog = fixtureCatalog({
        body: "## WHAT\nA fixture card.\n\n## WHERE\nIt lives in the fixture shelf.\n\n## HOW\nIt is filled by test data.\n\n## WHY\nIt exists to prove position is convention.",
      });
      expect(
        catalog.fillReadiness?.cards.find((card) => card.cardId === "Surface - Why Fixture"),
      ).toMatchObject({ fillable: true, missingSections: [] });
    });
  });

  test("parses Product-card links and derives diagrams in canonical key order", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/library/Surface - Library.md`,
          content: productCardFixture({
            extra: `links:
  contains: ["[[Component - Card Drawer]]", "[[Component - Card Drawer]]", ""]
  operates_on:
    - "[[Value - Stage|Stage]]"
  unknown_key:
    - "[[Value - Ghost]]"
  produces: "Scalar"`,
          }),
        },
        {
          path: `${libraryRoot}/library/Component - Card Drawer.md`,
          content: productCardFixture({
            prefLabel: "Card Drawer",
            type: "Component",
          }),
        },
        {
          path: `${libraryRoot}/library/Value - Stage.md`,
          content: productCardFixture({
            prefLabel: "Stage",
            type: "Value",
          }),
        },
      ],
      libraryRoot,
    });

    const library = catalog.cards.find((card) => card.id === "Surface - Library");
    expect(library?.links).toEqual({
      contains: ["[[Component - Card Drawer]]"],
      operates_on: ["[[Value - Stage|Stage]]"],
    });
    expect(library?.diagram).toEqual({
      connectors: [
        {
          label: "contains",
          targetCardId: "Component - Card Drawer",
          targetLabel: "Card Drawer",
        },
        {
          label: "operates on",
          targetCardId: "Value - Stage",
          targetLabel: "Stage",
        },
      ],
      kind: "hub",
    });
    expect(catalog.meta.metadataIssues).toEqual([
      'Invalid card library/Surface - Library.md: unknown links key "unknown_key" (expected contains, conforms_to, operates_on, produces, related_to, derived_from, relegates)',
      "Invalid card library/Surface - Library.md: links.produces must be a list of strings",
    ]);
  });

  // Pins the deliberate indentation contract: list items must be four spaces
  // under their relationship key. A two-space item is off-contract and is
  // surfaced as a "malformed links entry" issue (and dropped) rather than
  // silently absorbed — so drift from the canonical writer stays loud.
  test("rejects off-contract two-space links list items as malformed", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/library/Surface - Library.md`,
          content: productCardFixture({
            extra: `links:
  contains:
  - "[[Component - Card Drawer]]"`,
          }),
        },
        {
          path: `${libraryRoot}/library/Component - Card Drawer.md`,
          content: productCardFixture({
            prefLabel: "Card Drawer",
            type: "Component",
          }),
        },
      ],
      libraryRoot,
    });

    const library = catalog.cards.find((card) => card.id === "Surface - Library");
    expect(library?.links).toBeUndefined();
    expect(library?.diagram).toBeUndefined();
    expect(
      catalog.meta.metadataIssues.some((issue) =>
        issue.startsWith("Invalid card library/Surface - Library.md: malformed links entry"),
      ),
    ).toBe(true);
  });

  test("reports exact product-card validation issues and excludes invalid cards", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/invalid/Missing Type.md`,
          content: productCardFixture({ type: null }),
        },
        {
          path: `${libraryRoot}/invalid/Missing Label.md`,
          content: productCardFixture({ prefLabel: null }),
        },
        {
          path: `${libraryRoot}/invalid/Missing Plane.md`,
          content: productCardFixture({ plane: null }),
        },
        {
          path: `${libraryRoot}/invalid/Missing Context.md`,
          content: productCardFixture({ context: null }),
        },
        {
          path: `${libraryRoot}/invalid/Missing Status.md`,
          content: productCardFixture({ status: null }),
        },
        {
          path: `${libraryRoot}/invalid/Missing Confidence.md`,
          content: productCardFixture({ confidence: null }),
        },
        {
          path: `${libraryRoot}/invalid/Missing Proposed By.md`,
          content: productCardFixture({ proposed_by: null }),
        },
        {
          path: `${libraryRoot}/invalid/Missing Source Evidence.md`,
          content: productCardFixture({ source_evidence: null }),
        },
        {
          path: `${libraryRoot}/invalid/Marketing Plane.md`,
          content: productCardFixture({ plane: "marketing" }),
        },
        {
          path: `${libraryRoot}/invalid/Ready Status.md`,
          content: productCardFixture({ status: "ready" }),
        },
        {
          path: `${libraryRoot}/invalid/Sure Confidence.md`,
          content: productCardFixture({ confidence: "sure" }),
        },
        {
          path: `${libraryRoot}/invalid/Legacy Shape.md`,
          content: productCardFixture({
            extra: "category: product\nsubcategory: surfaces\nuser_visible: true",
            plane: null,
          }),
        },
      ],
      libraryRoot,
    });

    // v2 read tolerance (2026-07-08): context falls back to the path segment,
    // confidence defaults to "low", proposed_by/source_evidence are optional —
    // so four of the fixtures now BUILD instead of failing. Identity fields
    // with no path fallback (these filenames are not `Type - Name` shaped),
    // plane, status, and bad enum values still hard-fail.
    expect(catalog.cards.map((card) => [card.id, card.context, card.confidence])).toEqual([
      ["Missing Context", "invalid", "medium"],
      ["Missing Confidence", "library", "low"],
      ["Missing Proposed By", "library", "medium"],
      ["Missing Source Evidence", "library", "medium"],
    ]);
    expect(catalog.meta.metadataIssues).toEqual([
      "Invalid card invalid/Missing Type.md: missing type",
      "Invalid card invalid/Missing Label.md: missing prefLabel",
      "Invalid card invalid/Missing Plane.md: missing plane",
      "Invalid card invalid/Missing Status.md: missing status",
      'Invalid card invalid/Marketing Plane.md: plane "marketing" is not one of strategy, product, learning',
      'Invalid card invalid/Ready Status.md: status "ready" is not one of stub, confirmed, deprecated',
      'Invalid card invalid/Sure Confidence.md: confidence "sure" is not one of high, medium, low',
      "Invalid card invalid/Legacy Shape.md: missing plane",
    ]);
  });

  test("emits one issue per failing field, in field order, for a single card", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/invalid/Multi.md`,
          content: productCardFixture({
            plane: null,
            source_evidence: null,
            status: "ready",
            type: null,
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.cards).toEqual([]);
    // source_evidence absence is tolerated under v2; type has no path
    // fallback here (the filename is not `Type - Name` shaped).
    expect(catalog.meta.metadataIssues).toEqual([
      "Invalid card invalid/Multi.md: missing type",
      "Invalid card invalid/Multi.md: missing plane",
      'Invalid card invalid/Multi.md: status "ready" is not one of stub, confirmed, deprecated',
    ]);
  });

  test("projects derived Threads, authored hot spots, and body-only fill-readiness counts", () => {
    const libraryRoot = "/project/studio/library";
    const authored = parseTestThreadRecords(
      JSON.stringify({
        schemaVersion: "library-threads.v1",
        threads: [
          {
            id: "thread:stage-registry-polysemy",
            family: "hot_spot",
            kind: "polysemy",
            concerns: [
              { type: "card", cardId: "Value - Stage" },
              { type: "card", cardId: "Read-Model - Play Registry" },
            ],
            confidence: "high",
            severity: "medium",
            reason: "Stage and status vocabulary need one settled explanation.",
          },
        ],
      }),
    );

    expect(authored.metadataIssues).toEqual([]);
    const catalog = buildLibraryCatalog({
      authoredThreads: authored.threads,
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/board/Aggregate - Board.md`,
          content: productCardFixture({
            body: "## WHAT\nWork Board exists.\n\n## WHY\nIt keeps board decisions grounded in director-visible state.\n\n## WHERE\nIdentity comes from [[Component - Play Registry]] and the [[Director]] reads it.\n\n## HOW\nIt moves work through [[Stage]].",
            context: "board",
            prefLabel: "Work Board",
            type: "Aggregate",
          }),
        },
        {
          path: `${libraryRoot}/board/Read-Model - Play Registry.md`,
          content: productCardFixture({
            context: "board",
            prefLabel: "Play Registry",
            type: "Read-Model",
          }),
        },
        {
          path: `${libraryRoot}/board/Value - Stage.md`,
          content: productCardFixture({
            context: "board",
            prefLabel: "Stage",
            type: "Value",
          }),
        },
        {
          path: `${libraryRoot}/fixtures/Value - Empty HOW Fixture.md`,
          content: productCardFixture({
            body: "## WHAT\nThe fixture has a WHAT section.\n\n## WHERE\nThe fixture has a WHERE section.\n\n## WHY\nExists because of [[Ghost Rationale]].\n\n## HOW\n",
            context: "readiness-fixture",
            prefLabel: "Empty HOW Fixture",
            type: "Value",
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.threads?.map((thread) => [thread.id, thread.family, thread.kind])).toEqual([
      ["thread:derived:missing-card:Aggregate - Board:Director", "gap", "missing_card"],
      // A WHY-section wikilink counts: WHY folds into the rendered story, so
      // its nouns must feed missing-card detection like WHAT/WHERE/HOW ones.
      [
        "thread:derived:missing-card:Value - Empty HOW Fixture:Ghost Rationale",
        "gap",
        "missing_card",
      ],
      ["thread:derived:missing-material:Value - Empty HOW Fixture", "gap", "missing_material"],
      ["thread:stage-registry-polysemy", "hot_spot", "polysemy"],
    ]);
    expect(
      catalog.threads?.find(
        (thread) => thread.id === "thread:derived:missing-material:Value - Empty HOW Fixture",
      ),
    ).toMatchObject({
      concerns: [expect.objectContaining({ cardId: "Value - Empty HOW Fixture" })],
      missingSections: ["HOW"],
      reason: "Missing HOW for Empty HOW Fixture.",
    });
    expect(
      catalog.threads?.find(
        (thread) => thread.id === "thread:derived:missing-card:Aggregate - Board:Director",
      ),
    ).toMatchObject({
      concerns: [
        expect.objectContaining({ cardId: "Aggregate - Board", type: "card" }),
        expect.objectContaining({
          label: "Director",
          sourceCardId: "Aggregate - Board",
          type: "noun",
        }),
      ],
    });
    expect(
      catalog.threads?.some((thread) => thread.id.includes("Component - Play Registry")),
    ).toBeFalse();
    expect(catalog.fillReadiness).toMatchObject({
      fillableCardCount: 3,
      gapCount: 3,
      hotSpotCount: 1,
      ready: false,
      threadCount: 4,
      totalCardCount: 4,
    });
    expect(
      catalog.fillReadiness?.cards.find((card) => card.cardId === "Aggregate - Board"),
    ).toMatchObject({
      blockingThreadIds: [],
      fillable: true,
      gapThreadIds: ["thread:derived:missing-card:Aggregate - Board:Director"],
      missingSections: [],
    });
    expect(
      catalog.fillReadiness?.cards.find((card) => card.cardId === "Value - Stage"),
    ).toMatchObject({
      blockingThreadIds: [],
      fillable: true,
      gapThreadIds: [],
    });
    expect(
      catalog.fillReadiness?.areas.find((area) => area.areaId === "area:product:board"),
    ).toMatchObject({
      cardCount: 3,
      fillableCount: 3,
      gapCount: 1,
      hotSpotCount: 1,
    });
    expect(
      catalog.fillReadiness?.areas.find((area) => area.areaId === "area:product:readiness-fixture"),
    ).toMatchObject({
      cardCount: 1,
      context: "readiness-fixture",
      fillableCount: 0,
      plane: "product",
    });
  });

  test("treats the _index keystone as reserved: kept in cards, out of areas/readiness/threads", () => {
    const libraryRoot = "/project/studio/sweeps/example";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/_index/Concept - Playmaker's Studio.md`,
          content: productCardFixture({
            // The thesis names *containers* (`[[operations]]`, `[[proving]]`),
            // not cards — so these wikilinks must not raise missing_card gaps.
            body: "## WHAT\nWhat it does. The product ships plays.\n\nHow it does it. It runs them through [[operations]] and [[proving]].",
            context: "_index",
            extra: "altitude: keystone",
            prefLabel: "Playmaker's Studio",
            type: "Concept",
          }),
        },
        {
          path: `${libraryRoot}/brief/Aggregate - Brief.md`,
          content: productCardFixture({ context: "brief", prefLabel: "Brief", type: "Aggregate" }),
        },
        {
          path: `${libraryRoot}/workflow/Aggregate - Workflow.md`,
          content: productCardFixture({
            context: "workflow",
            prefLabel: "Workflow",
            type: "Aggregate",
          }),
        },
      ],
      libraryRoot,
    });

    // The keystone card survives (the Index renders the thesis from it)...
    expect(catalog.cards.find((card) => card.context === "_index")?.prefLabel).toBe(
      "Playmaker's Studio",
    );
    // ...but never becomes a context tile, a coverage row, or a readiness area...
    expect(catalog.areas.map((area) => area.context).sort()).toEqual(["brief", "workflow"]);
    expect(catalog.fillReadiness?.areas.some((area) => area.context === "_index")).toBeFalse();
    expect(catalog.fillReadiness?.totalCardCount).toBe(2);
    // ...and its container nouns raise no spurious missing_card gaps.
    expect(catalog.threads?.filter((thread) => thread.kind === "missing_card")).toEqual([]);
  });

  test("loads Back-of-House sweep thread kinds as authored (free-string, no alias mapping)", () => {
    const parsed = parseTestThreadRecords(
      JSON.stringify({
        schemaVersion: "library-threads.v1",
        threads: [
          {
            id: "gap-proving-never-performed",
            family: "gap",
            kind: "specified_not_performed",
            concerns: [{ type: "card", cardId: "Value - Pass Rate" }],
            confidence: "high",
            severity: "high",
            reason: "Proving is specified but never performed.",
          },
          {
            id: "gap-advance-contract-rulebook-section-missing",
            family: "gap",
            kind: "dangling_reference",
            concerns: [{ type: "card", cardId: "Mechanic - Auto-Advance Contract" }],
            confidence: "high",
            severity: "low",
            reason: "The cited rulebook section does not exist.",
          },
          {
            id: "hot-spot-two-card-vocabularies",
            family: "hot_spot",
            kind: "docs_disagree_polysemy",
            concerns: [{ type: "card", cardId: "Concept - Validators" }],
            confidence: "high",
            severity: "high",
            reason: "Two card vocabularies coexist.",
          },
        ],
      }),
    );

    // No thread is rejected and no kind is remapped: each kind loads exactly as
    // authored (lowercased). CANONICAL_THREAD_KINDS is a reference set, not a gate,
    // so the precise sweep word survives in `kind` (not just in `reason`).
    expect(parsed.metadataIssues).toEqual([]);
    expect(parsed.threads.map((thread) => [thread.id, thread.kind])).toEqual([
      ["gap-proving-never-performed", "specified_not_performed"],
      ["gap-advance-contract-rulebook-section-missing", "dangling_reference"],
      ["hot-spot-two-card-vocabularies", "docs_disagree_polysemy"],
    ]);
  });

  test("preserves a thread kind that was never canonical and never an alias (free-string contract)", () => {
    // `altitude_ambiguous` is not in CANONICAL_THREAD_KINDS and was never an alias
    // key — it must still load verbatim. This proves `kind` is a genuine free
    // string, not merely a wider set of recognized words.
    const parsed = parseTestThreadRecords(
      JSON.stringify({
        schemaVersion: "library-threads.v1",
        threads: [
          {
            id: "gap-altitude-ambiguous",
            family: "gap",
            kind: "Altitude_Ambiguous",
            concerns: [{ type: "card", cardId: "Surface - Studio" }],
            confidence: "medium",
            severity: "medium",
            reason: "Card mixes runtime and design altitude.",
          },
        ],
      }),
    );

    expect(parsed.metadataIssues).toEqual([]);
    // Loaded as-authored, lowercased, with no remap.
    expect(parsed.threads.map((thread) => thread.kind)).toEqual(["altitude_ambiguous"]);
  });

  test("an authored thread blocks fill via structural missingSections, regardless of its free-string kind", () => {
    const libraryRoot = "/project/studio/library";
    const authored = parseTestThreadRecords(
      JSON.stringify({
        schemaVersion: "library-threads.v1",
        threads: [
          {
            // A non-canonical sweep kind: blocking-ness comes from missingSections,
            // not the kind word. Mixed case / duplicate exercise normalization.
            id: "thread:asserted-not-demonstrated:Surface - Studio",
            family: "gap",
            kind: "asserted_not_demonstrated",
            missingSections: ["why", "WHEN", "why"],
            concerns: [{ type: "card", cardId: "Surface - Studio" }],
            confidence: "high",
            severity: "high",
            reason: "Studio surface asserts behavior it never demonstrates.",
          },
        ],
      }),
    );

    expect(authored.metadataIssues).toEqual([]);
    // missingSections is parsed off authored threads, normalized to canonical
    // order, and deduped. Authored WHEN is accepted without inspecting the card.
    expect(authored.threads[0]?.missingSections).toEqual(["WHY", "WHEN"]);
    expect(authored.threads[0]?.kind).toBe("asserted_not_demonstrated");

    const catalog = buildLibraryCatalog({
      authoredThreads: authored.threads,
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/studio/Surface - Studio.md`,
          content: productCardFixture({
            context: "studio",
            plane: "Product",
            prefLabel: "Studio",
            type: "Surface",
          }),
        },
      ],
      libraryRoot,
    });

    // The card body is complete, so there is no derived missing-material thread:
    // the only blocking thread is the authored one, selected by its
    // missingSections rather than by a recognized `kind`. `fillable` (body-driven)
    // and `blockingThreadIds` (thread-driven) are independent signals.
    expect(
      catalog.fillReadiness?.cards.find((card) => card.cardId === "Surface - Studio"),
    ).toMatchObject({
      blockingThreadIds: ["thread:asserted-not-demonstrated:Surface - Studio"],
      fillable: true,
    });
  });

  test("loads a context concern without a plane and backfills it from the referenced area", () => {
    const libraryRoot = "/project/studio/library";
    const parsed = parseTestThreadRecords(
      JSON.stringify({
        schemaVersion: "library-threads.v1",
        threads: [
          {
            id: "gap-proving-never-performed",
            family: "gap",
            kind: "specified_not_performed",
            concerns: [
              { type: "card", cardId: "Value - Pass Rate" },
              { type: "context", context: "proving" },
            ],
            confidence: "high",
            severity: "high",
            reason: "Proving is specified but never performed.",
          },
        ],
      }),
    );

    // A context concern with no plane parses (plane is optional, matching the
    // type and the client schema) rather than being rejected.
    expect(parsed.metadataIssues).toEqual([]);

    const catalog = buildLibraryCatalog({
      authoredThreads: parsed.threads,
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/proving/Value - Pass Rate.md`,
          content: productCardFixture({
            context: "proving",
            plane: "Product",
            prefLabel: "Pass Rate",
            type: "Value",
          }),
        },
      ],
      libraryRoot,
    });

    const thread = catalog.threads?.find((entry) => entry.id === "gap-proving-never-performed");
    expect(thread?.kind).toBe("specified_not_performed");
    expect(thread?.concerns.find((concern) => concern.type === "context")).toMatchObject({
      context: "proving",
      plane: "product",
    });
  });

  test("uses the story resolver for derived missing-card checks", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/board/Aggregate - Board.md`,
          content: productCardFixture({
            body: "## WHAT\nWork Board exists.\n\n## WHY\nIt keeps board decisions grounded in director-visible state.\n\n## WHERE\nIdentity comes from [[Component - Play Registry]].\n\n## HOW\nIt moves work through [[Stage]].",
            context: "board",
            prefLabel: "Work Board",
            type: "Aggregate",
          }),
        },
        {
          path: `${libraryRoot}/board/Read-Model - Play Registry.md`,
          content: productCardFixture({
            context: "board",
            prefLabel: "Play Registry",
            type: "Read-Model",
          }),
        },
        {
          path: `${libraryRoot}/board/Value - Stage.md`,
          content: productCardFixture({
            context: "board",
            prefLabel: "Stage",
            type: "Value",
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.threads).toEqual([]);
    expect(catalog.fillReadiness).toMatchObject({
      fillableCardCount: 3,
      gapCount: 0,
      ready: true,
      threadCount: 0,
      totalCardCount: 3,
    });
  });

  // Skipped: reads studio/library from the real repo tree, and studio/ was
  // removed in the alexandria-simple pare-back. Needs a fixture rewrite (or
  // removal) before re-enabling.
  test.skip("keeps renderer-resolved board wikilinks out of derived missing-card threads", () => {
    const studioLibraryRoot = join(import.meta.dir, "../../../..", "studio/library");
    const files = collectMarkdownFiles(studioLibraryRoot);
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files,
      libraryRoot: studioLibraryRoot,
    });
    const resolveCard = createCatalogCardResolver(catalog.cards);
    const cardsByPath = new Map(catalog.cards.map((card) => [card.path, card]));
    const missingCardThreadIds = new Set(
      (catalog.threads ?? [])
        .filter((thread) => thread.kind === "missing_card")
        .map((thread) => thread.id),
    );
    const resolvedLinksFlaggedAsMissing: string[] = [];

    for (const file of files) {
      const card = cardsByPath.get(relative(studioLibraryRoot, file.path).split(sep).join("/"));
      if (card == null) {
        continue;
      }
      const sections = extractCatalogMarkdownSections(file.content);
      for (const sectionContent of [sections.what, sections.where, sections.how]) {
        for (const wikilink of extractCatalogWikilinks(sectionContent)) {
          if (resolveCard(wikilink.target) == null) {
            continue;
          }
          const missingCardThreadId = `thread:derived:missing-card:${card.id}:${wikilink.target}`;
          if (missingCardThreadIds.has(missingCardThreadId)) {
            resolvedLinksFlaggedAsMissing.push(`${card.id} -> ${wikilink.target}`);
          }
        }
      }
    }

    expect(resolvedLinksFlaggedAsMissing).toEqual([]);
    expect(missingCardThreadIds).toContain(
      "thread:derived:missing-card:Aggregate - Board:Director",
    );
    expect(
      missingCardThreadIds.has(
        "thread:derived:missing-card:Aggregate - Board:Component - Play Registry",
      ),
    ).toBeFalse();
  });

  test("marks a schema-aware catalog preliminary-ready when every card is fillable and no Threads remain", () => {
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: "/project/studio/library/product/Surface - Library.md",
          content: productCardFixture(),
        },
      ],
      libraryRoot: "/project/studio/library",
    });

    expect(catalog.threads).toEqual([]);
    expect(catalog.fillReadiness).toMatchObject({
      fillableCardCount: 1,
      gapCount: 0,
      hotSpotCount: 0,
      ready: true,
      threadCount: 0,
      totalCardCount: 1,
    });
  });

  test("parses authored thread lifecycle statuses without metadata issues", () => {
    const parsed = parseTestThreadRecords(
      JSON.stringify({
        schemaVersion: "library-threads.v1",
        threads: ["open", "answered", "residual"].map((status) =>
          threadFixture({
            id: `thread:${status}`,
            status,
          }),
        ),
      }),
    );

    expect(parsed.metadataIssues).toEqual([]);
    expect(parsed.threads.map((thread) => [thread.id, thread.status])).toEqual([
      ["thread:open", "open"],
      ["thread:answered", "answered"],
      ["thread:residual", "residual"],
    ]);
  });

  test("defaults unknown and missing authored thread statuses to open", () => {
    const parsed = parseTestThreadRecords(
      JSON.stringify({
        schemaVersion: "library-threads.v1",
        threads: [
          threadFixture({
            id: "thread:unknown-status",
            status: "wat",
          }),
          threadFixture({
            id: "thread:missing-status",
          }),
        ],
      }),
    );

    expect(parsed.metadataIssues).toEqual([]);
    expect(parsed.threads.map((thread) => [thread.id, thread.status])).toEqual([
      ["thread:unknown-status", "open"],
      ["thread:missing-status", "open"],
    ]);
  });

  test("preserves authored thread lifecycle provenance fields", () => {
    const parsed = parseTestThreadRecords(
      JSON.stringify({
        schemaVersion: "library-threads.v1",
        threads: [
          threadFixture({
            emittingMove: "pass2_carve",
            id: "thread:answered-with-provenance",
            question: "Which stage owns this unresolved director call?",
            resolvingEventId: "event:director-answer-1",
            sourceEvidence: [" studio/plays/README.md:122 ", "", "studio/board-state.json:4"],
            status: "answered",
          }),
          threadFixture({
            id: "thread:empty-source-evidence",
            sourceEvidence: [],
            status: "residual",
          }),
        ],
      }),
    );

    expect(parsed.metadataIssues).toEqual([]);
    expect(parsed.threads[0]).toMatchObject({
      emittingMove: "pass2_carve",
      question: "Which stage owns this unresolved director call?",
      resolvingEventId: "event:director-answer-1",
      sourceEvidence: ["studio/plays/README.md:122", "studio/board-state.json:4"],
      status: "answered",
    });
    expect(parsed.threads[1]?.sourceEvidence).toEqual([]);
    expect(parsed.threads[1]?.status).toBe("residual");
  });

  test("keeps legacy authored threads shape-compatible", () => {
    const parsed = parseTestThreadRecords(
      JSON.stringify({
        schemaVersion: "library-threads.v1",
        threads: [threadFixture({ id: "thread:legacy" })],
      }),
    );

    expect(parsed.metadataIssues).toEqual([]);
    const thread = parsed.threads[0];
    expect(thread?.status).toBe("open");
    expect(thread == null ? false : hasAnyLifecycleProvenanceKey(thread)).toBeFalse();
  });

  test("parsing threads is idempotent", () => {
    const content = JSON.stringify({
      schemaVersion: "library-threads.v1",
      threads: [
        threadFixture({
          id: "thread:idempotent",
          question: "What should the director resolve?",
          sourceEvidence: [],
          status: "answered",
        }),
      ],
    });

    expect(parseTestThreadRecords(content).threads).toEqual(
      parseTestThreadRecords(content).threads,
    );
  });

  // Skipped: reads studio/library and studio/sweeps/playmaker-studio from the
  // real repo tree, and studio/ was removed in the alexandria-simple
  // pare-back. Needs a fixture rewrite (or removal) before re-enabling.
  test.skip("raw fixture roots without ledger events expose only derived threads", async () => {
    // Load through the real runtime loader (the path the viewer/API use) so the
    // operational-markdown and runtime/ exclusions apply. Counts are asserted as
    // non-empty rather than exact, so a re-swept fixture can grow or shrink
    // without detonating this thread-lifecycle regression.
    const repoRoot = join(import.meta.dir, "../../../..");
    const loadRoot = (libraryRoot: string) =>
      Effect.runPromise(
        loadLibraryCatalogRoot(repoRoot, libraryRoot).pipe(Effect.provide(NodeFileSystem)),
      );
    const studioCatalog = await loadRoot("studio/library");
    const pmsCatalog = await loadRoot("studio/sweeps/playmaker-studio");

    expect(studioCatalog.meta.metadataIssues).toEqual([
      "Invalid card board/Value - Stage.md: staged flow is valid only on Pattern or Mechanism cards",
    ]);
    expect(pmsCatalog.meta.metadataIssues).toEqual([]);

    for (const catalog of [studioCatalog, pmsCatalog]) {
      const threads = catalog.threads ?? [];
      expect(catalog.meta.cardCount).toBeGreaterThan(0);
      expect(threads.filter((thread) => thread.source === "authored")).toEqual([]);
      expect(threads.every((thread) => thread.status === "open")).toBeTrue();
      expect(threads.every((thread) => !("resolvingEventId" in thread))).toBeTrue();
    }
  });

  test("flags a non-array threads field instead of silently dropping it", () => {
    const parsed = parseTestThreadRecords(
      JSON.stringify({ schemaVersion: "library-threads.v1", threads: { id: "x" } }),
    );

    expect(parsed.threads).toEqual([]);
    expect(parsed.metadataIssues).toEqual([
      "Invalid library thread events: threads must be an array",
    ]);
  });

  test("flags duplicate authored thread ids and keeps the first", () => {
    const dupThread = (reason: string) => ({
      id: "dup",
      family: "hot_spot",
      kind: "polysemy",
      concerns: [{ type: "card", cardId: "Value - Stage" }],
      confidence: "high",
      severity: "medium",
      reason,
    });
    const parsed = parseTestThreadRecords(
      JSON.stringify({
        schemaVersion: "library-threads.v1",
        threads: [dupThread("First."), dupThread("Second.")],
      }),
    );

    expect(parsed.threads.map((thread) => thread.reason)).toEqual(["First."]);
    expect(parsed.metadataIssues).toEqual([
      'Invalid library thread events: duplicate thread id "dup"',
    ]);
  });

  test("parses workflows with deterministic workflow and step ordering", () => {
    const parsed = parseLibraryCatalogWorkflows(
      JSON.stringify({
        schemaVersion: "library-workflows.v1",
        workflows: [
          {
            id: "z-workflow",
            unit: "Play",
            steps: [{ order: 2, activity: "Ship", context: "factory" }],
          },
          {
            id: "a-workflow",
            unit: "Play",
            steps: [
              {
                order: 3,
                activity: "Dry-run",
                context: "factory",
                doer: "Grader",
                stateAfter: "built",
                cardRefs: ["Concept - Run Record"],
                evidence: "studio/plays/README.md:71",
              },
              {
                order: 1,
                activity: "Ground",
                context: "research",
                stateBefore: "backlog",
                stateAfter: "sourced",
              },
              {
                order: 1,
                activity: "Confirm design",
                context: "board",
                gate: true,
              },
            ],
          },
        ],
      }),
    );

    expect(parsed.metadataIssues).toEqual([]);
    expect(parsed.workflows.map((workflow) => workflow.id)).toEqual(["a-workflow", "z-workflow"]);
    expect(parsed.workflows[0]?.steps.map((step) => [step.order, step.activity])).toEqual([
      [1, "Ground"],
      [1, "Confirm design"],
      [3, "Dry-run"],
    ]);
    expect(parsed.workflows[0]?.steps[1]).toMatchObject({
      context: "board",
      gate: true,
    });
    expect(parsed.workflows[0]?.steps[2]).toMatchObject({
      cardRefs: ["Concept - Run Record"],
      doer: "Grader",
      evidence: "studio/plays/README.md:71",
      stateAfter: "built",
    });
  });

  test("rejects malformed workflows as metadata issues", () => {
    expect(parseLibraryCatalogWorkflows("{").metadataIssues[0]).toContain("Invalid workflows.json");
    expect(
      parseLibraryCatalogWorkflows(
        JSON.stringify({
          schemaVersion: "wrong",
          workflows: [],
        }),
      ),
    ).toEqual({
      metadataIssues: ["Invalid workflows.json: schemaVersion must be library-workflows.v1"],
      workflows: [],
    });
    expect(
      parseLibraryCatalogWorkflows(
        JSON.stringify({
          schemaVersion: "library-workflows.v1",
          workflows: [
            {
              id: "bad",
              unit: "Play",
              steps: [{ order: 1, context: "board" }],
            },
          ],
        }),
      ),
    ).toEqual({
      metadataIssues: ['Invalid workflows.json: workflow "bad" step 1: missing activity'],
      workflows: [],
    });
  });

  test("flags duplicate workflow ids and keeps the first", () => {
    const workflow = (activity: string) => ({
      id: "dup",
      unit: "Play",
      steps: [{ order: 0, activity, context: "board" }],
    });
    const parsed = parseLibraryCatalogWorkflows(
      JSON.stringify({
        schemaVersion: "library-workflows.v1",
        workflows: [workflow("First"), workflow("Second")],
      }),
    );

    expect(parsed.workflows.map((entry) => entry.steps[0]?.activity)).toEqual(["First"]);
    expect(parsed.metadataIssues).toEqual(['Invalid workflows.json: duplicate workflow id "dup"']);
  });

  test("flags unresolved workflow card refs but treats work-only contexts as valid", () => {
    const libraryRoot = "/project/studio/library";
    const parsed = parseLibraryCatalogWorkflows(
      JSON.stringify({
        schemaVersion: "library-workflows.v1",
        workflows: [
          {
            id: "play-production",
            unit: "Play",
            steps: [
              {
                order: 3,
                activity: "Confirm design",
                context: "board",
                gate: true,
                cardRefs: ["Value - Stage", "Value - Ghost"],
              },
              {
                order: 6,
                activity: "Dry-run",
                context: "factory",
              },
            ],
          },
        ],
      }),
    );

    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/board/Value - Stage.md`,
          content: productCardFixture({ context: "board", prefLabel: "Stage", type: "Value" }),
        },
      ],
      libraryRoot,
      workflows: parsed.workflows,
    });

    expect(catalog.workflows?.map((workflow) => workflow.id)).toEqual(["play-production"]);
    expect(catalog.workflows?.[0]?.steps.map((step) => step.context)).toEqual(["board", "factory"]);
    // A genuinely dangling card reference is still flagged.
    expect(catalog.meta.metadataIssues).toContain(
      'Invalid workflows.json: workflow "play-production" step 3 references unknown card "Value - Ghost"',
    );
    // A resolvable card reference is not flagged.
    expect(catalog.meta.metadataIssues.join("\n")).not.toContain('unknown card "Value - Stage"');
    // The "factory" context holds no cards, but work-only contexts are valid and
    // must NOT be reported as malformed data — only as eventual coverage.
    expect(catalog.meta.metadataIssues.join("\n")).not.toContain("references unknown context");
  });

  test("uses workflows.json fallback and fallback metadata when no card declares flow", () => {
    const libraryRoot = "/project/studio/library";
    const parsed = parseLibraryCatalogWorkflows(
      JSON.stringify({
        schemaVersion: "library-workflows.v1",
        workflows: [
          {
            id: "sidecar-workflow",
            unit: "Sidecar Unit",
            steps: [{ order: 0, activity: "Sidecar activity", context: "sidecar" }],
          },
        ],
      }),
    );

    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/board/Value - Stage.md`,
          content: productCardFixture({ context: "board", prefLabel: "Stage", type: "Value" }),
        },
      ],
      libraryRoot,
      workflowMetadataIssues: ["Invalid workflows.json: fixture fallback issue"],
      workflows: parsed.workflows,
    });

    expect(catalog.workflows).toEqual(parsed.workflows);
    expect(catalog.meta.metadataIssues).toContain("Invalid workflows.json: fixture fallback issue");
  });

  test("projects aggregate card workflow flow with ordered steps and refs", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/playbook/Entity - Play Run.md`,
          content: productCardFixture({
            context: "playbook",
            extra: `altitude: aggregate
flow:
  - activity: Lease the session connection
    doer: Monitor
    stateAfter: connected
    refs: [Entity - Session, Mechanism - Monitor]
  - activity: Handoff to the run bridge
    refs:
      - Entity - Session`,
            prefLabel: "Play Run",
            type: "Entity",
          }),
        },
        {
          path: `${libraryRoot}/playbook/Entity - Session.md`,
          content: productCardFixture({
            context: "playbook",
            prefLabel: "Session",
            type: "Entity",
          }),
        },
        {
          path: `${libraryRoot}/playbook/Mechanism - Monitor.md`,
          content: productCardFixture({
            context: "playbook",
            prefLabel: "Monitor",
            type: "Mechanism",
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.meta.metadataIssues).toEqual([]);
    expect(catalog.cards.find((card) => card.id === "Entity - Play Run")?.flow).toBeUndefined();
    expect(catalog.workflows).toEqual([
      {
        id: "entity-play-run",
        plane: "product",
        unit: "Play Run",
        steps: [
          {
            activity: "Lease the session connection",
            cardRefs: ["Entity - Session", "Mechanism - Monitor"],
            context: "playbook",
            doer: "Monitor",
            order: 0,
            stateAfter: "connected",
          },
          {
            activity: "Handoff to the run bridge",
            cardRefs: ["Entity - Session"],
            context: "playbook",
            order: 1,
          },
        ],
      },
    ]);
  });

  test("ignores workflows.json fallback when an aggregate card declares workflow flow", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/playbook/Entity - Play Run.md`,
          content: productCardFixture({
            context: "playbook",
            extra: `altitude: aggregate
flow:
  - activity: Start the run
    doer: Agent
    stateAfter: running`,
            prefLabel: "Play Run",
            type: "Entity",
          }),
        },
      ],
      libraryRoot,
      workflowMetadataIssues: ["Invalid workflows.json: ignored sidecar issue"],
      workflows: [
        {
          id: "sidecar-workflow",
          steps: [{ activity: "Sidecar activity", context: "sidecar", order: 0 }],
          unit: "Sidecar",
        },
      ],
    });

    expect(catalog.workflows?.map((workflow) => workflow.id)).toEqual(["entity-play-run"]);
    expect(catalog.workflows?.[0]?.steps.map((step) => step.activity)).toEqual(["Start the run"]);
    expect(catalog.meta.metadataIssues).not.toContain(
      "Invalid workflows.json: ignored sidecar issue",
    );
  });

  test("reports object-list flow on a non-aggregate card and emits no workflow", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/board/Value - Stage.md`,
          content: productCardFixture({
            context: "board",
            extra: `altitude: value
flow:
  - activity: Advance the stage`,
            prefLabel: "Stage",
            type: "Value",
          }),
        },
      ],
      libraryRoot,
      workflowMetadataIssues: ["Invalid workflows.json: ignored sidecar issue"],
      workflows: [
        {
          id: "sidecar-workflow",
          steps: [{ activity: "Sidecar activity", context: "sidecar", order: 0 }],
          unit: "Sidecar",
        },
      ],
    });

    expect(catalog.workflows).toBeUndefined();
    expect(catalog.meta.metadataIssues).toContain(
      "Invalid card board/Value - Stage.md: workflow flow is valid only on altitude aggregate cards",
    );
    expect(catalog.meta.metadataIssues).not.toContain(
      "Invalid workflows.json: ignored sidecar issue",
    );
  });

  test("drops malformed card-flow steps without dropping other card workflows", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/playbook/Entity - Broken Run.md`,
          content: productCardFixture({
            context: "playbook",
            extra: `altitude: aggregate
flow:
  - activity: Broken refs
    refs: Entity - Session`,
            prefLabel: "Broken Run",
            type: "Entity",
          }),
        },
        {
          path: `${libraryRoot}/playbook/Entity - Good Run.md`,
          content: productCardFixture({
            context: "playbook",
            extra: `altitude: aggregate
flow:
  - activity: Valid step
    stateAfter: complete`,
            prefLabel: "Good Run",
            type: "Entity",
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.workflows?.map((workflow) => workflow.id)).toEqual(["entity-good-run"]);
    expect(catalog.meta.metadataIssues).toContain(
      "Invalid card playbook/Entity - Broken Run.md: flow[0].refs must be a list of strings",
    );
    expect(catalog.meta.metadataIssues).toContain(
      "Invalid card playbook/Entity - Broken Run.md: flow produced no valid workflow steps",
    );
  });

  test("carries per-step context, gate, and evidence with card-context fallback", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/playbook/Entity - Play Run.md`,
          content: productCardFixture({
            context: "playbook",
            extra: `altitude: aggregate
flow:
  - activity: Start the local runtime and viewer
    context: viewer
    doer: Director
    stateAfter: healthy
    evidence: packages/ax/src/cli/router.ts
  - activity: Draft the Vision slots and rule on each
    context: playbook
    gate: true
    stateAfter: slots resolved
  - activity: Complete the run
    stateAfter: complete`,
            prefLabel: "Play Run",
            type: "Entity",
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.workflows?.[0]?.plane).toBe("product");
    const steps = catalog.workflows?.[0]?.steps ?? [];
    expect(steps.map((step) => step.context)).toEqual(["viewer", "playbook", "playbook"]);
    expect(steps.map((step) => step.gate)).toEqual([undefined, true, undefined]);
    expect(steps[0]?.evidence).toBe("packages/ax/src/cli/router.ts");
  });

  test("reports a non-boolean flow gate and drops the step", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/playbook/Entity - Play Run.md`,
          content: productCardFixture({
            context: "playbook",
            extra: `altitude: aggregate
flow:
  - activity: Gate with a bad flag
    gate: sometimes
  - activity: Valid step
    stateAfter: complete`,
            prefLabel: "Play Run",
            type: "Entity",
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.meta.metadataIssues).toContain(
      "Invalid card playbook/Entity - Play Run.md: flow[0].gate must be true or false",
    );
    expect(catalog.workflows?.[0]?.steps.map((step) => step.activity)).toEqual(["Valid step"]);
  });

  test("flags dangling card-flow refs with the workflow cardRef validator", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/playbook/Entity - Play Run.md`,
          content: productCardFixture({
            context: "playbook",
            extra: `altitude: aggregate
flow:
  - activity: Reference a ghost
    refs: [Entity - Ghost]`,
            prefLabel: "Play Run",
            type: "Entity",
          }),
        },
      ],
      libraryRoot,
    });

    expect(catalog.workflows?.map((workflow) => workflow.id)).toEqual(["entity-play-run"]);
    expect(catalog.meta.metadataIssues).toContain(
      'Invalid workflows.json: workflow "entity-play-run" step 0 references unknown card "Entity - Ghost"',
    );
  });

  test("keeps valid Pattern staged string-list flow as a card field without projecting a workflow", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/production-ladder/Pattern - Production Ladder.md`,
          content: productCardFixture({
            context: "production-ladder",
            extra: `altitude: pillar
flow:
  - Backlog
  - Sourced
  - Designed`,
            prefLabel: "Production Ladder",
            type: "Pattern",
          }),
        },
      ],
      libraryRoot,
      workflowMetadataIssues: ["Invalid workflows.json: ignored sidecar issue"],
      workflows: [
        {
          id: "sidecar-workflow",
          steps: [{ activity: "Sidecar activity", context: "sidecar", order: 0 }],
          unit: "Sidecar",
        },
      ],
    });

    expect(catalog.cards[0]?.flow).toEqual(["Backlog", "Sourced", "Designed"]);
    expect(catalog.workflows).toBeUndefined();
    expect(catalog.meta.metadataIssues).toEqual([]);
  });

  test("reports staged string-list flow on a non-Pattern non-Mechanism card", () => {
    const libraryRoot = "/project/studio/library";
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: `${libraryRoot}/board/Value - Stage.md`,
          content: productCardFixture({
            context: "board",
            extra: `altitude: value
flow:
  - Backlog
  - Sourced
  - Designed`,
            prefLabel: "Stage",
            type: "Value",
          }),
        },
      ],
      libraryRoot,
      workflowMetadataIssues: ["Invalid workflows.json: ignored sidecar issue"],
      workflows: [
        {
          id: "sidecar-workflow",
          steps: [{ activity: "Sidecar activity", context: "sidecar", order: 0 }],
          unit: "Sidecar",
        },
      ],
    });

    expect(catalog.workflows).toBeUndefined();
    expect(catalog.meta.metadataIssues).toContain(
      "Invalid card board/Value - Stage.md: staged flow is valid only on Pattern or Mechanism cards",
    );
    expect(catalog.meta.metadataIssues).not.toContain(
      "Invalid workflows.json: ignored sidecar issue",
    );
  });

  test("attaches an authored concern whose cardId differs only by case", () => {
    const authored = parseTestThreadRecords(
      JSON.stringify({
        schemaVersion: "library-threads.v1",
        threads: [
          {
            id: "thread:case",
            family: "hot_spot",
            kind: "polysemy",
            concerns: [{ type: "card", cardId: "value - stage" }],
            confidence: "high",
            severity: "medium",
            reason: "Case-insensitive match.",
          },
        ],
      }),
    );
    expect(authored.metadataIssues).toEqual([]);

    const catalog = buildLibraryCatalog({
      authoredThreads: authored.threads,
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: "/project/studio/library/board/Value - Stage.md",
          content: productCardFixture({ context: "board", prefLabel: "Stage", type: "Value" }),
        },
      ],
      libraryRoot: "/project/studio/library",
    });

    const stageReadiness = catalog.fillReadiness?.cards.find(
      (card) => card.cardId === "Value - Stage",
    );
    // The mis-cased cardId still attaches to the area worklist, but authored
    // hot spots do not block a complete card's fillability.
    expect(stageReadiness).toMatchObject({
      blockingThreadIds: [],
      fillable: true,
    });
    expect(catalog.fillReadiness?.hotSpotCount).toBe(1);
    expect(
      catalog.fillReadiness?.areas.find((area) => area.areaId === "area:product:board")
        ?.hotSpotCount,
    ).toBe(1);
    expect(catalog.meta.metadataIssues).toEqual([]);
  });

  test("flags an authored thread that references an unknown card", () => {
    const authored = parseTestThreadRecords(
      JSON.stringify({
        schemaVersion: "library-threads.v1",
        threads: [
          {
            id: "thread:ghost",
            family: "hot_spot",
            kind: "polysemy",
            concerns: [{ type: "card", cardId: "Value - Nonexistent" }],
            confidence: "high",
            severity: "medium",
            reason: "Points nowhere.",
          },
        ],
      }),
    );

    const catalog = buildLibraryCatalog({
      authoredThreads: authored.threads,
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: "/project/studio/library/board/Value - Stage.md",
          content: productCardFixture({ context: "board", prefLabel: "Stage", type: "Value" }),
        },
      ],
      libraryRoot: "/project/studio/library",
    });

    expect(catalog.meta.metadataIssues).toContain(
      'Invalid library thread event: thread "thread:ghost" references unknown card "Value - Nonexistent"',
    );
  });

  test("keeps legacy raw connectors outside product-card schema mode", () => {
    const catalog = buildLibraryCatalog({
      files: [
        {
          path: "/project/docs/alexandria/library/product/surfaces/Surface - Library.md",
          content: `---
type: Surface
prefLabel: Library
context: library
plane: Product
status: stub
confidence: high
proposed_by: scanner
source_evidence: docs/source.md
connectors:
  - "contains -> Card Drawer"
---

## WHAT
Library shows cards.
`,
        },
      ],
      libraryRoot: "/project/docs/alexandria/library",
    });

    expect(catalog.cards[0]?.connectors).toEqual(["contains -> Card Drawer"]);
    expect(catalog.cards[0]?.links).toBeUndefined();
    expect(catalog.cards[0]?.diagram).toBeUndefined();
    expect(catalog.meta.metadataIssues).toEqual([]);
  });

  test("de-dupes an authored thread that collides with a derived id (derived wins)", () => {
    const collidingId = "thread:derived:missing-material:Value - Empty";
    const authored = parseTestThreadRecords(
      JSON.stringify({
        schemaVersion: "library-threads.v1",
        threads: [
          {
            id: collidingId,
            family: "hot_spot",
            kind: "polysemy",
            concerns: [{ type: "card", cardId: "Value - Empty" }],
            confidence: "high",
            severity: "medium",
            reason: "Authored squatter.",
          },
        ],
      }),
    );

    const catalog = buildLibraryCatalog({
      authoredThreads: authored.threads,
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        {
          path: "/project/studio/library/board/Value - Empty.md",
          content: productCardFixture({
            body: "## WHAT\nHas what.\n\n## WHY\nHas why.\n\n## WHERE\nHas where.\n\n## HOW\n",
            context: "board",
            prefLabel: "Empty",
            type: "Value",
          }),
        },
      ],
      libraryRoot: "/project/studio/library",
    });

    const matching = catalog.threads?.filter((thread) => thread.id === collidingId) ?? [];
    expect(matching).toHaveLength(1);
    expect(matching[0]).toMatchObject({
      family: "gap",
      kind: "missing_material",
      source: "derived",
    });
    expect(catalog.fillReadiness?.threadCount).toBe(1);
  });

  test("legacy catalog mode remains byte-for-byte unchanged without a schema declaration", () => {
    const input = {
      files: [
        {
          path: "/project/docs/alexandria/library/product/components/Component - Unfiled.md",
          content: `---
type: Component
prefLabel: Unfiled
plane: Product
status: stub
confidence: medium
proposed_by: scanner
source_evidence: docs/source.md
---`,
        },
      ],
      libraryRoot: "/project/docs/alexandria/library",
    };
    const implicitLegacy = buildLibraryCatalog(input);
    const explicitLegacy = buildLibraryCatalog({ ...input, catalogSchema: "legacy" });

    expect(JSON.stringify(implicitLegacy)).toBe(JSON.stringify(explicitLegacy));
    expect("threads" in implicitLegacy).toBeFalse();
    expect("fillReadiness" in implicitLegacy).toBeFalse();
    expect(JSON.stringify(implicitLegacy)).toBe(
      JSON.stringify({
        areas: [
          {
            cardIds: ["Component - Unfiled"],
            context: "",
            gapIds: [],
            id: "area:Product:",
            label: "",
            plane: "Product",
            status: "filled",
          },
        ],
        cards: [
          {
            confidence: "medium",
            context: "",
            edgeIds: [],
            id: "Component - Unfiled",
            path: "product/components/Component - Unfiled.md",
            plane: "Product",
            prefLabel: "Unfiled",
            provenance: {
              actor: {
                kind: "process",
                name: "scanner",
              },
              label: "scanner",
              sourceRefs: ["docs/source.md"],
            },
            status: "stub",
            type: "Component",
          },
        ],
        edges: [],
        gaps: [],
        typeMapping: [],
        meta: {
          areaCount: 1,
          cardCount: 1,
          edgeCount: 0,
          gapCount: 0,
          metadataIssues: [
            "Invalid catalog card product/components/Component - Unfiled.md: missing context",
          ],
          planes: ["Product"],
        },
      }),
    );
  });

  test("warns on unknown altitude words without rejecting legacy catalog cards", () => {
    const catalog = buildLibraryCatalog({
      files: [
        {
          path: "/project/docs/alexandria/library/product/components/Component - Typo.md",
          content: `---
type: Component
prefLabel: Typo
context: board
plane: Product
status: stub
confidence: medium
altitude: pilar
proposed_by: scanner
source_evidence: docs/source.md
---`,
        },
      ],
      libraryRoot: "/project/docs/alexandria/library",
    });

    expect(catalog.cards).toHaveLength(1);
    expect(catalog.cards[0]?.altitude).toBe("pilar");
    expect(catalog.meta.metadataIssues).toEqual([
      'Invalid card product/components/Component - Typo.md: altitude "pilar" is not one of keystone, pillar, context, aggregate, component, value, capability',
    ]);
  });
});
