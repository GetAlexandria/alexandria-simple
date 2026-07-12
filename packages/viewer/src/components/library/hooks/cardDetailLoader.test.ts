import { describe, expect, test } from "bun:test";
import * as Effect from "effect/Effect";
import type { LibraryCardRef, ViewerRuntimeClient } from "../../../app/runtime/client";
import { ViewerHttpError } from "../../../app/runtime/errors";
import type { LibraryCardDetail, LibraryGraphCard } from "../../../app/runtime/schemas";
import { type CardDetailLoaderSink, createCardDetailLoader } from "./cardDetailLoader";

interface Deferred<T> {
  promise: Promise<T>;
  resolve(value: T): void;
  reject(reason?: unknown): void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, reject, resolve };
}

function cardRef(id: string): LibraryGraphCard {
  return { id, outbound: [], subfolder: "agents", territory: "product", title: id, type: "card" };
}

function cardDetail(id: string): LibraryCardDetail {
  return { ...cardRef(id), content: `content for ${id}` };
}

// A runtime client whose card fetch never settles on its own: each call exposes
// a Deferred the test resolves/rejects to control timing precisely, and records
// the full card ref so tests can assert the root/overlay forwarded to it.
function makeFakeClient(): {
  calls: Array<{ deferred: Deferred<LibraryCardDetail>; id: string; ref: LibraryCardRef }>;
  client: ViewerRuntimeClient;
} {
  const calls: Array<{ deferred: Deferred<LibraryCardDetail>; id: string; ref: LibraryCardRef }> =
    [];
  const client = {
    getLibraryCard: (ref: LibraryCardRef) => {
      const pending = deferred<LibraryCardDetail>();
      calls.push({ deferred: pending, id: ref.id, ref });
      return Effect.tryPromise({ catch: (cause) => cause, try: () => pending.promise });
    },
  } as unknown as ViewerRuntimeClient;
  return { calls, client };
}

function recordingSink(): {
  errors: string[];
  loaded: LibraryCardDetail[];
  sink: CardDetailLoaderSink;
  starts: () => number;
} {
  const loaded: LibraryCardDetail[] = [];
  const errors: string[] = [];
  let starts = 0;
  const sink: CardDetailLoaderSink = {
    onError: (message) => {
      errors.push(message);
    },
    onLoaded: (detail) => {
      loaded.push(detail);
    },
    onStart: () => {
      starts += 1;
    },
  };
  return { errors, loaded, sink, starts: () => starts };
}

describe("createCardDetailLoader", () => {
  test("applies a load that resolves while it is still the active selection", async () => {
    const { calls, client } = makeFakeClient();
    const { loaded, sink, starts } = recordingSink();
    const loader = createCardDetailLoader(client, sink);

    const load = loader.load(cardRef("first"));
    calls[0].deferred.resolve(cardDetail("first"));
    await load;

    expect(loaded.map((detail) => detail.id)).toEqual(["first"]);
    expect(starts()).toBe(1);
  });

  test("drops a stale load and applies only the latest when the card changes", async () => {
    const { calls, client } = makeFakeClient();
    const { loaded, sink } = recordingSink();
    const loader = createCardDetailLoader(client, sink);

    // Select "first" (e.g. a Retry), then switch to "second" before "first"
    // resolves. The shared abort means the late "first" result must be discarded.
    const loadFirst = loader.load(cardRef("first"));
    const loadSecond = loader.load(cardRef("second"));

    calls[0].deferred.resolve(cardDetail("first"));
    calls[1].deferred.resolve(cardDetail("second"));

    await loadFirst;
    await loadSecond;

    expect(loaded.map((detail) => detail.id)).toEqual(["second"]);
  });

  test("drops a load that is cancelled before it resolves", async () => {
    const { calls, client } = makeFakeClient();
    const { errors, loaded, sink } = recordingSink();
    const loader = createCardDetailLoader(client, sink);

    const load = loader.load(cardRef("first"));
    loader.cancel();
    calls[0].deferred.resolve(cardDetail("first"));
    await load;

    expect(loaded).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("reports safe error copy without leaking runtime internals", async () => {
    const { calls, client } = makeFakeClient();
    const { errors, loaded, sink } = recordingSink();
    const loader = createCardDetailLoader(client, sink);

    const load = loader.load(cardRef("first"));
    calls[0].deferred.reject(
      new ViewerHttpError(500, "Internal Server Error", '{"_tag":"ViewerHttpError"}'),
    );
    await load;

    expect(loaded).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0].length).toBeGreaterThan(0);
    expect(errors[0]).not.toContain("_tag");
    expect(errors[0]).not.toContain("ViewerHttpError");
  });

  test("forwards the root request's libraryRoot and draft overlay to getLibraryCard", async () => {
    const { calls, client } = makeFakeClient();
    const { sink } = recordingSink();
    const loader = createCardDetailLoader(client, sink, {
      draftPatchLog: "studio/drafts/compat-bundle/patches.json",
      libraryRoot: "docs/alexandria/library",
    });

    const load = loader.load(cardRef("first"));
    calls[0].deferred.resolve(cardDetail("first"));
    await load;

    expect(calls[0].ref).toEqual({
      draftPatchLog: "studio/drafts/compat-bundle/patches.json",
      id: "first",
      libraryRoot: "docs/alexandria/library",
      subfolder: "agents",
      territory: "product",
    });
  });

  test("omits libraryRoot and draftPatchLog when no root request is given", async () => {
    const { calls, client } = makeFakeClient();
    const { sink } = recordingSink();
    const loader = createCardDetailLoader(client, sink);

    const load = loader.load(cardRef("first"));
    calls[0].deferred.resolve(cardDetail("first"));
    await load;

    expect(calls[0].ref).toEqual({
      id: "first",
      subfolder: "agents",
      territory: "product",
    });
    expect(calls[0].ref.libraryRoot).toBeUndefined();
    expect(calls[0].ref.draftPatchLog).toBeUndefined();
  });
});
