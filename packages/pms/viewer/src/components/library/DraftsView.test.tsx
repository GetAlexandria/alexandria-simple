import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DraftsView } from "./DraftsView";
import { samplePartialLibraryCatalog } from "./sample-catalog";
import type { LibraryCatalog, LibraryCatalogCard } from "./types";

function fixtureCard(): LibraryCatalogCard {
  const card = samplePartialLibraryCatalog.cards[0];
  if (card == null) {
    throw new Error("sample catalog has no first card");
  }
  return card;
}

function draftCatalog(options: {
  confirmed?: boolean;
  invalid?: boolean;
  unresolved?: boolean;
}): LibraryCatalog {
  const card = fixtureCard();
  return {
    ...samplePartialLibraryCatalog,
    cards: samplePartialLibraryCatalog.cards.map((candidate, index) =>
      index === 0
        ? {
            ...candidate,
            draftTrail: [
              {
                agendaItemId: "thread:pms-drafts:surface-library",
                answerEventId: "answer:pms-drafts:surface-library",
                cardPath: candidate.path ?? "product/surfaces/Surface - Library.md",
                fields: ["prefLabel", "status"],
                patchId: "fixture-draft-surface-library",
                relationships: ["related_to"],
              },
            ],
            prefLabel: "Draft Library",
            status: "confirmed",
          }
        : candidate,
    ),
    draftOverlay: {
      appliedPatchCount: 1,
      appliedUpdateCount: 1,
      invalidPatches:
        options.invalid === true
          ? [
              {
                patchIndex: 2,
                reason: "cardUpdates[0].set.altitude is not allowed.",
              },
            ]
          : [],
      patchLogPath: "studio/drafts/playmaker-studio/patches.json",
      rulings: [],
      sectionConfirmations:
        options.confirmed === true
          ? [
              {
                answerEventId: "answer:pms-drafts:surface-library",
                cards: [card.prefLabel],
                context: card.context,
                eventId: "event-section-confirmed",
                plane: card.plane,
                playRunId: "run-pms-drafts",
                prefLabel: "Director-confirmed Library Surface",
                summary: "The section summary came from the director-confirmed event.",
                unknowns: [],
              },
            ]
          : [],
      unresolvedUpdates:
        options.unresolved === true
          ? [
              {
                agendaItemId: "thread:pms-drafts:missing-card",
                answerEventId: "answer:pms-drafts:missing-card",
                cardPath: "catalog/Missing - Front Desk.md",
                patchId: "fixture-draft-missing-card",
                reason: "Card path does not resolve against the Back library.",
              },
            ]
          : [],
    },
  };
}

function rulingCatalog(options?: { keystone?: boolean; mapping?: boolean }): LibraryCatalog {
  const containerMapping =
    options?.mapping === true
      ? [
          {
            basis: "The existing library shelf remains the stable route.",
            disposition: "keep" as const,
            from: "library",
          },
          {
            basis: "Search Space becomes Frame Rulings after the director's ruling.",
            disposition: "rename" as const,
            from: "search-space",
            to: "frame-rulings",
          },
          {
            basis: "Discovery folds into Library because the distinction was only provisional.",
            disposition: "merge" as const,
            from: "discovery",
            to: "library",
          },
          {
            basis: "Loose notes are useful evidence, not a top-level container.",
            disposition: "demote" as const,
            from: "loose-notes",
            to: "library",
          },
          {
            basis: "Open Questions stays held until the next walk resolves its boundary.",
            disposition: "hold" as const,
            from: "open-questions",
          },
        ]
      : [];

  return {
    ...samplePartialLibraryCatalog,
    draftOverlay: {
      appliedPatchCount: 0,
      appliedUpdateCount: 0,
      invalidPatches: [],
      patchLogPath: "studio/drafts/playmaker-studio/patches.json",
      rulings: [
        {
          agendaItemId: "thread:frame-search-space",
          answerEventId: "answer:frame-search-space",
          cardUpdateCount: 0,
          containerMapping,
          ...(options?.keystone === true
            ? {
                keystoneDraft: {
                  body: "## WHAT\n\nThe proposed index card anchors the frame ruling.",
                  context: "library-index",
                  plane: "product",
                  prefLabel: "Frame Ruling Index",
                  status: "stub",
                },
              }
            : {}),
          patchId: "patch-thread:frame-search-space",
          rulingExcerpt:
            "Director ruling: collapse the eight provisional containers into five named frame shelves.",
        },
      ],
      sectionConfirmations: [],
      unresolvedUpdates: [],
    },
  };
}

function confirmationOnlyCatalog(): LibraryCatalog {
  return {
    ...samplePartialLibraryCatalog,
    draftOverlay: {
      appliedPatchCount: 0,
      appliedUpdateCount: 0,
      invalidPatches: [],
      patchLogPath: "studio/drafts/playmaker-studio/patches.json",
      rulings: [],
      sectionConfirmations: [
        {
          answerEventId: "answer:frame-search-space",
          cards: [],
          context: "catalog",
          eventId: "event-section-confirmed",
          plane: "product",
          playRunId: "run-frame-search-space",
          prefLabel: "Frame-confirmed Catalog",
          summary: "The director closed this section before any card diff landed.",
          unknowns: [],
        },
      ],
      unresolvedUpdates: [],
    },
  };
}

