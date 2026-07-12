// Parsing for a fixture's scripted director reactions (slice 4 of
// frame-the-problem-coin). A `reactions.json` carries the director's reactions
// at a play's human gate(s), in order, so a dry run can traverse the
// review ⇄ revise loop deterministically — no live human, no `--interactive`.
//
// Each reaction is an `AnswerSpec` (the same shape `ax raven answer` takes),
// fed to the pending gate in order (conceptually Fabro's QueueInterviewer).

import type { AnswerSpec } from "./play-answer.js";

export class ReactionsParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReactionsParseError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function parseReactionSpec(value: unknown): AnswerSpec | Error {
  if (!isRecord(value) || typeof value.kind !== "string") {
    return new Error("each reaction must be an object with a string `kind`.");
  }
  switch (value.kind) {
    case "yes":
      return { kind: "yes" };
    case "no":
      return { kind: "no" };
    case "selected":
      if (typeof value.optionKey !== "string" || value.optionKey.length === 0) {
        return new Error('a "selected" reaction needs a non-empty `optionKey`.');
      }
      return { kind: "selected", optionKey: value.optionKey };
    case "multi_selected":
      if (
        !Array.isArray(value.optionKeys) ||
        value.optionKeys.length === 0 ||
        value.optionKeys.some((key) => typeof key !== "string")
      ) {
        return new Error(
          'a "multi_selected" reaction needs a non-empty string `optionKeys` array.',
        );
      }
      return { kind: "multi_selected", optionKeys: value.optionKeys as string[] };
    case "text":
      if (typeof value.text !== "string") {
        return new Error('a "text" reaction needs a string `text`.');
      }
      return { kind: "text", text: value.text };
    default:
      return new Error(
        `unknown reaction kind "${value.kind}" (expected yes/no/selected/multi_selected/text).`,
      );
  }
}

/**
 * Parse a reactions file's contents into an ordered list of answer specs.
 * Accepts either a bare array or `{ "reactions": [...] }`.
 */
export function parseReactions(jsonText: string): AnswerSpec[] | ReactionsParseError {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    return new ReactionsParseError(
      `reactions file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  const list = Array.isArray(parsed)
    ? parsed
    : isRecord(parsed) && Array.isArray(parsed.reactions)
      ? parsed.reactions
      : null;
  if (list == null) {
    return new ReactionsParseError(
      "reactions file must be a JSON array of reactions, or an object with a `reactions` array.",
    );
  }
  if (list.length === 0) {
    return new ReactionsParseError("reactions file has no reactions.");
  }

  const reactions: AnswerSpec[] = [];
  for (let index = 0; index < list.length; index++) {
    const spec = parseReactionSpec(list[index]);
    if (spec instanceof Error) {
      return new ReactionsParseError(`reaction ${index}: ${spec.message}`);
    }
    reactions.push(spec);
  }
  return reactions;
}
