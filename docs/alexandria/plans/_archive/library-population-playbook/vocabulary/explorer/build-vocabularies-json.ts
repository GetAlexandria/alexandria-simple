#!/usr/bin/env bun
/* eslint-disable */
/**
 * Walks vocabulary/lexicons/*\/ recursively and emits lexicons.json for the
 * standalone Explorer page. Builds a nested folder TREE per lexicon to support
 * the file-browser-style explorer view.
 *
 * Run: `bun build-vocabularies-json.ts`
 * Output: vocabularies.json in the same directory.
 *
 * Re-run any time the lexicons/ tree changes.
 */

import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, basename, relative } from "node:path";

const explorerDir = import.meta.dir;
const lexiconsRoot = join(explorerDir, "..", "vocabularies");
const outPath = join(explorerDir, "vocabularies.json");

const UNIVERSAL_CATEGORIES = [
  "Rationale",
  "Research",
  "Roles",
  "Domains",
  "Surfaces",
  "Entities",
  "Capabilities",
  "Mechanisms",
  "Patterns",
  "Economy",
] as const;

// Mapping from folder name → universal category. Folders without a mapping
// fall back to title-case of the folder name.
const FOLDER_TO_CATEGORY: Record<string, string> = {
  roles: "Roles",
  entities: "Entities",
  surfaces: "Surfaces",
  capabilities: "Capabilities",
  systems: "Mechanisms",
  patterns: "Patterns",
  domains: "Domains",
  economy: "Economy",
  rationale: "Rationale",
  research: "Research",
};

interface Card {
  type: string;
  prefLabel: string;
  altLabels: string[];
  category: string[];
  subcategory: string[];
  facets: string[];
  user_visible: boolean | null;
  status: string;
  proposed_by?: string;
  source_evidence: string[];
  folder: string;
  filename: string;
  filePath: string; // relative to lexicon root
  what: string;
  wikilinks: string[];
}

interface FolderNode {
  type: "folder";
  name: string;
  path: string; // relative to lexicon root
  children: TreeNode[];
}

interface CardNode {
  type: "card";
  card: Card;
}

type TreeNode = FolderNode | CardNode;

interface Lexicon {
  id: string;
  name: string;
  readmePreview: string;
  signature?: { path: string; what: string; rules: string[] };
  deprecations: Card[];
  cards: Card[];
  cardsByCategory: Record<string, Card[]>;
  tree: FolderNode[]; // top-level category folders only
  stats: {
    totalCards: number;
    facetCards: number;
    userVisibleTrueCount: number;
    userVisibleFalseCount: number;
    perCategoryCount: Record<string, number>;
    maxDepth: number;
  };
}

// ─── Frontmatter + body parsing ─────────────────────────────────────────────

function parseFile(content: string): { frontmatter: Record<string, any>; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };
  return { frontmatter: parseYAML(match[1]), body: match[2] };
}

function parseYAML(src: string): Record<string, any> {
  const out: Record<string, any> = {};
  const lines = src.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!m) { i++; continue; }
    const key = m[1];
    const rest = m[2].trim();
    if (rest === "") {
      const items: string[] = [];
      let j = i + 1;
      while (j < lines.length && /^\s+-\s+/.test(lines[j])) {
        items.push(lines[j].replace(/^\s+-\s+/, "").trim());
        j++;
      }
      out[key] = items;
      i = j;
      continue;
    }
    if (rest.startsWith("[") && rest.endsWith("]")) {
      const inner = rest.slice(1, -1).trim();
      out[key] = inner === "" ? [] : inner.split(",").map((s) => s.trim());
      i++;
      continue;
    }
    if (rest === "true") { out[key] = true; i++; continue; }
    if (rest === "false") { out[key] = false; i++; continue; }
    out[key] = stripQuotes(rest);
    i++;
  }
  return out;
}

function stripQuotes(s: string): string {
  return s.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

function extractSection(body: string, sectionName: string): string {
  const re = new RegExp(
    `##\\s*${sectionName}(?::[^\\n]*)?\\n([\\s\\S]*?)(?=\\n##\\s|$)`,
    "i",
  );
  const m = body.match(re);
  return m ? m[1].trim() : "";
}

function extractWhat(body: string): string { return extractSection(body, "WHAT"); }

function extractWikilinks(body: string): string[] {
  const re = /\[\[([^\]\n]+?)\]\]/g;
  const out: Set<string> = new Set();
  let m;
  while ((m = re.exec(body)) !== null) {
    const link = m[1].trim();
    if (link.toLowerCase().endsWith(".md")) continue;
    out.add(link);
  }
  return [...out];
}

