import { describe, expect, test } from "bun:test";
import {
  buildLibraryCatalog,
  PRODUCT_CARD_SCHEMA_VERSION,
  type LibraryCatalog,
} from "./library-catalog.js";
import {
  extractCatalogMarkdownSections,
  extractCatalogStoryBuckets,
  formatProductCardStoryLint,
  lintProductCatalogStories,
} from "./library-catalog-story.js";

const libraryRoot = "/project/studio/library";

interface ProductCardInput {
  altitude?: string;
  body: string;
  connectors?: string[];
  fileStem: string;
  flow?: string[];
  links?: Record<string, string[]>;
  prefLabel: string;
  type: string;
}

function productCard(input: ProductCardInput) {
  const lines = [
    "---",
    `type: ${input.type}`,
    `prefLabel: "${input.prefLabel}"`,
    "plane: Product",
    "context: board",
    ...(input.altitude == null ? [] : [`altitude: ${input.altitude}`]),
    "status: stub",
    "confidence: medium",
  ];

  if (input.connectors != null && input.connectors.length > 0) {
    lines.push("connectors:");
    for (const connector of input.connectors) {
      lines.push(`  - "${connector}"`);
    }
  }

  if (input.links != null && Object.keys(input.links).length > 0) {
    lines.push("links:");
    for (const [key, values] of Object.entries(input.links)) {
      lines.push(`  ${key}:`);
      for (const value of values) {
        lines.push(`    - "${value}"`);
      }
    }
  }

  if (input.flow != null && input.flow.length > 0) {
    lines.push("flow:");
    for (const stage of input.flow) {
      lines.push(`  - ${stage}`);
    }
  }

  lines.push("proposed_by: scanner", "source_evidence:", "  - fixture.md", "---", "", input.body);

  return {
    content: lines.join("\n"),
    path: `${libraryRoot}/board/${input.fileStem}.md`,
  };
}

function boardCatalog(extraCards: ReturnType<typeof productCard>[] = []): LibraryCatalog {
  return buildLibraryCatalog({
    catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
    files: [
      productCard({
        altitude: "pillar",
        body: `## WHAT
What it's for. The Work Board keeps the studio's play-making effort in one place.

How it works. It gives each [[Play]] a [[Stage]] and records moves in [[Aggregate - Board State]] from the [[Component - Play Registry]].

## WHERE
Rendered on the Board. The [[Director]] reads it.

## WHY
WHY_SENTINEL joins the story.

## WHEN
WHEN_SENTINEL joins the story, after HOW.

## HOW
- Dragging changes order only after a Director gate.`,
        fileStem: "Aggregate - Board",
        links: {
          contains: ["[[Read-Model - Play Registry]]", "[[Aggregate - Board State]]"],
          operates_on: ["[[Value - Stage]]"],
        },
        prefLabel: "Work Board",
        type: "Aggregate",
      }),
      productCard({
        altitude: "aggregate",
        body: `## WHAT
_Stub —_ Board State stores positions for the [[Work Board]].

## HOW
- Holds the ready list.`,
        fileStem: "Aggregate - Board State",
        prefLabel: "Board State",
        type: "Aggregate",
      }),
      productCard({
        altitude: "value",
        body: `## WHAT
What it does. Stage tells the Director where production stands.

How it does it. Stage is one of Backlog → Sourced; a move is written to [[Board State]].

## HOW
- Stage is distinct from Status.`,
        fileStem: "Value - Stage",
        flow: ["Backlog", "Sourced"],
        prefLabel: "Stage",
        type: "Value",
      }),
      productCard({
        altitude: "component",
        body: `## WHAT
What it does. Play Registry gives every play one identity on the [[Work Board]].

How it does it. The [[Work Board]] and [[Aggregate - Board State]] read identity from it.`,
        fileStem: "Read-Model - Play Registry",
        links: {
          produces: ["[[Aggregate - Board]]", "[[Aggregate - Board State]]"],
        },
        prefLabel: "Play Registry",
        type: "Read-Model",
      }),
      ...extraCards,
    ],
    libraryRoot,
  });
}

