#!/usr/bin/env bun
// Executable spec for `ax library inventory [--out <path>] --json`.
// Deterministic pre-computation of the library graph topology for the
// atomize-source play: every card's identity (path, stem, context, type,
// altLabels), its outbound wikilinks, and the derived backlink map. The
// play's inventory command node runs this BEFORE the survey agent, so the
// agent spends its calls on judgment, not on ls/grep discovery.
//
// stdout: JSON { libraryRoot, cardCount, contexts, cards, backlinks }.
// With --out <path>, also writes the JSON there and prints a one-line
// summary after it (the play persists it for later moves to read).

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

function findProjectRoot(start: string): string | null {
  let dir = resolve(start);
  for (;;) {
    if (existsSync(join(dir, ".alexandria", "alexandria-config.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

const projectRoot = findProjectRoot(process.cwd());
if (projectRoot == null) {
  console.error("No .alexandria/alexandria-config.json found above the working directory.");
  process.exit(2);
}
const config = JSON.parse(
  readFileSync(join(projectRoot, ".alexandria", "alexandria-config.json"), "utf8"),
) as { library?: { root?: string } };
const libraryRootRel = config.library?.root ?? "docs/alexandria/library";
const libraryRoot = join(projectRoot, libraryRootRel);

let outPath: string | null = null;
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--out") outPath = argv[++i] ?? null;
  else if (argv[i]!.startsWith("--out=")) outPath = argv[i]!.slice("--out=".length);
}

interface CardEntry {
  altLabels: string[];
  context: string | null;
  links: string[];
  path: string;
  stem: string;
  type: string | null;
}

const files: string[] = [];
(function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (entry.endsWith(".md")) files.push(full);
  }
})(libraryRoot);

const cards: CardEntry[] = [];
for (const file of files.sort()) {
  const rel = relative(libraryRoot, file);
  const parts = rel.split("/");
  const stem = basename(file, ".md");
  const text = readFileSync(file, "utf8");

  const altLabels: string[] = [];
  const frontmatterEnd = text.startsWith("---\n") ? text.indexOf("\n---", 4) : -1;
  const frontmatter = frontmatterEnd === -1 ? "" : text.slice(4, frontmatterEnd);
  const altMatch = frontmatter.match(/^altLabels:\n((?:\s+-\s+.+\n?)+)/m);
  if (altMatch != null) {
    for (const line of altMatch[1]!.split("\n")) {
      const label = line.replace(/^\s+-\s+/, "").trim();
      if (label.length > 0) altLabels.push(label);
    }
  }

  const links = new Set<string>();
  for (const match of text.matchAll(/\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g)) {
    links.add(match[1]!.trim());
  }

  cards.push({
    altLabels,
    context: parts.length === 3 ? parts[0]! : null,
    links: [...links].sort(),
    path: rel,
    stem,
    type: parts.length === 3 ? parts[1]! : null,
  });
}

// Backlinks: for each card, which card FILES reference it — by stem, by any
// altLabel, or by unique short name. This is the ripple set a rename must
// update, computed once instead of grepped per-card by an agent.
const nameToStem = new Map<string, string[]>();
for (const card of cards) {
  const short = card.stem.includes(" - ") ? card.stem.slice(card.stem.indexOf(" - ") + 3) : null;
  for (const key of [card.stem, short, ...card.altLabels]) {
    if (key == null) continue;
    nameToStem.set(key, [...(nameToStem.get(key) ?? []), card.stem]);
  }
}

const backlinks: Record<string, string[]> = {};
for (const card of cards) {
  for (const target of card.links) {
    const owners = nameToStem.get(target) ?? [];
    if (owners.length === 1) {
      const owner = owners[0]!;
      backlinks[owner] = [...(backlinks[owner] ?? []), card.path];
    }
  }
}
for (const key of Object.keys(backlinks)) backlinks[key] = [...new Set(backlinks[key]!)].sort();

// Lean output: stem/context/type derive from path; outbound links stay
// internal (they exist to derive backlinks). Agents query this file with
// one-liners instead of walking the library.
const inventory = {
  backlinks,
  cardCount: cards.length,
  cards: cards.map((c) =>
    c.altLabels.length > 0 ? { altLabels: c.altLabels, path: c.path } : { path: c.path },
  ),
  contexts: [...new Set(cards.map((c) => c.context).filter(Boolean))].sort(),
  libraryRoot: libraryRootRel,
};

const json = JSON.stringify(inventory, null, 1);
if (outPath != null) {
  const full = resolve(process.cwd(), outPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, json);
  console.log(
    `Library inventory: ${cards.length} cards across ${inventory.contexts.length} contexts -> ${outPath}`,
  );
} else {
  console.log(json);
}
