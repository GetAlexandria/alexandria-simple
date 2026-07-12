import { describe, expect, test } from "bun:test";
import {
  LIBRARY_SEARCH_PRIOR_SCHEMA_VERSION,
  librarySearchPriorHighConfidenceFence,
  parseLibrarySearchPrior,
} from "../src/domain/library-search-prior.js";

function validPrior(overrides: Record<string, unknown> = {}) {
  return {
    schemaVersion: LIBRARY_SEARCH_PRIOR_SCHEMA_VERSION,
    domain: {
      actors: [{ value: "director", confidence: "high" }],
      capability: {
        value: "turn a play idea into a proven workflow",
        confidence: "medium",
      },
      category: { value: "play production studio", confidence: "medium" },
      vocabulary: [
        { value: "play", confidence: "high" },
        { value: "board", confidence: "medium" },
      ],
    },
    workThread: {
      unit: { value: "Play", confidence: "high" },
      path: [
        {
          activity: { value: "brief", confidence: "high" },
          place: { value: "studio", confidence: "medium" },
          advance: { value: "human gate approval", confidence: "medium" },
        },
      ],
      stateField: { value: "status", confidence: "low" },
      places: [{ value: "board", confidence: "medium" }],
      shape: {
        value: "pipeline",
        confidence: "high",
        basis: "The Work names ordered, gated stages.",
      },
    },
    fence: {
      outOfScope: [
        { value: "generic project management tracker", confidence: "high" },
        { value: "runtime internals", confidence: "medium" },
      ],
      external: [{ value: "Fabro runtime", confidence: "medium" }],
      lookAlikes: [{ value: "chatbot", confidence: "high" }],
    },
    openQuestions: [
      {
        about: "stateField",
        question: "Is the lifecycle marker actually named status in source?",
      },
    ],
    ...overrides,
  };
}

function parse(input: Record<string, unknown>) {
  return parseLibrarySearchPrior(`${JSON.stringify(input, null, 2)}\n`);
}

describe("library-search-prior parser", () => {
  test("parses a valid library-search-prior.v1 contract", () => {
    const parsed = parse(validPrior());

    expect(parsed.metadataIssues).toEqual([]);
    expect(parsed.prior?.schemaVersion).toBe(LIBRARY_SEARCH_PRIOR_SCHEMA_VERSION);
    expect(parsed.prior?.workThread.unit.value).toBe("Play");
    expect(parsed.prior?.workThread.shape).toEqual({
      value: "pipeline",
      confidence: "high",
      basis: "The Work names ordered, gated stages.",
    });
  });

  test("rejects the wrong schema version", () => {
    const parsed = parse(validPrior({ schemaVersion: "library-search-prior.v0" }));

    expect(parsed.metadataIssues).toContain(
      "Invalid library-search-prior.json: schemaVersion must be library-search-prior.v1",
    );
    expect(parsed.prior).toBeUndefined();
  });

  test("reports a missing confidence on inferred fields", () => {
    const input = validPrior();
    (input.domain as { capability: Record<string, unknown> }).capability = {
      value: "turn a play idea into a proven workflow",
    };
    const parsed = parse(input);

    expect(parsed.metadataIssues).toContain(
      "Invalid library-search-prior.json: domain.capability: missing confidence",
    );
    expect(parsed.prior).toBeUndefined();
  });

  test("reports an invalid confidence value", () => {
    const input = validPrior();
    (input.workThread as { unit: Record<string, unknown> }).unit = {
      value: "Play",
      confidence: "certain",
    };
    const parsed = parse(input);

    expect(parsed.metadataIssues).toContain(
      "Invalid library-search-prior.json: workThread.unit: invalid confidence",
    );
    expect(parsed.prior).toBeUndefined();
  });

  test("requires low-confidence fields to carry an open question", () => {
    const parsed = parse(validPrior({ openQuestions: [] }));

    expect(parsed.metadataIssues).toContain(
      "Invalid library-search-prior.json: low-confidence workThread.stateField must have an openQuestions entry",
    );
    expect(parsed.prior).toBeUndefined();
  });

  test("rejects duplicate open questions", () => {
    const question = {
      about: "stateField",
      question: "Is the lifecycle marker actually named status in source?",
    };
    const parsed = parse(validPrior({ openQuestions: [question, question] }));

    expect(parsed.metadataIssues).toContain(
      'Invalid library-search-prior.json: duplicate open question "stateField"',
    );
    expect(parsed.prior).toBeUndefined();
  });

  test("exposes only high-confidence fence entries for pruning", () => {
    const parsed = parse(validPrior());

    expect(parsed.metadataIssues).toEqual([]);
    expect(parsed.prior).toBeDefined();
    expect(librarySearchPriorHighConfidenceFence(parsed.prior!)).toEqual({
      outOfScope: ["generic project management tracker"],
      external: [],
      lookAlikes: ["chatbot"],
    });
  });
});
