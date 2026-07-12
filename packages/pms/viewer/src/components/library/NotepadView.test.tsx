import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NotepadView } from "./NotepadView";
import {
  buildNotepadModel,
  notepadBadgeCountForCatalog,
  type NotepadThreadMoveGroup,
} from "./notepad-view-model";
import {
  sampleDurableNotepadCatalog,
  sampleEmptyLedgerNotepadCatalog,
} from "./notepad-test-fixtures";
import type { LibraryCatalog } from "./types";

function occurrenceCount(markup: string, text: string): number {
  return markup.split(text).length - 1;
}

function groupedThreadIds(groups: readonly NotepadThreadMoveGroup[]): string[] {
  return groups.flatMap((moveGroup) =>
    moveGroup.kindGroups.flatMap((kindGroup) => kindGroup.threads.map((thread) => thread.id)),
  );
}

function resolvedThreadIds(catalog: LibraryCatalog): string[] {
  const model = buildNotepadModel(catalog);
  return [
    ...model.resolvedGroups.flatMap((group) => groupedThreadIds(group.groups)),
    ...model.misses.map((thread) => thread.id),
  ];
}

describe("Notepad model", () => {
  test("counts durable lenses from authored threads only", () => {
    const model = buildNotepadModel(sampleDurableNotepadCatalog);

    expect(model.counts.generated).toBe(7);
    expect(model.counts.resolved).toBe(5);
    expect(model.counts.open).toBe(2);
    expect(model.counts.misses).toBe(1);
    expect(
      Object.fromEntries(model.resolvedGroups.map((group) => [group.state, group.count])),
    ).toEqual({
      "deferred-residual": 1,
      "director-ruled": 1,
      "settled-by-cascade": 1,
      "settled-by-triage": 1,
    });
    expect(model.misses.map((thread) => thread.resolution.state)).toEqual(["invalidated"]);
    expect(model.availableLenses).toEqual(["generated", "resolved", "open"]);
    expect(groupedThreadIds(model.generatedGroups)).not.toContain(
      "thread:notepad:derived-excluded",
    );
  });

  test("keeps Generated stable when resolution metadata is absent", () => {
    const durable = buildNotepadModel(sampleDurableNotepadCatalog);
    const emptyLedger = buildNotepadModel(sampleEmptyLedgerNotepadCatalog);

    expect(groupedThreadIds(durable.generatedGroups)).toEqual(
      groupedThreadIds(emptyLedger.generatedGroups),
    );
    expect(emptyLedger.counts).toMatchObject({
      generated: 7,
      misses: 0,
      open: 7,
      resolved: 0,
    });
    expect(emptyLedger.availableLenses).toEqual(["generated"]);
  });

  test("ignores relaunch-like run-scoped catalog changes for badge and resolved rows", () => {
    const relaunchedCatalog: LibraryCatalog = {
      ...sampleDurableNotepadCatalog,
      draftOverlay: {
        appliedPatchCount: 99,
        appliedUpdateCount: 99,
        invalidPatches: [],
        patchLogPath: "studio/drafts/relaunched/patches.json",
        rulings: [],
        sectionConfirmations: [],
        unresolvedUpdates: [],
      },
      gate: {
        approved: false,
        bundlePath: "docs/alexandria/sweeps/relaunched",
        contentHash: "changed-run-scope-only",
        dirty: true,
        libraryVersion: 2,
        manifestPath: "docs/alexandria/sweeps/relaunched/manifest.json",
        product: "alexandria",
        readyToConfirm: false,
        status: "not_ready",
      },
    };

    expect(notepadBadgeCountForCatalog(relaunchedCatalog)).toBe(2);
    expect(resolvedThreadIds(relaunchedCatalog)).toEqual(
      resolvedThreadIds(sampleDurableNotepadCatalog),
    );
  });
});

