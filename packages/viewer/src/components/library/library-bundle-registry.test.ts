import { describe, expect, test } from "bun:test";
import {
  defaultLibraryBundle,
  libraryBundleById,
  libraryBundleRegistry,
  parseLibraryBundleRegistry,
  validateLibraryBundleRegistry,
} from "./library-bundle-registry";

const VALID_TWO_BUNDLE_REGISTRY = JSON.stringify({
  bundles: [
    {
      id: "alexandria-product",
      label: "Alexandria Product",
      libraryRoot: "docs/alexandria/library",
    },
    {
      draftPatchLog: "studio/drafts/second-bundle/patches.json",
      id: "second-bundle",
      label: "Second Bundle",
      libraryRoot: "docs/alexandria/sweeps/second-bundle",
    },
  ],
  schemaVersion: 1,
});

describe("parseLibraryBundleRegistry", () => {
  test("parses a valid single-bundle registry", () => {
    const result = parseLibraryBundleRegistry(
      JSON.stringify({
        bundles: [
          {
            id: "alexandria-product",
            label: "Alexandria Product",
            libraryRoot: "docs/alexandria/library",
          },
        ],
        schemaVersion: 1,
      }),
    );

    expect(result).toEqual({
      bundles: [
        {
          id: "alexandria-product",
          label: "Alexandria Product",
          libraryRoot: "docs/alexandria/library",
        },
      ],
      kind: "ok",
    });
  });

  test("parses a valid two-bundle registry (the selector-switch fixture)", () => {
    const result = parseLibraryBundleRegistry(VALID_TWO_BUNDLE_REGISTRY);

    expect(result.kind).toBe("ok");
    if (result.kind === "ok") {
      expect(result.bundles.map((bundle) => bundle.id)).toEqual([
        "alexandria-product",
        "second-bundle",
      ]);
    }
  });

  test("an empty bundles array is an error state, not a crash", () => {
    const result = parseLibraryBundleRegistry(JSON.stringify({ bundles: [], schemaVersion: 1 }));

    expect(result.kind).toBe("error");
    if (result.kind === "error") {
      expect(result.message).toContain("no bundles");
    }
  });

  test("malformed JSON is an error state, not a crash", () => {
    const result = parseLibraryBundleRegistry("{ not valid json");

    expect(result.kind).toBe("error");
    if (result.kind === "error") {
      expect(result.message).toContain("not valid JSON");
    }
  });

  test("a non-object JSON value is an error state", () => {
    expect(parseLibraryBundleRegistry("[]").kind).toBe("error");
    expect(parseLibraryBundleRegistry("42").kind).toBe("error");
  });

  test("an unsupported schemaVersion is an error state", () => {
    const result = parseLibraryBundleRegistry(
      JSON.stringify({ bundles: [{ id: "x" }], schemaVersion: 2 }),
    );

    expect(result.kind).toBe("error");
    if (result.kind === "error") {
      expect(result.message).toContain("schemaVersion");
    }
  });

  test("a missing bundles array is an error state", () => {
    const result = parseLibraryBundleRegistry(JSON.stringify({ schemaVersion: 1 }));

    expect(result.kind).toBe("error");
    if (result.kind === "error") {
      expect(result.message).toContain("bundles");
    }
  });

  test("a bundle missing a required field is an error state", () => {
    const result = parseLibraryBundleRegistry(
      JSON.stringify({
        bundles: [
          {
            id: "alexandria-product",
            label: "Alexandria Product",
            // libraryRoot omitted.
          },
        ],
        schemaVersion: 1,
      }),
    );

    expect(result.kind).toBe("error");
    if (result.kind === "error") {
      expect(result.message).toContain("libraryRoot");
    }
  });

  test("duplicate bundle ids are an error state", () => {
    const result = parseLibraryBundleRegistry(
      JSON.stringify({
        bundles: [
          {
            draftPatchLog: "a/patches.json",
            id: "dup",
            label: "First",
            libraryRoot: "a",
          },
          {
            draftPatchLog: "b/patches.json",
            id: "dup",
            label: "Second",
            libraryRoot: "b",
          },
        ],
        schemaVersion: 1,
      }),
    );

    expect(result.kind).toBe("error");
    if (result.kind === "error") {
      expect(result.message).toContain("duplicate");
    }
  });
});

describe("defaultLibraryBundle / libraryBundleById", () => {
  const parsedTwoBundles = parseLibraryBundleRegistry(VALID_TWO_BUNDLE_REGISTRY);
  const twoBundles = parsedTwoBundles.kind === "ok" ? parsedTwoBundles.bundles : [];

  test("defaultLibraryBundle returns the first entry", () => {
    expect(defaultLibraryBundle(twoBundles)?.id).toBe("alexandria-product");
  });

  test("defaultLibraryBundle returns undefined for an empty list", () => {
    expect(defaultLibraryBundle([])).toBeUndefined();
  });

  test("libraryBundleById resolves a known id and returns undefined for an unknown one", () => {
    expect(libraryBundleById(twoBundles, "second-bundle")?.label).toBe("Second Bundle");
    expect(libraryBundleById(twoBundles, "unknown-bundle")).toBeUndefined();
  });
});

describe("the checked-in registry file", () => {
  test("parses successfully and contains exactly the frozen alexandria-product entry", () => {
    expect(libraryBundleRegistry.kind).toBe("ok");
    if (libraryBundleRegistry.kind === "ok") {
      expect(libraryBundleRegistry.bundles).toEqual([
        {
          id: "alexandria-product",
          label: "Alexandria Product",
          libraryRoot: "docs/alexandria/library",
        },
      ]);
    }
  });
});

describe("validateLibraryBundleRegistry (the already-parsed-value entry point)", () => {
  test("validates an already-parsed valid registry object", () => {
    const result = validateLibraryBundleRegistry({
      bundles: [
        {
          id: "alexandria-product",
          label: "Alexandria Product",
          libraryRoot: "docs/alexandria/library",
        },
      ],
      schemaVersion: 1,
    });

    expect(result.kind).toBe("ok");
  });

  test("an already-parsed empty bundles array is an error state", () => {
    expect(validateLibraryBundleRegistry({ bundles: [], schemaVersion: 1 }).kind).toBe("error");
  });

  test("a non-object parsed value is an error state", () => {
    expect(validateLibraryBundleRegistry([]).kind).toBe("error");
    expect(validateLibraryBundleRegistry("a string").kind).toBe("error");
    expect(validateLibraryBundleRegistry(null).kind).toBe("error");
  });

  test("parseLibraryBundleRegistry and validateLibraryBundleRegistry agree once the string is parsed", () => {
    const raw = JSON.stringify({
      bundles: [
        {
          draftPatchLog: "a/patches.json",
          id: "a",
          label: "A",
          libraryRoot: "a",
        },
      ],
      schemaVersion: 1,
    });

    expect(parseLibraryBundleRegistry(raw)).toEqual(validateLibraryBundleRegistry(JSON.parse(raw)));
  });
});
