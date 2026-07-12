import { relative, sep } from "path";

export interface LibraryGraphCard {
  id: string;
  outbound: string[];
  subfolder: string;
  territory: string;
  title: string;
  type: string;
}

export interface LibraryCardDetail extends LibraryGraphCard {
  content: string;
}

export interface LibraryGraphEdge {
  from: string;
  to: string;
}

export interface LibraryGraphMeta {
  cardCount: number;
  edgeCount: number;
  subfolders: string[];
  territories: string[];
}

export interface LibraryGraph {
  cards: LibraryGraphCard[];
  edges: LibraryGraphEdge[];
  meta: LibraryGraphMeta;
  scanErrors: string[];
}

export interface LibraryMarkdownFile {
  content: string;
  path: string;
}

export const LIBRARY_GRAPH_SKIP_FILES = new Set([
  "README.md",
  "CONVENTIONS.md",
  "feedback-queue.jsonl",
  "signal-queue.jsonl",
  "wizard-output.md",
  "wizard-config.json",
  "initialize-output.md",
  "alexandria-config.json",
]);

const CARD_NAME_PATTERN = /^(.+?) - (.+)$/;
const WIKILINK_PATTERN = /\[\[([^\]]+)\]\]/g;

function toPosixPath(path: string): string {
  return path.split(sep).join("/");
}

export function markdownCardName(path: string): string {
  // Card paths arrive both POSIX-normalized and platform-native, so split on
  // either separator instead of only the platform one.
  const fileName = path.split(/[\\/]/).at(-1) ?? path;
  return fileName.endsWith(".md") ? fileName.slice(0, -3) : fileName;
}

function extractTypeAndTitle(cardName: string): {
  title: string;
  type: string;
} {
  const match = CARD_NAME_PATTERN.exec(cardName);
  if (match?.[1] != null && match[2] != null) {
    return {
      title: match[2].trim(),
      type: match[1].trim(),
    };
  }

  return {
    title: cardName,
    type: "Card",
  };
}

function normalizeWikilinkTarget(rawTarget: string): string {
  const withoutAlias = rawTarget.split("|")[0] ?? rawTarget;
  const withoutSection = withoutAlias.split("#")[0] ?? withoutAlias;
  return withoutSection.trim();
}

export function extractOutboundTargets(content: string): string[] {
  const targets: string[] = [];

  for (const match of content.matchAll(WIKILINK_PATTERN)) {
    const rawTarget = match[1];
    if (rawTarget == null) {
      continue;
    }

    const target = normalizeWikilinkTarget(rawTarget);
    if (target.length > 0) {
      targets.push(target);
    }
  }

  return sortedUnique(targets);
}

function compareCards(left: LibraryGraphCard, right: LibraryGraphCard): number {
  return (
    left.territory.localeCompare(right.territory) ||
    left.subfolder.localeCompare(right.subfolder) ||
    left.title.localeCompare(right.title)
  );
}

function compareEdges(left: LibraryGraphEdge, right: LibraryGraphEdge): number {
  return left.from.localeCompare(right.from) || left.to.localeCompare(right.to);
}

function sortedUnique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

export function createLibraryGraphCard(
  file: LibraryMarkdownFile,
  libraryRoot: string,
): LibraryGraphCard | Error {
  const relativePath = toPosixPath(relative(libraryRoot, file.path));
  const segments = relativePath.split("/");
  const fileName = segments.at(-1);

  if (fileName == null || !fileName.endsWith(".md")) {
    return new Error(`Not a markdown card path: ${relativePath}`);
  }

  if (LIBRARY_GRAPH_SKIP_FILES.has(fileName) || fileName.startsWith(".")) {
    return new Error(`Skipped library support file: ${relativePath}`);
  }

  if (segments.length < 2) {
    return new Error(
      `Library card path must be <territory>/<subfolder>/<card>.md: ${relativePath}`,
    );
  }

  const territory = segments[0];
  const subfolder = segments.length === 2 ? "root" : segments[1];
  if (territory == null || subfolder == null || fileName == null) {
    return new Error(`Invalid library card path: ${relativePath}`);
  }

  const id = markdownCardName(fileName);
  if (!CARD_NAME_PATTERN.test(id)) {
    return new Error(`Skipped non-card markdown file: ${relativePath}`);
  }

  const { title, type } = extractTypeAndTitle(id);

  return {
    id,
    outbound: extractOutboundTargets(file.content),
    subfolder,
    territory,
    title,
    type,
  };
}

export function buildLibraryGraph(input: {
  files: LibraryMarkdownFile[];
  libraryRoot: string;
}): LibraryGraph {
  const cards: LibraryGraphCard[] = [];
  const scanErrors: string[] = [];

  for (const file of input.files) {
    const card = createLibraryGraphCard(file, input.libraryRoot);
    if (card instanceof Error) {
      scanErrors.push(card.message);
      continue;
    }
    cards.push(card);
  }

  cards.sort(compareCards);

  const edges = cards
    .flatMap((card) =>
      card.outbound.map((target) => ({
        from: card.id,
        to: target,
      })),
    )
    .sort(compareEdges);

  return {
    cards,
    edges,
    meta: {
      cardCount: cards.length,
      edgeCount: edges.length,
      subfolders: sortedUnique(cards.map((card) => `${card.territory}/${card.subfolder}`)),
      territories: sortedUnique(cards.map((card) => card.territory)),
    },
    scanErrors,
  };
}
