#!/usr/bin/env bun
// Executable spec for `ax library check [--manifest <path>] --json`.
// Deterministic post-execution library checks for the atomize-source play.
// Harness stand-in until the shipped ax command lands; the factory issue
// freezes THIS behavior.
//
// Structural lints (always, whole library): card filenames match
// "<Type> - <Name>.md" under "<context>/<Type>/", frontmatter present, card
// stems globally unique.
//
// Dangling-link policy: the play must not be blocked by pre-existing graph
// debt, but must never add to it. So:
//   - error: a dangling link inside a file this manifest touched
//     (targets / to / ripples), or a dangling link ANYWHERE pointing at a
//     stem this manifest removed (rename/absorb/retire) — the run broke it.
//   - warning (non-fatal): any other dangling link — pre-existing debt.
//   Without --manifest, all dangling links are errors (full audit mode).
//
// With --manifest, additionally verifies the manifest landed: create/rename
// "to" exists; rename/absorb/retire targets are gone; edit targets still
// exist; ledger events appear in the ledger.
//
// stdout: JSON { ok, findings: [{ severity, file?, changeId?, message }] }.
// Exit 0 iff no error-severity findings.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

interface Finding {
  changeId?: string;
  file?: string;
  message: string;
  severity: "error" | "warning";
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

const findings: Finding[] = [];
const error = (finding: Omit<Finding, "severity">) => findings.push({ ...finding, severity: "error" });
const warning = (finding: Omit<Finding, "severity">) =>
  findings.push({ ...finding, severity: "warning" });

const projectRoot = findProjectRoot(process.cwd());
if (projectRoot == null) {
  console.log(
    JSON.stringify(
      {
        findings: [{ message: "No .alexandria/alexandria-config.json found.", severity: "error" }],
        ok: false,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}
const config = JSON.parse(
  readFileSync(join(projectRoot, ".alexandria", "alexandria-config.json"), "utf8"),
) as { library?: { root?: string }; workspace?: string };
const libraryRoot = join(projectRoot, config.library?.root ?? "docs/alexandria/library");
const ledgerPath = join(projectRoot, config.workspace ?? "docs/alexandria", "ledger", "events.jsonl");

let manifestPath: string | null = null;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--manifest") manifestPath = argv[++i] ?? null;
  else if (argv[i]!.startsWith("--manifest=")) manifestPath = argv[i]!.slice("--manifest=".length);
}

// ---- read the manifest first (it shapes link-check severity) ----
let manifest: any = null;
if (manifestPath != null) {
  const full = resolve(process.cwd(), manifestPath);
  if (!existsSync(full)) {
    error({ message: `Manifest not found: ${manifestPath}` });
  } else {
    manifest = JSON.parse(readFileSync(full, "utf8"));
  }
}

const touchedFiles = new Set<string>(); // library-root-relative paths the run claimed
const removedStems = new Set<string>(); // stems deleted by rename/absorb/retire
for (const change of manifest?.changes ?? []) {
  const targets: string[] = change.targets ?? [];
  const ripples: string[] = change.ripples ?? [];
  for (const p of [...targets, ...ripples]) touchedFiles.add(p);
  if (typeof change.to === "string") touchedFiles.add(change.to);
  if (["rename", "absorb", "retire"].includes(change.kind)) {
    for (const p of targets) removedStems.add(basename(p, ".md"));
  }
}

// ---- walk the library ----
const cardFiles: string[] = [];
(function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith(".md")) cardFiles.push(full);
  }
})(libraryRoot);

const stems = new Set<string>();
const altLabels = new Set<string>();
const bodies = new Map<string, string>();
// Link targets also include contexts (top-level shelves are graph nodes:
// [[triggers]]) and unambiguous short names ([[Event-Sourced Activation]]
// resolves iff exactly one card's name part matches).
const contexts = new Set(
  readdirSync(libraryRoot).filter((entry) => statSync(join(libraryRoot, entry)).isDirectory()),
);
const shortNameCounts = new Map<string, number>();