function extractSignatureRules(body: string): string[] {
  const what = extractWhat(body);
  const re = /^\s*\d+\.\s*\*\*([^*]+)\*\*[.: ]?\s*(.*?)(?=\n\s*\d+\.|$)/gms;
  const out: string[] = [];
  let m;
  while ((m = re.exec(what)) !== null) {
    out.push(`${m[1].trim()} — ${m[2].trim().replace(/\s+/g, " ")}`);
  }
  if (out.length === 0) {
    const re2 = /^\s*\d+\.\s+([^\n]+)/gm;
    let m2;
    while ((m2 = re2.exec(what)) !== null) out.push(m2[1].trim());
  }
  return out;
}

function ensureArray(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return [String(v).trim()].filter(Boolean);
}

// ─── Recursive directory walk → TreeNode + collected cards ──────────────────

function walkDirectory(dirPath: string, lexiconRoot: string, allCards: Card[]): FolderNode {
  const name = basename(dirPath);
  const relPath = relative(lexiconRoot, dirPath);
  const children: TreeNode[] = [];

  const entries = readdirSync(dirPath).sort();
  // Folders first, then files; within each, alpha sort
  const subdirs: string[] = [];
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    if (statSync(fullPath).isDirectory()) subdirs.push(entry);
    else if (entry.endsWith(".md")) files.push(entry);
  }

  for (const sub of subdirs) {
    children.push(walkDirectory(join(dirPath, sub), lexiconRoot, allCards));
  }
  for (const file of files) {
    const filePath = join(dirPath, file);
    const raw = readFileSync(filePath, "utf-8");
    const { frontmatter, body } = parseFile(raw);
    const card: Card = {
      type: String(frontmatter.type ?? ""),
      prefLabel: String(frontmatter.prefLabel ?? basename(file, ".md")),
      altLabels: ensureArray(frontmatter.altLabels),
      category: ensureArray(frontmatter.category),
      subcategory: ensureArray(frontmatter.subcategory),
      facets: ensureArray(frontmatter.facets),
      user_visible:
        typeof frontmatter.user_visible === "boolean" ? frontmatter.user_visible : null,
      status: String(frontmatter.status ?? ""),
      proposed_by: frontmatter.proposed_by ? String(frontmatter.proposed_by) : undefined,
      source_evidence: ensureArray(frontmatter.source_evidence),
      folder: relPath,
      filename: file,
      filePath: relative(lexiconRoot, filePath),
      what: extractWhat(body),
      wikilinks: extractWikilinks(body),
    };
    children.push({ type: "card", card });
    allCards.push(card);
  }

  return { type: "folder", name, path: relPath, children };
}

function maxDepthOf(node: TreeNode): number {
  if (node.type === "card") return 0;
  let max = 0;
  for (const child of node.children) {
    const d = maxDepthOf(child) + 1;
    if (d > max) max = d;
  }
  return max;
}

// ─── Lexicon assembly ──────────────────────────────────────────────────────

