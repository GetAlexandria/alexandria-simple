import { afterEach, describe, expect, test } from "bun:test";
import { Effect } from "effect";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { mapStatePathForWorkspacePath } from "../domain/paths.js";
import { NodeFileSystem } from "./filesystem.js";
import {
  MapStateFileError,
  MapStateValidationError,
  defaultMapState,
  readMapState,
  validateMapState,
  writeMapState,
  type MapState,
} from "./map-state.js";

const tempDirs = new Set<string>();

// realpathSync the mkdtemp dir: on macOS /var and /tmp are symlinks, and the
// filesystem effect's containment-adjacent path handling compares resolved
// paths. Linux CI masks this; realpath keeps the local run honest.
function makeWorkspacePath(): string {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "ax-map-state-")));
  tempDirs.add(dir);
  return join(dir, "docs/alexandria");
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

function runRead(workspacePath: string) {
  return Effect.runPromise(readMapState({ workspacePath }).pipe(Effect.provide(NodeFileSystem)));
}

function runWrite(state: MapState, workspacePath: string) {
  return Effect.runPromise(
    writeMapState({ state, workspacePath }).pipe(Effect.provide(NodeFileSystem)),
  );
}

const seedPath = join(import.meta.dir, "../../../..", "docs/alexandria/map/map-state.json");

// The plan §1.3 fixture shape — one domain, one context, a system and a
// project entity, a system position and a colleague landmark position —
// loaded from the checked-in seed so the seed is the single source of truth.
// Each call parses fresh, so tests that mutate the returned document stay
// independent.
function baseState(): Record<string, unknown> {
  return JSON.parse(readFileSync(seedPath, "utf8")) as Record<string, unknown>;
}