describe("NotepadView", () => {
  test("renders exact resolution labels with distinct state markers", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NotepadView, {
        catalog: sampleDurableNotepadCatalog,
        initialLens: "resolved",
      }),
    );

    expect(markup).toContain("Ruled by the director");
    expect(markup).toContain("Settled by the frame ruling");
    expect(markup).toContain("Settled by triage");
    expect(markup).toContain("Deferred to residuals");
    expect(markup).toContain('data-testid="notepad-resolved-state-settled-by-cascade"');
    expect(markup).toContain('data-testid="notepad-resolved-state-settled-by-triage"');
    expect(markup).toContain('data-resolution-marker="machine"');
    expect(markup).toContain('data-resolution-marker="director"');
  });

  test("keeps invalidated threads in Misses only inside the Resolved lens", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NotepadView, {
        catalog: sampleDurableNotepadCatalog,
        initialLens: "resolved",
      }),
    );

    expect(markup).not.toContain('data-testid="notepad-resolved-state-invalidated"');
    expect(markup).toContain('data-testid="notepad-misses-rollup"');
    expect(markup).toContain('data-testid="notepad-miss-thread-thread-notepad-invalidated-miss"');
    expect(occurrenceCount(markup, "Was the old agenda reset path still active?")).toBe(1);
  });

  test("renders provenance links for resolved threads", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NotepadView, {
        catalog: sampleDurableNotepadCatalog,
        initialLens: "resolved",
      }),
    );

    expect(markup).toContain("The Director owns rulings that change the library frame.");
    expect(markup).toContain("event:director-owner-ruled");
    expect(markup).toContain("event:patch:director-owner");
    expect(markup).toContain("patch-director-owner");
    expect(markup).toContain('href="#event-director-owner-ruled"');
    expect(markup).toContain('href="#patch-director-owner"');
    expect(markup).toContain(
      'id="event-director-owner-ruled">The Director owns rulings that change the library frame.',
    );
    expect(markup).toContain('id="event-patch-director-owner">event:patch:director-owner');
    expect(markup).toContain('id="patch-director-owner">patch-director-owner');
  });

  test("renders every authored thread in Generated and excludes derived rows", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NotepadView, { catalog: sampleDurableNotepadCatalog }),
    );

    expect(markup).toContain('data-testid="notepad-lens-panel-generated"');
    expect(markup).toContain("Should the Director own Notepad rulings?");
    expect(markup).toContain("Should living updates regrow this Notepad thread?");
    expect(markup).toContain("Should the Notepad root split by product bundle?");
    expect(markup).not.toContain("Derived fill-readiness question should stay out");
  });

  test("shows only the Generated lens for an empty ledger", () => {
    const markup = renderToStaticMarkup(
      React.createElement(NotepadView, { catalog: sampleEmptyLedgerNotepadCatalog }),
    );

    expect(markup).toContain('data-testid="notepad-lens-button-generated"');
    expect(markup).not.toContain('data-testid="notepad-lens-button-resolved"');
    expect(markup).not.toContain('data-testid="notepad-lens-button-open"');
    expect(markup).toContain('data-testid="notepad-count-open"');
    expect(markup).toContain(">7</div>");
  });

  test("does not render mutation controls or spec copy", () => {
    const fallbackCatalog: LibraryCatalog = {
      ...sampleDurableNotepadCatalog,
      threads: (sampleDurableNotepadCatalog.threads ?? []).map((thread) =>
        thread.id === "thread:notepad:director-owner"
          ? {
              ...thread,
              resolution: {
                resolvingEventId: "event:director-owner-ruled",
                state: "director-ruled",
              },
              sourceEvidence: [],
            }
          : thread,
      ),
    };
    const emptyGeneratedCatalog: LibraryCatalog = {
      ...sampleDurableNotepadCatalog,
      threads: [],
    };
    const fullyBurnedDownCatalog: LibraryCatalog = {
      ...sampleEmptyLedgerNotepadCatalog,
      threads: (sampleEmptyLedgerNotepadCatalog.threads ?? []).map((thread) =>
        thread.source === "authored"
          ? {
              ...thread,
              resolution: {
                resolvingEventId: `event:fully-resolved:${thread.id}`,
                state: "director-ruled",
              },
              resolvingEventId: `event:fully-resolved:${thread.id}`,
            }
          : thread,
      ),
    };
    const markup = renderToStaticMarkup(
      React.createElement(NotepadView, {
        catalog: sampleDurableNotepadCatalog,
        initialLens: "resolved",
      }),
    );
    const fallbackMarkup = renderToStaticMarkup(
      React.createElement(NotepadView, {
        catalog: fallbackCatalog,
        initialLens: "resolved",
      }),
    );
    const emptyGeneratedMarkup = renderToStaticMarkup(
      React.createElement(NotepadView, { catalog: emptyGeneratedCatalog }),
    );
    const openMarkup = renderToStaticMarkup(
      React.createElement(NotepadView, {
        catalog: fullyBurnedDownCatalog,
        initialLens: "open",
      }),
    );
    const allRenderedMarkup = [markup, fallbackMarkup, emptyGeneratedMarkup, openMarkup].join("\n");

    expect(fallbackMarkup).toContain("No source evidence.");
    expect(fallbackMarkup).toContain("No ruling text available.");
    expect(emptyGeneratedMarkup).toContain("No generated threads.");
    expect(openMarkup).toContain("No open threads.");
    expect(allRenderedMarkup).not.toContain(">Resolve<");
    expect(allRenderedMarkup).not.toContain(">Save<");
    expect(allRenderedMarkup).not.toContain(">Apply<");
    expect(allRenderedMarkup).not.toContain("Generated minus Resolved");
    expect(allRenderedMarkup).not.toContain("immutable baseline");
    expect(allRenderedMarkup).not.toContain("acceptance criteria");
    expect(allRenderedMarkup.toLowerCase()).not.toContain("projected");
  });
});