describe("Product card catalog stories", () => {
  test("extracts WHAT/HOW/WHY/WHEN buckets (WHERE folds into how) and normalizes diagrams", () => {
    const catalog = boardCatalog();
    const lead = catalog.cards.find((card) => card.id === "Aggregate - Board");
    const stage = catalog.cards.find((card) => card.id === "Value - Stage");
    const registry = catalog.cards.find((card) => card.id === "Read-Model - Play Registry");

    expect(lead?.storyBuckets).toEqual({
      how: [
        "It gives each [[Play]] a [[Stage]] and records moves in [[Aggregate - Board State]] from the [[Component - Play Registry]].",
        "Rendered on the Board. The [[Director]] reads it.",
        "- Dragging changes order only after a Director gate.",
      ].join("\n\n"),
      what: "The Work Board keeps the studio's play-making effort in one place.",
      when: "WHEN_SENTINEL joins the story, after HOW.",
      why: "WHY_SENTINEL joins the story.",
    });
    // WHY and WHEN are now first-class buckets (learning-plane reshape,
    // flight board #672 / director ruling 2026-07-08) — they no longer ride
    // the how bucket.
    expect(lead?.storyBuckets?.how).not.toContain("WHY_SENTINEL");
    expect(lead?.storyBuckets?.how).not.toContain("WHEN_SENTINEL");
    expect(JSON.stringify(lead)).toContain("WHY_SENTINEL");
    expect(JSON.stringify(lead)).toContain("WHEN_SENTINEL");
    expect(lead?.story).toContain("How it works.");
    expect(lead?.diagram).toEqual({
      connectors: [
        {
          label: "contains",
          targetCardId: "Read-Model - Play Registry",
          targetLabel: "Play Registry",
        },
        {
          label: "contains",
          targetCardId: "Aggregate - Board State",
          targetLabel: "Board State",
        },
        {
          label: "operates on",
          targetCardId: "Value - Stage",
          targetLabel: "Stage",
        },
      ],
      kind: "hub",
    });
    expect(stage?.diagram).toEqual({ flow: ["Backlog", "Sourced"], kind: "lifecycle" });
    expect(registry?.diagram).toEqual({
      connectors: [
        {
          label: "produces",
          targetCardId: "Aggregate - Board",
          targetLabel: "Work Board",
        },
        {
          label: "produces",
          targetCardId: "Aggregate - Board State",
          targetLabel: "Board State",
        },
      ],
      kind: "feeds",
    });
  });

  // Issue #633: WHEN is the conditionally-required planning/roadmap slot.
  // `extractCatalogMarkdownSections` must surface it. Since the learning-plane
  // WHY/WHEN reshape (flight board #672 / director ruling 2026-07-08), WHEN no
  // longer rides the how bucket — it is its own first-class bucket.
  test("extracts a ## WHEN section as its own bucket, and leaves how unaffected", () => {
    const content = `---
type: Surface
prefLabel: "Roadmap Item"
plane: Product
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
Planned per the release tracker; not built yet.`;

    const sections = extractCatalogMarkdownSections(content);
    expect(sections.when.trim()).toBe("Planned per the release tracker; not built yet.");

    const buckets = extractCatalogStoryBuckets(content);
    expect(buckets.how).toBe("- Not built yet.");
    expect(buckets.when).toBe("Planned per the release tracker; not built yet.");
  });

  test("a card without ## WHEN is unchanged: empty when section, how bucket unaffected", () => {
    const content = `---
type: Surface
prefLabel: "No Roadmap"
plane: Product
context: board
status: stub
confidence: medium
proposed_by: scanner
source_evidence:
  - fixture.md
---

## WHAT
What it does. A built surface.

## HOW
- Already shipped.`;

    const sections = extractCatalogMarkdownSections(content);
    expect(sections.when).toBe("");

    const buckets = extractCatalogStoryBuckets(content);
    expect(buckets.how).toBe("- Already shipped.");
    expect(buckets.when).toBe("");
  });

  // Director ruling 2026-07-08 (flight board #672): a card authoring all five
  // sections yields four rendered buckets — WHERE folds into how (locational
  // detail), WHY and WHEN each render on their own, and WHEN no longer rides
  // the how bucket.
  test("a card with all five sections yields four buckets: WHERE folds into how, WHY/WHEN stand alone", () => {
    const content = `---
type: Surface
prefLabel: "Five Section Fixture"
plane: Product
context: board
status: stub
confidence: medium
proposed_by: scanner
source_evidence:
  - fixture.md
---

## WHAT
What it does. A fully-authored surface.

## WHERE
Rendered on the Board.

## WHY
It exists so the Director never loses track of a play.

## HOW
- Advances one column at a time.

## WHEN
Consulted at every gate decision.`;

    const buckets = extractCatalogStoryBuckets(content);

    expect(buckets).toEqual({
      how: ["Rendered on the Board.", "- Advances one column at a time."].join("\n\n"),
      what: "A fully-authored surface.",
      when: "Consulted at every gate decision.",
      why: "It exists so the Director never loses track of a play.",
    });
    expect(buckets.how).not.toContain("Director");
    expect(buckets.how).not.toContain("gate decision");
  });

  test("an empty ## WHY section yields an empty why bucket, not a crash", () => {
    const content = `---
type: Surface
prefLabel: "No Why Fixture"
plane: Product
context: board
status: stub
confidence: medium
proposed_by: scanner
source_evidence:
  - fixture.md
---

## WHAT
What it does. A surface with no WHY.

## HOW
- Already shipped.`;

    expect(() => extractCatalogStoryBuckets(content)).not.toThrow();
    const buckets = extractCatalogStoryBuckets(content);
    expect(buckets.why).toBe("");
    expect(buckets.when).toBe("");
  });

  test("renders the §5b canonical card types natively (no alias needed)", () => {
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        // Entity with typed links → hub (the card at the centre, links radiating out).
        productCard({
          body: `## WHAT
The Play is the central record.

## HOW
- It contains a [[Component - Move]] and rides the [[Pattern - Production Ladder]].`,
          fileStem: "Entity - Play",
          links: {
            contains: ["[[Component - Move]]"],
            operates_on: ["[[Pattern - Production Ladder]]"],
          },
          prefLabel: "Play",
          type: "Entity",
        }),
        productCard({
          body: `## WHAT
_Stub —_ A Move is a step inside an [[Entity - Play]].`,
          fileStem: "Component - Move",
          prefLabel: "Move",
          type: "Component",
        }),
        // Pattern with a flow → lifecycle (the named arc drives the flow diagram).
        productCard({
          body: `## WHAT
The Production Ladder is the named arc.

## HOW
- Stages advance.`,
          fileStem: "Pattern - Production Ladder",
          flow: ["Designed", "Sourced", "Proven"],
          prefLabel: "Production Ladder",
          type: "Pattern",
        }),
        // Mechanism with a flow → lifecycle.
        productCard({
          body: `## WHAT
The Director Gate decides advancement.

## HOW
- Approve or bounce.`,
          fileStem: "Mechanism - Director Gate",
          flow: ["Pending", "Approved"],
          prefLabel: "Director Gate",
          type: "Mechanism",
        }),
        // Mechanism without a flow but with links → hub.
        productCard({
          body: `## WHAT
The Validators run checks.

## HOW
- They read the [[Entity - Play]].`,
          fileStem: "Mechanism - Validators",
          links: { operates_on: ["[[Entity - Play]]"] },
          prefLabel: "Validators",
          type: "Mechanism",
        }),
        // Pattern without a flow falls through to a hub (no stages ⇒ no arc).
        productCard({
          body: `## WHAT
The Coverage Map has no ordered stages.

## HOW
- It indexes the [[Entity - Play]].`,
          fileStem: "Pattern - Coverage Map",
          links: { related_to: ["[[Entity - Play]]"] },
          prefLabel: "Coverage Map",
          type: "Pattern",
        }),
        // Legacy product-word still draws via the (interim) DIAGRAM_TYPE_ALIASES.
        productCard({
          body: `## WHAT
Designed is the first stage.

## HOW
- It precedes Sourced for the [[Entity - Play]].`,
          fileStem: "Stage - Designed",
          links: { related_to: ["[[Entity - Play]]"] },
          prefLabel: "Designed",
          type: "Stage",
        }),
      ],
      libraryRoot,
    });

    const byId = (id: string) => catalog.cards.find((card) => card.id === id);
    const play = byId("Entity - Play");
    expect(play?.diagram?.kind).toBe("hub");
    expect(play?.diagram?.connectors?.length).toBeGreaterThan(0);
    expect(byId("Pattern - Production Ladder")?.diagram).toEqual({
      flow: ["Designed", "Sourced", "Proven"],
      kind: "lifecycle",
    });
    expect(byId("Mechanism - Director Gate")?.diagram).toEqual({
      flow: ["Pending", "Approved"],
      kind: "lifecycle",
    });
    expect(byId("Mechanism - Validators")?.diagram?.kind).toBe("hub");
    // A flow-less Pattern has no ordered stages, so it falls through to a hub.
    expect(byId("Pattern - Coverage Map")?.diagram?.kind).toBe("hub");
    // Regression: the interim alias still routes a legacy product-word to a hub.
    expect(byId("Stage - Designed")?.diagram?.kind).toBe("hub");
  });

  test("passes story lints for the board lead and recursive piece diagrams", () => {
    expect(lintProductCatalogStories(boardCatalog())).toEqual([]);
  });

  test("selects a keystone card over a pillar card as the context lead", () => {
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        productCard({
          altitude: "keystone",
          body: `## WHAT
What it does. Board Keystone frames the board story.

## HOW
It names [[Pillar - Board]] but intentionally leaves Stage out.`,
          fileStem: "Concept - Board Keystone",
          prefLabel: "Board Keystone",
          type: "Concept",
        }),
        productCard({
          altitude: "pillar",
          body: `## WHAT
What it does. The Work Board coordinates the studio.

## HOW
It names [[Concept - Board Keystone]] and [[Value - Stage]].`,
          fileStem: "Pillar - Board",
          prefLabel: "Work Board",
          type: "Pillar",
        }),
        productCard({
          altitude: "value",
          body: `## WHAT
_Stub —_ Stage is a board value.`,
          fileStem: "Value - Stage",
          prefLabel: "Stage",
          type: "Value",
        }),
      ],
      libraryRoot,
    });

    expect(lintProductCatalogStories(catalog)).toEqual([
      {
        cardId: "Value - Stage",
        context: "board",
        leadCardId: "Concept - Board Keystone",
        message:
          'board / Board Keystone: orphan card "Value - Stage" is not linked from the lead how-it-does-it story',
        rule: "no-orphans",
      },
    ]);
  });

  test("ranks context above capability and below component for context leads", () => {
    const contextBeatsCapability = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        productCard({
          altitude: "context",
          body: `## WHAT
What it does. Board Frame supplies the context-level story.

## HOW
It does not name the capability.`,
          fileStem: "Context - Board Frame",
          prefLabel: "Board Frame",
          type: "Context",
        }),
        productCard({
          altitude: "capability",
          body: `## WHAT
What it does. Stage Capability can narrate the frame.

## HOW
It names [[Context - Board Frame]].`,
          fileStem: "Capability - Stage Capability",
          prefLabel: "Stage Capability",
          type: "Capability",
        }),
      ],
      libraryRoot,
    });

    expect(lintProductCatalogStories(contextBeatsCapability)).toEqual([
      {
        cardId: "Capability - Stage Capability",
        context: "board",
        leadCardId: "Context - Board Frame",
        message:
          'board / Board Frame: orphan card "Capability - Stage Capability" is not linked from the lead how-it-does-it story',
        rule: "no-orphans",
      },
    ]);

    const componentBeatsContext = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        productCard({
          altitude: "component",
          body: `## WHAT
What it does. Board Component supplies the component-level story.

## HOW
It names [[Context - Board Frame]] but not the capability.`,
          fileStem: "Component - Board Component",
          prefLabel: "Board Component",
          type: "Component",
        }),
        productCard({
          altitude: "context",
          body: `## WHAT
What it does. Board Frame can narrate both cards.

## HOW
It names [[Component - Board Component]] and [[Capability - Stage Capability]].`,
          fileStem: "Context - Board Frame",
          prefLabel: "Board Frame",
          type: "Context",
        }),
        productCard({
          altitude: "capability",
          body: `## WHAT
_Stub —_ Stage Capability is a lower-altitude capability.`,
          fileStem: "Capability - Stage Capability",
          prefLabel: "Stage Capability",
          type: "Capability",
        }),
      ],
      libraryRoot,
    });

    expect(lintProductCatalogStories(componentBeatsContext)).toEqual([
      {
        cardId: "Capability - Stage Capability",
        context: "board",
        leadCardId: "Component - Board Component",
        message:
          'board / Board Component: orphan card "Capability - Stage Capability" is not linked from the lead how-it-does-it story',
        rule: "no-orphans",
      },
    ]);
  });

  test("flags defined context cards that are not linked from the lead how story", () => {
    const violations = lintProductCatalogStories(
      boardCatalog([
        productCard({
          body: `## WHAT
_Stub —_ Status is not referenced by the Work Board story.`,
          fileStem: "Value - Status",
          prefLabel: "Status",
          type: "Value",
        }),
      ]),
    );

    expect(formatProductCardStoryLint(violations)).toContain(
      'orphan card "Value - Status" is not linked from the lead how-it-does-it story',
    );
  });

  test("flags link/story parity drift", () => {
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        productCard({
          altitude: "pillar",
          body: `## WHAT
What it does. The Work Board coordinates the studio.

How it does it. It links only to [[Stage]].`,
          fileStem: "Aggregate - Board",
          links: {
            related_to: ["[[Value - Status]]"],
          },
          prefLabel: "Work Board",
          type: "Aggregate",
        }),
        productCard({
          body: `## WHAT
_Stub —_ Status is a board value.`,
          fileStem: "Value - Status",
          prefLabel: "Status",
          type: "Value",
        }),
        productCard({
          body: `## WHAT
_Stub —_ Stage is a board value.`,
          fileStem: "Value - Stage",
          prefLabel: "Stage",
          type: "Value",
        }),
      ],
      libraryRoot,
    });

    const formatted = formatProductCardStoryLint(lintProductCatalogStories(catalog));

    expect(formatted).toContain('diagram connector "Status" is missing');
    expect(formatted).toContain('story noun "Value - Stage" is missing from the diagram');
  });

  test("relegates: excuses a deep internal from the lead story (no orphan, no parity)", () => {
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        productCard({
          altitude: "pillar",
          body: `## WHAT
What it does. The Work Board coordinates the studio.

How it does it. It narrates [[Stage]] and relegates the rest.`,
          fileStem: "Aggregate - Board",
          links: {
            related_to: ["[[Value - Stage]]"],
            relegates: ["[[Value - Status]]"],
          },
          prefLabel: "Work Board",
          type: "Aggregate",
        }),
        productCard({
          body: `## WHAT
_Stub —_ Stage is a board value.`,
          fileStem: "Value - Stage",
          prefLabel: "Stage",
          type: "Value",
        }),
        productCard({
          body: `## WHAT
_Stub —_ Status is a board value the lead relegates rather than narrates.`,
          fileStem: "Value - Status",
          prefLabel: "Status",
          type: "Value",
        }),
      ],
      libraryRoot,
    });

    // Stage is narrated + linked; Status is relegated. Neither is an orphan, and
    // the relegated connector is not required to appear in the story.
    expect(lintProductCatalogStories(catalog)).toEqual([]);
  });

  test("without relegates the same deep internal is flagged as an orphan", () => {
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        productCard({
          altitude: "pillar",
          body: `## WHAT
What it does. The Work Board coordinates the studio.

How it does it. It narrates [[Stage]] only.`,
          fileStem: "Aggregate - Board",
          links: {
            related_to: ["[[Value - Stage]]"],
          },
          prefLabel: "Work Board",
          type: "Aggregate",
        }),
        productCard({
          body: `## WHAT
_Stub —_ Stage is a board value.`,
          fileStem: "Value - Stage",
          prefLabel: "Stage",
          type: "Value",
        }),
        productCard({
          body: `## WHAT
_Stub —_ Status is a board value.`,
          fileStem: "Value - Status",
          prefLabel: "Status",
          type: "Value",
        }),
      ],
      libraryRoot,
    });

    expect(formatProductCardStoryLint(lintProductCatalogStories(catalog))).toContain(
      'orphan card "Value - Status" is not linked from the lead how-it-does-it story',
    );
  });

  test("surfaces retired Product-card connectors without deriving a diagram", () => {
    const catalog = buildLibraryCatalog({
      catalogSchema: PRODUCT_CARD_SCHEMA_VERSION,
      files: [
        productCard({
          altitude: "pillar",
          body: `## WHAT
What it does. The Work Board coordinates the studio.

How it does it. It links to [[Stage]].`,
          connectors: ["moves each play through -> Stage"],
          fileStem: "Aggregate - Board",
          prefLabel: "Work Board",
          type: "Aggregate",
        }),
        productCard({
          body: `## WHAT
_Stub —_ Stage is a board value.`,
          fileStem: "Value - Stage",
          prefLabel: "Stage",
          type: "Value",
        }),
      ],
      libraryRoot,
    });

    const lead = catalog.cards.find((card) => card.id === "Aggregate - Board");
    expect(lead?.connectors).toBeUndefined();
    expect(lead?.diagram).toBeUndefined();
    expect(catalog.meta.metadataIssues).toContain(
      "Retired Product-card field connectors in board/Aggregate - Board.md; migrate to links.",
    );
  });
});
