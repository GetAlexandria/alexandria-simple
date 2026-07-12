import { join, relative } from "path";
import { Effect } from "effect";
import {
  isAgentId,
  isKnowledgeBankAreaId,
  type AgentId,
  type KnowledgeBankAreaId,
} from "./plays.js";
import { normalizeWorkspace } from "./paths.js";
import type { AlexandriaStateEvent } from "./state-events.js";
import { FileSystem, isMissingFileError } from "../effects/filesystem.js";
import { hashText } from "./sources.js";
import {
  isLegacyAtomicCardCategoryId,
  type LegacyAtomicCardCategoryId,
} from "./atomic-card-categories.js";
import { ATOMIC_CARD_BODY_MARKER_PREFIX } from "./atomic-cards.js";

export interface SourceOfTruth {
  agentId: AgentId;
  contentHash: string;
  frozenAt: string;
  id: string;
  knowledgeBankAreaId: KnowledgeBankAreaId;
  path: string;
  sourceConversionId: string;
}

export interface AtomicCard {
  // Legacy on-disk cards and ledger history may carry a retired category id
  // (e.g. "rationale") — see LegacyAtomicCardCategoryId.
  categoryId?: LegacyAtomicCardCategoryId;
  contentHash: string;
  id: string;
  path: string;
  prefLabel?: string;
  shelfPath?: string;
  title: string;
  type?: string;
}

function optionalString(payload: Record<string, unknown>, key: string): string | undefined {
  const value = payload[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function deriveSourceOfTruths(events: AlexandriaStateEvent[]): SourceOfTruth[] {
  const documents = new Map<string, SourceOfTruth>();

  for (const event of events) {
    const payload = event.payload;
    if (event.type === "source_of_truth.frozen") {
      const id = optionalString(payload, "sourceOfTruthId");
      const agentId = optionalString(payload, "agentId");
      const knowledgeBankAreaId = optionalString(payload, "knowledgeBankAreaId");
      const sourceConversionId = optionalString(payload, "sourceConversionId");
      const path = optionalString(payload, "path");
      const contentHash = optionalString(payload, "contentHash");
      if (
        id == null ||
        agentId == null ||
        !isAgentId(agentId) ||
        knowledgeBankAreaId == null ||
        !isKnowledgeBankAreaId(knowledgeBankAreaId) ||
        sourceConversionId == null ||
        path == null ||
        contentHash == null
      ) {
        continue;
      }

      documents.set(id, {
        agentId,
        contentHash,
        frozenAt: event.at,
        id,
        knowledgeBankAreaId,
        path,
        sourceConversionId,
      });
    }
  }

  return [...documents.values()].sort((left, right) => right.frozenAt.localeCompare(left.frozenAt));
}

export function parseFrontmatter(content: string): Record<string, string> {
  if (!content.startsWith("---\n")) {
    return {};
  }
  const end = content.indexOf("\n---", 4);
  if (end < 0) {
    return {};
  }

  const fields: Record<string, string> = {};
  for (const line of content.slice(4, end).split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator <= 0) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    fields[key] = rawValue.replace(/^"|"$/g, "");
  }
  return fields;
}

function titleFromPath(path: string): string {
  const basename = path.split("/").at(-1) ?? path;
  return basename.replace(/\.md$/i, "");
}

function atomicCardFromMarkdown(options: {
  content: string;
  projectRelativePath: string;
}): AtomicCard | undefined {
  const frontmatter = parseFrontmatter(options.content);
  const categoryId = frontmatter.categoryId;
  const hasRecognizedCategory = categoryId != null && isLegacyAtomicCardCategoryId(categoryId);
  const isEl5Published =
    options.content.includes(ATOMIC_CARD_BODY_MARKER_PREFIX) &&
    frontmatter.type != null &&
    frontmatter.prefLabel != null;
  if (!hasRecognizedCategory && !isEl5Published) {
    return undefined;
  }

  const id = frontmatter.atomicCardId ?? frontmatter.prefLabel ?? options.projectRelativePath;
  const shelfPath = isEl5Published
    ? normalizeWorkspace(options.projectRelativePath.split("/").slice(0, -1).join("/"))
    : undefined;
  return {
    ...(hasRecognizedCategory ? { categoryId } : {}),
    contentHash: hashText(options.content),
    id,
    path: options.projectRelativePath,
    ...(frontmatter.prefLabel == null ? {} : { prefLabel: frontmatter.prefLabel }),
    ...(shelfPath == null || shelfPath.length === 0 ? {} : { shelfPath }),
    title: frontmatter.title ?? frontmatter.prefLabel ?? titleFromPath(options.projectRelativePath),
    ...(frontmatter.type == null ? {} : { type: frontmatter.type }),
  };
}

export function discoverAtomicCards(options: {
  projectRoot: string;
  workspacePath: string;
}): Effect.Effect<AtomicCard[], Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const libraryPath = join(options.workspacePath, "library");
    const cards: AtomicCard[] = [];

    const walk = (absoluteDir: string): Effect.Effect<void, Error, FileSystem> =>
      Effect.gen(function* () {
        const entries = yield* fs
          .readDirectory(absoluteDir)
          .pipe(
            Effect.catchAll((error) =>
              isMissingFileError(error) ? Effect.succeed([]) : Effect.fail(error),
            ),
          );

        for (const entry of entries) {
          const absolutePath = join(absoluteDir, entry.name);
          if (entry.type === "directory") {
            yield* walk(absolutePath);
            continue;
          }
          if (entry.type !== "file" || !entry.name.endsWith(".md")) {
            continue;
          }

          const content = yield* fs.readText(absolutePath);
          const projectRelativePath = normalizeWorkspace(
            relative(options.projectRoot, absolutePath),
          );
          const card = atomicCardFromMarkdown({ content, projectRelativePath });
          if (card == null) {
            continue;
          }
          cards.push(card);
        }
      });

    yield* walk(libraryPath);
    return cards.sort((left, right) => left.path.localeCompare(right.path));
  });
}
