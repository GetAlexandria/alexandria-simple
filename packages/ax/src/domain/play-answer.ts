// Pure domain logic for answering a pending Fabro interview question
// out-of-band (the `ax play answer` command, slice 2 of frame-the-problem-coin).
//
// Answering is an HTTP call, NOT a `fabro` CLI subcommand: the Fabro server
// exposes `POST /api/v1/runs/{id}/questions/{qid}/answer`, with a body
// discriminated by `kind`. Verified against the vendored Fabro source
// (`fabro-cli/.../run/attach.rs::submit_server_interview_answer`,
// `fabro-server/.../handler/runs.rs`, `fabro-types/.../interview.rs`).
//
// This module is deliberately a faithful, thin model of Fabro's answer kinds.
// The play-specific choice of *which* kind to send for a given gate (e.g. the
// frame-the-problem review gate's Approve vs. Revise) belongs to the Raven
// skill, informed by the live question's choices/prompt — not baked in here.

/** The five answer kinds Fabro accepts, in the shape this CLI takes them. */
export type AnswerSpec =
  | { kind: "yes" }
  | { kind: "no" }
  | { kind: "selected"; optionKey: string }
  | { kind: "multi_selected"; optionKeys: readonly string[] }
  | { kind: "text"; text: string };

/** The JSON body POSTed to Fabro's answer endpoint (snake_case, as Fabro deserializes it). */
export interface FabroAnswerBody {
  kind: "yes" | "no" | "selected" | "multi_selected" | "text";
  option_key?: string;
  option_keys?: string[];
  text?: string;
}

/** Build the discriminated answer body Fabro expects from an answer spec. */
export function buildAnswerBody(spec: AnswerSpec): FabroAnswerBody {
  switch (spec.kind) {
    case "yes":
      return { kind: "yes" };
    case "no":
      return { kind: "no" };
    case "selected":
      return { kind: "selected", option_key: spec.optionKey };
    case "multi_selected":
      return { kind: "multi_selected", option_keys: [...spec.optionKeys] };
    case "text":
      return { kind: "text", text: spec.text };
  }
}

// NOTE: `ax raven answer` deliberately does NOT pre-validate the answer kind
// against the question's `question_type`. A `freeform=true` edge on a
// multiple-choice gate (the frame-the-problem revise path) legitimately accepts
// a `text` answer, which a static kind↔type check would wrongly reject. The
// live Fabro endpoint is the real arbiter — it returns 400 on a genuine
// mismatch, which the command surfaces.

/** A human-readable summary of an answer spec, for CLI/log output. */
export function describeAnswerSpec(spec: AnswerSpec): string {
  switch (spec.kind) {
    case "yes":
      return "yes";
    case "no":
      return "no";
    case "selected":
      return `selected ${spec.optionKey}`;
    case "multi_selected":
      return `multi-selected ${spec.optionKeys.join(", ")}`;
    case "text":
      return `text (${spec.text.length} chars)`;
  }
}