describe("validateMapState", () => {
  test("accepts the plan §1.3 fixture shape", () => {
    const result = validateMapState(baseState());
    expect(result).not.toBeInstanceOf(MapStateValidationError);
    const state = result as MapState;
    expect(state.domains[0]?.id).toBe("software");
    expect(state.entities.map((entity) => entity.id)).toEqual([
      "sys-raven-duty-loop",
      "prj-map-tab",
    ]);
    expect(state.positions).toHaveLength(2);
  });

  test("accepts an empty document", () => {
    const result = validateMapState(defaultMapState());
    expect(result).not.toBeInstanceOf(MapStateValidationError);
  });

  test("accepts a domain without an owner (unowned is a demand signal, not an error)", () => {
    const state = baseState();
    delete (state.domains as Record<string, unknown>[])[0]?.owner;
    expect(validateMapState(state)).not.toBeInstanceOf(MapStateValidationError);
  });

  test("accepts a system without colleague/cadence (standing human rhythms)", () => {
    const state = baseState();
    const system = (state.entities as Record<string, unknown>[])[0];
    delete system?.colleague;
    delete system?.cadence;
    expect(validateMapState(state)).not.toBeInstanceOf(MapStateValidationError);
  });

  test("rejects a non-object document", () => {
    expect(validateMapState([])).toBeInstanceOf(MapStateValidationError);
    expect(validateMapState("nope")).toBeInstanceOf(MapStateValidationError);
  });

  test("rejects unknown top-level fields and missing collections", () => {
    const withExtra = validateMapState({ ...baseState(), signals: [] });
    expect(withExtra).toBeInstanceOf(MapStateValidationError);
    expect((withExtra as MapStateValidationError).message).toContain("unknown fields");

    const withoutPositions: Record<string, unknown> = baseState();
    delete withoutPositions.positions;
    const missing = validateMapState(withoutPositions);
    expect(missing).toBeInstanceOf(MapStateValidationError);
    expect((missing as MapStateValidationError).message).toContain("missing fields");
  });

  test("rejects unknown fields on a domain", () => {
    const state = baseState();
    ((state.domains as Record<string, unknown>[])[0] as Record<string, unknown>).tint = "amber";
    const result = validateMapState(state);
    expect(result).toBeInstanceOf(MapStateValidationError);
    expect((result as MapStateValidationError).message).toContain("unknown fields");
  });

  test("rejects a bad domain half enum and a bad region", () => {
    const badHalf = baseState();
    ((badHalf.domains as Record<string, unknown>[])[0] as Record<string, unknown>).half = "left";
    expect(validateMapState(badHalf)).toBeInstanceOf(MapStateValidationError);

    const badRegion = baseState();
    ((badRegion.domains as Record<string, unknown>[])[0] as Record<string, unknown>).region = {
      center: [0.5, -3],
      radius: 2,
    };
    const result = validateMapState(badRegion);
    expect(result).toBeInstanceOf(MapStateValidationError);
    expect((result as MapStateValidationError).message).toContain("center");
  });

  test("rejects duplicate domain, context, and entity ids", () => {
    const dupDomain = baseState();
    (dupDomain.domains as unknown[]).push((baseState().domains as unknown[])[0]);
    expect((validateMapState(dupDomain) as MapStateValidationError).message).toContain(
      "duplicate domain id",
    );

    const dupContext = baseState();
    (dupContext.contexts as unknown[]).push((baseState().contexts as unknown[])[0]);
    expect((validateMapState(dupContext) as MapStateValidationError).message).toContain(
      "duplicate context id",
    );

    const dupEntity = baseState();
    (dupEntity.entities as unknown[]).push((baseState().entities as unknown[])[1]);
    expect((validateMapState(dupEntity) as MapStateValidationError).message).toContain(
      "duplicate entity id",
    );
  });

  test("rejects a context referencing an unknown domainId", () => {
    const state = baseState();
    ((state.contexts as Record<string, unknown>[])[0] as Record<string, unknown>).domainId =
      "marketing";
    const result = validateMapState(state);
    expect(result).toBeInstanceOf(MapStateValidationError);
    expect((result as MapStateValidationError).message).toContain("unknown domainId");
  });

  test("rejects an entity referencing an unknown contextId", () => {
    const state = baseState();
    ((state.entities as Record<string, unknown>[])[0] as Record<string, unknown>).contextId =
      "nowhere";
    const result = validateMapState(state);
    expect(result).toBeInstanceOf(MapStateValidationError);
    expect((result as MapStateValidationError).message).toContain("unknown contextId");
  });

  test("rejects a bad entity kind and a lifecycle from the wrong kind's vocabulary", () => {
    const badKind = baseState();
    ((badKind.entities as Record<string, unknown>[])[0] as Record<string, unknown>).kind = "quest";
    expect(validateMapState(badKind)).toBeInstanceOf(MapStateValidationError);

    // "planted" is a system lifecycle; a project must use active/completed.
    const badLifecycle = baseState();
    ((badLifecycle.entities as Record<string, unknown>[])[1] as Record<string, unknown>).lifecycle =
      "planted";
    const result = validateMapState(badLifecycle);
    expect(result).toBeInstanceOf(MapStateValidationError);
    expect((result as MapStateValidationError).message).toContain("lifecycle must be one of");
  });

  test("rejects colleague/cadence on a project entity", () => {
    const state = baseState();
    ((state.entities as Record<string, unknown>[])[1] as Record<string, unknown>).colleague =
      "raven";
    const result = validateMapState(state);
    expect(result).toBeInstanceOf(MapStateValidationError);
    expect((result as MapStateValidationError).message).toContain(
      "only allowed on system entities",
    );
  });

  test("rejects two positions on the same hex (one entity per hex)", () => {
    const state = baseState();
    (state.positions as unknown[]).push({
      q: 1,
      r: -1,
      entityType: "project",
      entityId: "prj-map-tab",
    });
    const result = validateMapState(state);
    expect(result).toBeInstanceOf(MapStateValidationError);
    expect((result as MapStateValidationError).message).toContain("one entity per hex");
  });

  test("rejects a position referencing an unknown entityId", () => {
    const state = baseState();
    (state.positions as unknown[]).push({
      q: 2,
      r: 2,
      entityType: "project",
      entityId: "prj-missing",
    });
    const result = validateMapState(state);
    expect(result).toBeInstanceOf(MapStateValidationError);
    expect((result as MapStateValidationError).message).toContain("unknown entityId");
  });

  test("rejects a position whose entityType does not match the entity's kind", () => {
    const state = baseState();
    (state.positions as unknown[]).push({
      q: 2,
      r: 2,
      entityType: "system",
      entityId: "prj-map-tab",
    });
    const result = validateMapState(state);
    expect(result).toBeInstanceOf(MapStateValidationError);
    expect((result as MapStateValidationError).message).toContain("does not match entity");
  });

  test("rejects two positions for the same entity", () => {
    const state = baseState();
    (state.positions as unknown[]).push({
      q: 3,
      r: 3,
      entityType: "system",
      entityId: "sys-raven-duty-loop",
    });
    const result = validateMapState(state);
    expect(result).toBeInstanceOf(MapStateValidationError);
    expect((result as MapStateValidationError).message).toContain("duplicate position for entity");
  });

  test("allows a landmark whose id coincides with an entity id (separate namespaces)", () => {
    const state = baseState();
    (state.positions as unknown[]).push({
      q: 5,
      r: 5,
      entityType: "landmark",
      entityId: "sys-raven-duty-loop",
    });
    expect(validateMapState(state)).not.toBeInstanceOf(MapStateValidationError);
  });

  test("rejects two positions for the same landmark", () => {
    const state = baseState();
    (state.positions as unknown[]).push({
      q: 5,
      r: 5,
      entityType: "landmark",
      entityId: "colleague:raven",
    });
    const result = validateMapState(state);
    expect(result).toBeInstanceOf(MapStateValidationError);
    expect((result as MapStateValidationError).message).toContain(
      "duplicate position for landmark",
    );
  });

  test("rejects non-integer hex coordinates", () => {
    const state = baseState();
    ((state.positions as Record<string, unknown>[])[0] as Record<string, unknown>).q = 1.5;
    const result = validateMapState(state);
    expect(result).toBeInstanceOf(MapStateValidationError);
    expect((result as MapStateValidationError).message).toContain("must be integers");
  });
});