function buildLexicon(lexiconDir: string): Lexicon {
  const id = basename(lexiconDir);
  const name = titleCase(id);

  const allCards: Card[] = [];
  const deprecations: Card[] = [];
  let signature: Lexicon["signature"] | undefined;
  const tree: FolderNode[] = [];

  for (const entry of readdirSync(lexiconDir).sort()) {
    const entryPath = join(lexiconDir, entry);
    if (entry === "README.md") continue;
    if (!statSync(entryPath).isDirectory()) continue;

    if (entry === "_signature") {
      // Pick the (one) signature card
      for (const f of readdirSync(entryPath)) {
        if (!f.endsWith(".md")) continue;
        const raw = readFileSync(join(entryPath, f), "utf-8");
        const { body } = parseFile(raw);
        signature = {
          path: `${entry}/${f}`,
          what: extractWhat(body),
          rules: extractSignatureRules(body),
        };
      }
      continue;
    }
    if (entry === "_deprecations") {
      // Treat depe tombstones as flat cards; not part of the tree
      for (const f of readdirSync(entryPath)) {
        if (!f.endsWith(".md")) continue;
        const raw = readFileSync(join(entryPath, f), "utf-8");
        const { frontmatter, body } = parseFile(raw);
        deprecations.push({
          type: String(frontmatter.type ?? "Deprecation"),
          prefLabel: String(frontmatter.prefLabel ?? basename(f, ".md")),
          altLabels: ensureArray(frontmatter.altLabels),
          category: ensureArray(frontmatter.category),
          subcategory: ensureArray(frontmatter.subcategory),
          facets: ensureArray(frontmatter.facets),
          user_visible:
            typeof frontmatter.user_visible === "boolean" ? frontmatter.user_visible : null,
          status: String(frontmatter.status ?? "deprecated"),
          proposed_by: undefined,
          source_evidence: ensureArray(frontmatter.source_evidence),
          folder: entry,
          filename: f,
          filePath: `${entry}/${f}`,
          what: extractWhat(body),
          wikilinks: extractWikilinks(body),
        });
      }
      continue;
    }

    // Real category folder: walk recursively
    tree.push(walkDirectory(entryPath, lexiconDir, allCards));
  }

  // Build cardsByCategory for the Compare/Category views
  const cardsByCategory: Record<string, Card[]> = {};
  for (const cat of UNIVERSAL_CATEGORIES) cardsByCategory[cat] = [];
  let facetCards = 0;
  let userVisibleTrueCount = 0;
  let userVisibleFalseCount = 0;
  const perCategoryCount: Record<string, number> = {};
  for (const cat of UNIVERSAL_CATEGORIES) perCategoryCount[cat] = 0;

  for (const card of allCards) {
    if (card.facets.length > 0) facetCards++;
    if (card.user_visible === true) userVisibleTrueCount++;
    if (card.user_visible === false) userVisibleFalseCount++;
    for (const cat of card.category) {
      if (cardsByCategory[cat]) cardsByCategory[cat].push(card);
      perCategoryCount[cat] = (perCategoryCount[cat] ?? 0) + 1;
    }
    for (const facet of card.facets) {
      if (cardsByCategory[facet] && !cardsByCategory[facet].includes(card)) {
        cardsByCategory[facet].push(card);
      }
    }
  }

  // Sort top-level tree by universal-category order
  tree.sort((a, b) => {
    const ai = orderForFolder(a.name);
    const bi = orderForFolder(b.name);
    return ai - bi;
  });

  // Compute max depth across the whole tree
  let maxDepth = 0;
  for (const t of tree) {
    const d = maxDepthOf(t);
    if (d > maxDepth) maxDepth = d;
  }

  // README preview
  const readmePath = join(lexiconDir, "README.md");
  let readmePreview = "";
  if (existsSync(readmePath)) {
    let readmeRaw = readFileSync(readmePath, "utf-8");
    readmeRaw = readmeRaw.replace(/^---\n[\s\S]*?\n---\s*\n+/, "");
    while (/^#\s[^\n]+\n+/.test(readmeRaw)) {
      readmeRaw = readmeRaw.replace(/^#\s[^\n]+\n+/, "");
    }
    const stripped = readmeRaw.trim();
    const paragraphs = stripped
      .split(/\n\s*\n/)
      .filter((p) => !p.startsWith("```") && !p.startsWith("|") && !p.startsWith("##"));
    readmePreview = paragraphs.slice(0, 3).join("\n\n").trim();
  }

  return {
    id,
    name,
    readmePreview,
    signature,
    deprecations,
    cards: allCards,
    cardsByCategory,
    tree,
    stats: {
      totalCards: allCards.length,
      facetCards,
      userVisibleTrueCount,
      userVisibleFalseCount,
      perCategoryCount,
      maxDepth,
    },
  };
}

function orderForFolder(folderName: string): number {
  const cat = FOLDER_TO_CATEGORY[folderName];
  if (!cat) return 999;
  return UNIVERSAL_CATEGORIES.indexOf(cat as any);
}

function titleCase(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── Main ──────────────────────────────────────────────────────────────────

function main() {
  const lexiconDirs = readdirSync(lexiconsRoot)
    .filter((d) => !d.startsWith("."))
    .map((d) => join(lexiconsRoot, d))
    .filter((p) => statSync(p).isDirectory());

  const lexicons = lexiconDirs.map(buildLexicon).sort((a, b) => a.name.localeCompare(b.name));

  const out = {
    generatedAt: new Date().toISOString(),
    universalCategories: UNIVERSAL_CATEGORIES,
    folderToCategory: FOLDER_TO_CATEGORY,
    lexicons,
  };

  writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(
    `Wrote ${outPath}\n${lexicons.length} lexicons, ${lexicons.reduce((s, l) => s + l.cards.length, 0)} cards total. Max depth ${Math.max(...lexicons.map(l => l.stats.maxDepth))}.`,
  );
}

main();