for (const file of cardFiles) {
  const rel = relative(libraryRoot, file);
  const stem = basename(file, ".md");
  const parts = rel.split("/");
  const text = readFileSync(file, "utf8");

  // Every .md stem is a resolvable link target (e.g. _index cards live one
  // level up), but only <context>/<Type>/<file> paths are linted as cards.
  if (stems.has(stem)) {
    error({ file: rel, message: `Card stem is not globally unique: "${stem}"` });
  }
  stems.add(stem);
  bodies.set(rel, text);
  const namePart = stem.includes(" - ") ? stem.slice(stem.indexOf(" - ") + 3) : null;
  if (namePart != null) shortNameCounts.set(namePart, (shortNameCounts.get(namePart) ?? 0) + 1);

  const frontmatterEnd = text.startsWith("---\n") ? text.indexOf("\n---", 4) : -1;
  const frontmatter = frontmatterEnd === -1 ? "" : text.slice(4, frontmatterEnd);
  const altMatch = frontmatter.match(/^altLabels:\n((?:\s+-\s+.+\n?)+)/m);
  if (altMatch != null) {
    for (const line of altMatch[1]!.split("\n")) {
      const label = line.replace(/^\s+-\s+/, "").trim();
      if (label.length > 0) altLabels.add(label);
    }
  }

  if (parts.length !== 3) continue; // not a <context>/<Type>/<Name> card
  const typeDir = basename(dirname(file));
  if (!stem.startsWith(`${typeDir} - `)) {
    error({
      file: rel,
      message: `Card filename must start with its type directory: expected "${typeDir} - <Name>.md"`,
    });
  }
  if (frontmatterEnd === -1) {
    error({ file: rel, message: "Card has no closed frontmatter block" });
  }
}

// ---- dangling links ----
for (const [rel, text] of bodies) {
  const body = text.startsWith("---\n") ? text.slice(text.indexOf("\n---", 4) + 4) : text;
  for (const match of body.matchAll(/\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g)) {
    const target = match[1]!.trim();
    if (
      stems.has(target) ||
      altLabels.has(target) ||
      contexts.has(target) ||
      shortNameCounts.get(target) === 1
    )
      continue;
    const message = `Dangling wikilink: [[${target}]] resolves to no card`;
    if (manifest == null) {
      error({ file: rel, message });
    } else if (removedStems.has(target)) {
      error({ file: rel, message: `${message} (this run removed "${target}" and missed this inbound link)` });
    } else if (touchedFiles.has(rel)) {
      error({ file: rel, message });
    } else {
      warning({ file: rel, message: `${message} (pre-existing, outside this run's scope)` });
    }
  }
}

// ---- manifest landed? ----
if (manifest != null) {
  const ledger = existsSync(ledgerPath) ? readFileSync(ledgerPath, "utf8") : "";
  for (const change of manifest.changes ?? []) {
    const id = change.id as string;
    const targets: string[] = change.targets ?? [];
    const gone = (p: string) =>
      existsSync(join(libraryRoot, p)) &&
      error({ changeId: id, message: `Target should have been removed but still exists: ${p}` });
    const present = (p: string) =>
      !existsSync(join(libraryRoot, p)) &&
      error({ changeId: id, message: `Card should exist but does not: ${p}` });
    switch (change.kind) {
      case "create":
        present(change.to);
        break;
      case "edit":
        targets.forEach(present);
        break;
      case "rename":
      case "absorb":
        present(change.to);
        targets.forEach(gone);
        break;
      case "retire":
        targets.forEach(gone);
        break;
      case "ledger": {
        const type = change.event?.type;
        if (typeof type === "string" && !ledger.includes(`"${type}"`)) {
          error({ changeId: id, message: `No ${type} event found in the ledger` });
        }
        break;
      }
    }
  }
}

const ok = !findings.some((f) => f.severity === "error");
console.log(JSON.stringify({ findings, ok }, null, 2));
process.exit(ok ? 0 : 1);