describe("the repo seed document", () => {
  test("validates and survives a write semantically unchanged", async () => {
    const raw = readFileSync(seedPath, "utf8");
    const state = validateMapState(JSON.parse(raw));
    expect(state).not.toBeInstanceOf(MapStateValidationError);

    // Semantic equality only: positions change by hand (plan §1.3), so a
    // valid hand edit with different formatting must not redden this suite.
    // Byte-level write stability is pinned by the validate → write → read →
    // write round-trip test below.
    const workspacePath = makeWorkspacePath();
    await runWrite(state as MapState, workspacePath);
    const written = readFileSync(mapStatePathForWorkspacePath(workspacePath), "utf8");
    expect(JSON.parse(written)).toEqual(JSON.parse(raw));
  });
});

describe("readMapState / writeMapState", () => {
  test("returns a default empty state when the file is missing, without creating it", async () => {
    const workspacePath = makeWorkspacePath();
    const state = await runRead(workspacePath);
    expect(state).toEqual(defaultMapState());
    expect(existsSync(mapStatePathForWorkspacePath(workspacePath))).toBeFalse();
  });

  test("writes pretty-printed state atomically and reads it back, creating the map directory", async () => {
    const workspacePath = makeWorkspacePath();
    const state = validateMapState(baseState()) as MapState;
    await runWrite(state, workspacePath);

    const statePath = mapStatePathForWorkspacePath(workspacePath);
    const raw = readFileSync(statePath, "utf8");
    expect(raw.endsWith("\n")).toBeTrue();
    expect(raw).toBe(`${JSON.stringify(JSON.parse(raw), null, 2)}\n`);
    // Atomic temp-file+rename leaves no temp files behind in map/.
    expect(readdirSync(dirname(statePath))).toEqual(["map-state.json"]);

    const reread = await runRead(workspacePath);
    expect(reread).toEqual(state);
  });

  test("round-trips the seed document unchanged (validate → write → read → write)", async () => {
    const workspacePath = makeWorkspacePath();
    const state = validateMapState(baseState()) as MapState;
    await runWrite(state, workspacePath);
    const statePath = mapStatePathForWorkspacePath(workspacePath);
    const firstWrite = readFileSync(statePath, "utf8");

    const reread = await runRead(workspacePath);
    await runWrite(reread, workspacePath);
    expect(readFileSync(statePath, "utf8")).toBe(firstWrite);
  });

  test("fails the read effect with a MapStateFileError for corrupt JSON", async () => {
    const workspacePath = makeWorkspacePath();
    const state = validateMapState(baseState()) as MapState;
    await runWrite(state, workspacePath);
    const statePath = mapStatePathForWorkspacePath(workspacePath);
    writeFileSync(statePath, "{not json", "utf8");

    const result = await Effect.runPromise(
      readMapState({ workspacePath }).pipe(Effect.either, Effect.provide(NodeFileSystem)),
    );
    expect(result._tag).toBe("Left");
    expect(result._tag === "Left" && result.left instanceof MapStateFileError).toBeTrue();
  });

  test("fails the read effect with a MapStateFileError for a document that fails validation", async () => {
    const workspacePath = makeWorkspacePath();
    const state = validateMapState(baseState()) as MapState;
    await runWrite(state, workspacePath);
    const statePath = mapStatePathForWorkspacePath(workspacePath);
    const broken = baseState();
    ((broken.contexts as Record<string, unknown>[])[0] as Record<string, unknown>).domainId =
      "gone";
    writeFileSync(statePath, `${JSON.stringify(broken, null, 2)}\n`, "utf8");

    const result = await Effect.runPromise(
      readMapState({ workspacePath }).pipe(Effect.either, Effect.provide(NodeFileSystem)),
    );
    expect(result._tag).toBe("Left");
    expect(result._tag === "Left" && result.left instanceof MapStateFileError).toBeTrue();
    if (result._tag === "Left" && result.left instanceof MapStateFileError) {
      expect(result.left.message).toContain("unknown domainId");
    }
  });
});