describe("DraftsView", () => {
  test("renders the exact empty state with no draft cards", () => {
    const markup = renderToStaticMarkup(
      React.createElement(DraftsView, { catalog: samplePartialLibraryCatalog }),
    );

    expect(markup).toContain('data-testid="drafts-view"');
    expect(markup).toContain(
      "No drafts yet — run a Front-of-House walk to start Raven&#x27;s draft.",
    );
    expect(markup).not.toContain('data-testid="drafts-card-');
    expect(markup).not.toContain('data-testid="empty-library-confirm-gate"');
  });

  test("can name the expected draft patch log in the empty state", () => {
    const markup = renderToStaticMarkup(
      React.createElement(DraftsView, {
        catalog: samplePartialLibraryCatalog,
        emptyStatePatchLogPath: "studio/drafts/playmaker-studio/patches.json",
      }),
    );

    expect(markup).toContain("Expected draft log:");
    expect(markup).toContain("studio/drafts/playmaker-studio/patches.json");
  });

  test("renders drafted cards under the director-confirmed section header", () => {
    const markup = renderToStaticMarkup(
      React.createElement(DraftsView, { catalog: draftCatalog({ confirmed: true }) }),
    );

    expect(markup).toContain("Director-confirmed Library Surface");
    expect(markup).toContain("The section summary came from the director-confirmed event.");
    expect(markup).toContain("Draft Library");
    expect(markup).toContain("Draft change");
    expect(markup).toContain("fixture-draft-surface-library");
    expect(markup).toContain("related to");
  });

  test("renders unconfirmed drafted sections without inventing a summary", () => {
    const markup = renderToStaticMarkup(
      React.createElement(DraftsView, { catalog: draftCatalog({ confirmed: false }) }),
    );

    expect(markup).toContain("Draft Library");
    expect(markup).not.toContain("Director-confirmed Library Surface");
    expect(markup).not.toContain("The section summary came from the director-confirmed event.");
  });

  test("keeps valid draft cards visible when diagnostics are present", () => {
    const markup = renderToStaticMarkup(
      React.createElement(DraftsView, {
        catalog: draftCatalog({ confirmed: true, invalid: true, unresolved: true }),
      }),
    );

    expect(markup).toContain("Draft Library");
    expect(markup).toContain('data-testid="draft-overlay-invalid"');
    expect(markup).toContain("Patch 2");
    expect(markup).toContain("cardUpdates[0].set.altitude is not allowed.");
    expect(markup).toContain('data-testid="draft-overlay-unresolved"');
    expect(markup).toContain("catalog/Missing - Front Desk.md");
  });

  test("renders zero-card ruling entries without showing the empty state", () => {
    const markup = renderToStaticMarkup(
      React.createElement(DraftsView, { catalog: rulingCatalog() }),
    );

    expect(markup).toContain('data-testid="drafts-rulings"');
    expect(markup).toContain("Ruling");
    expect(markup).toContain("Agenda item");
    expect(markup).toContain("thread:frame-search-space");
    expect(markup).toContain("Resolved");
    expect(markup).toContain(
      "Director ruling: collapse the eight provisional containers into five named frame shelves.",
    );
    expect(markup).not.toContain("No drafts yet");
  });

  test("renders section confirmations without drafted cards", () => {
    const markup = renderToStaticMarkup(
      React.createElement(DraftsView, { catalog: confirmationOnlyCatalog() }),
    );

    expect(markup).toContain("Frame-confirmed Catalog");
    expect(markup).toContain("The director closed this section before any card diff landed.");
    expect(markup).not.toContain('data-testid="drafts-card-');
    expect(markup).not.toContain("No drafts yet");
  });

  test("renders map deltas and keystone drafts with product copy", () => {
    const markup = renderToStaticMarkup(
      React.createElement(DraftsView, {
        catalog: rulingCatalog({ keystone: true, mapping: true }),
      }),
    );

    for (const disposition of ["Keep", "Rename", "Merge", "Demote", "Hold"]) {
      expect(markup).toContain(disposition);
    }
    expect(markup).toContain("The existing library shelf remains the stable route.");
    expect(markup).toContain("Search Space becomes Frame Rulings");
    expect(markup).toContain("Map ruling");
    expect(markup).toContain("Proposed index card");
    expect(markup).toContain("Frame Ruling Index");
    expect(markup).toContain("The proposed index card anchors the frame ruling.");
    expect(markup).not.toContain("containerMapping");
    expect(markup).not.toContain("keystoneDraft");
    expect(markup).not.toContain("cardUpdates");
  });
});
