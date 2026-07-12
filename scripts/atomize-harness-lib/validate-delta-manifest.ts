#!/usr/bin/env bun
// Executable spec for `ax library validate-delta-manifest <path> --json`.
// Deterministic validator for the atomize-source delta manifest
// (schemaVersion delta-manifest.v1). Harness stand-in until the shipped ax
// command lands; the factory issue freezes THIS behavior.
//
// cwd contract: run from the Alexandria workspace (like a play command node).
// The project root is the nearest ancestor containing `.alexandria/`.
//
// stdout: JSON { ok, findings: [{ changeId?, message }] }. Exit 0 iff ok.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const KINDS = ["create", "edit", "rename", "absorb", "retire", "ledger"] as const;
type Kind = (typeof KINDS)[number];

interface Finding {
  changeId?: string;
  message: string;
}

function findProjectRoot(start: string): string | null {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, ".alexandria", "alexandria-config.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function fail(findings: Finding[]): never {
  console.log(JSON.stringify({ findings, ok: false }, null, 2));
  process.exit(1);
}

const manifestArg = process.argv[2];
if (manifestArg == null || manifestArg.startsWith("--")) {
  fail([{ message: "Usage: validate-delta-manifest <manifest-path> [--json]" }]);
}

const projectRoot = findProjectRoot(process.cwd());
if (projectRoot == null) {
  fail([{ message: "No .alexandria/alexandria-config.json found above the working directory." }]);
}

const config = JSON.parse(
  readFileSync(join(projectRoot, ".alexandria", "alexandria-config.json"), "utf8"),
) as { library?: { root?: string } };
const libraryRoot = join(projectRoot, config.library?.root ?? "docs/alexandria/library");

const manifestPath = resolve(process.cwd(), manifestArg);
if (!existsSync(manifestPath)) {
  fail([{ message: `Manifest not found: ${manifestArg}` }]);
}

let manifest: any;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (error) {
  fail([{ message: `Manifest is not valid JSON: ${String(error)}` }]);
}

const findings: Finding[] = [];
const note = (message: string, changeId?: string) =>
  findings.push(changeId == null ? { message } : { changeId, message });

if (manifest.schemaVersion !== "delta-manifest.v1") {
  note(`schemaVersion must be "delta-manifest.v1", got ${JSON.stringify(manifest.schemaVersion)}`);
}
if (typeof manifest.source !== "string" || manifest.source.length === 0) {
  note('"source" must be a project-root-relative path string');
} else if (!existsSync(join(projectRoot, manifest.source))) {
  note(`Source file does not exist: ${manifest.source}`);
}
if (typeof manifest.revision !== "number" || manifest.revision < 1) {
  note('"revision" must be a number >= 1');
}
if (!Array.isArray(manifest.changes)) {
  note('"changes" must be an array');
  fail(findings);
}

const cardPathPattern = /^[^/]+\/([^/]+)\/\1 - [^/]+\.md$/;
const isCardPath = (p: unknown): p is string => typeof p === "string" && cardPathPattern.test(p);
const onDisk = (p: string) => existsSync(join(libraryRoot, p));

const seenIds = new Set<string>();
const plannedCreations = new Set<string>();
// Cross-change consistency: a rename/absorb/retire eliminates its target
// path; any LATER change still referencing that path is stale (found live in
// iteration 6 — a medium-effort survey planned an edit against a card an
// earlier change renamed away; the post-execution check caught it a full
// gate later than necessary).
const plannedRemovals = new Set<string>();

for (const change of manifest.changes) {
  const id = typeof change.id === "string" ? change.id : undefined;
  if (id == null || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    note(`Every change needs a unique kebab-case "id"; got ${JSON.stringify(change.id)}`);
    continue;
  }
  if (seenIds.has(id)) note(`Duplicate change id`, id);
  seenIds.add(id);

  const kind = change.kind as Kind;
  if (!KINDS.includes(kind)) {
    note(`"kind" must be one of ${KINDS.join(", ")}; got ${JSON.stringify(change.kind)}`, id);
    continue;
  }
  if (typeof change.summary !== "string" || change.summary.length === 0) {
    note(`"summary" is required`, id);
  }
  if (!Array.isArray(change.evidence) || change.evidence.length === 0) {
    note(`"evidence" must be a non-empty array quoting the Source`, id);
  }

  const targets: unknown[] = Array.isArray(change.targets) ? change.targets : [];
  const ripples: unknown[] = Array.isArray(change.ripples) ? change.ripples : [];

  for (const t of [...targets, ...ripples]) {
    if (!isCardPath(t)) {
      note(
        `Card path must be library-root-relative "<context>/<Type>/<Type> - <Name>.md"; got ${JSON.stringify(t)}`,
        id,
      );
    } else if (plannedRemovals.has(t)) {
      note(
        `Stale reference: ${t} is removed by an earlier change in this manifest — reference the surviving card instead`,
        id,
      );
    } else if (!onDisk(t) && !plannedCreations.has(t)) {
      note(`Card does not exist on disk: ${t}`, id);
    }
  }

  const to = change.to;
  if (["rename", "absorb", "retire"].includes(kind)) {
    for (const t of targets) if (isCardPath(t)) plannedRemovals.add(t);
  }
  switch (kind) {
    case "create":
      if (targets.length > 0) note(`"create" takes no targets`, id);
      if (!isCardPath(to)) note(`"create" requires a valid "to" card path`, id);
      else if (onDisk(to)) note(`"to" already exists on disk: ${to}`, id);
      else plannedCreations.add(to);
      break;
    case "edit":
      if (targets.length === 0) note(`"edit" requires at least one target`, id);
      if (to != null) note(`"edit" takes no "to"`, id);
      break;
    case "rename":
      if (targets.length !== 1) note(`"rename" requires exactly one target`, id);
      if (!isCardPath(to)) note(`"rename" requires a valid "to" card path`, id);
      else if (onDisk(to)) note(`"to" already exists on disk: ${to}`, id);
      else plannedCreations.add(to);
      break;
    case "absorb":
      if (targets.length !== 1) note(`"absorb" requires exactly one donor target`, id);
      if (!isCardPath(to)) note(`"absorb" requires "to" naming the receiving card`, id);
      else if (!onDisk(to) && !plannedCreations.has(to)) {
        note(`Receiving card does not exist: ${to}`, id);
      }
      break;
    case "retire":
      if (targets.length === 0) note(`"retire" requires at least one target`, id);
      if (to != null) note(`"retire" takes no "to"`, id);
      break;
    case "ledger": {
      if (targets.length > 0 || to != null) note(`"ledger" takes no targets or "to"`, id);
      const event = change.event;
      if (
        event == null ||
        typeof event.type !== "string" ||
        event.type.length === 0 ||
        typeof event.payload !== "object" ||
        event.payload == null
      ) {
        note(`"ledger" requires "event": { "type": string, "payload": object }`, id);
      }
      break;
    }
  }
}

for (const [key, label] of [
  ["deferred", '"deferred"'],
  ["openQuestions", '"openQuestions"'],
] as const) {
  if (manifest[key] != null && !Array.isArray(manifest[key])) note(`${label} must be an array when present`);
}

if (findings.length > 0) fail(findings);
console.log(JSON.stringify({ findings: [], ok: true }, null, 2));
