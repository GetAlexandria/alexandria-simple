#!/usr/bin/env bun

import { resolve } from "path";
import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import { writeCliResult } from "../cli/result.js";
import { FileSystem, NodeFileSystem } from "../effects/filesystem.js";
import { loadLibraryCatalogRoot } from "../effects/library-graph-loader.js";
import { RETIRED_PRODUCT_CARD_CONNECTORS_ISSUE_PREFIX } from "../domain/library-catalog.js";
import {
  PRODUCT_CARD_STORY_LINT_RULES,
  formatProductCardStoryLint,
  lintProductCatalogStories,
} from "../domain/library-catalog-story.js";
import type { ProductCardStoryLintRule } from "../domain/library-catalog-story.js";

interface StoryLintOptions {
  libraryRoot: string;
  projectRoot: string;
  // null = enforce every rule (default). A non-null set restricts the gate to
  // the selected rules, so a single-rule gate (e.g. no-orphans) can pass a
  // bundle that still carries unrelated violations of another rule.
  rules: ReadonlySet<ProductCardStoryLintRule> | null;
}

function isStoryLintRule(value: string): value is ProductCardStoryLintRule {
  return (PRODUCT_CARD_STORY_LINT_RULES as readonly string[]).includes(value);
}

function usage(): string {
  return [
    "Usage: bun packages/ax/src/tools/library-catalog-story-lint.ts [--project-root <path>] [--library-root <path>] [--rule <name>]...",
    "",
    "Runs the Product card story-template lint for a schema-aware library root.",
    "",
    `--rule may be repeated to restrict the gate to specific rules (default: all). Valid rules: ${PRODUCT_CARD_STORY_LINT_RULES.join(", ")}.`,
  ].join("\n");
}

function parseArgs(args: readonly string[], cwd: string): CliResult | StoryLintOptions {
  let projectRoot = cwd;
  let libraryRoot = "studio/library";
  const rules = new Set<ProductCardStoryLintRule>();

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      return {
        exitCode: 0,
        stderr: "",
        stdout: usage(),
      };
    }

    if (arg === "--project-root") {
      const value = args[index + 1];
      if (value == null || value.trim().length === 0) {
        return {
          exitCode: 2,
          stderr: `Missing value for --project-root.\n\n${usage()}`,
          stdout: "",
        };
      }
      projectRoot = resolve(cwd, value);
      index += 1;
      continue;
    }

    if (arg === "--library-root") {
      const value = args[index + 1];
      if (value == null || value.trim().length === 0) {
        return {
          exitCode: 2,
          stderr: `Missing value for --library-root.\n\n${usage()}`,
          stdout: "",
        };
      }
      libraryRoot = value;
      index += 1;
      continue;
    }

    if (arg === "--rule") {
      const value = args[index + 1];
      if (value == null || value.trim().length === 0) {
        return {
          exitCode: 2,
          stderr: `Missing value for --rule.\n\n${usage()}`,
          stdout: "",
        };
      }
      if (!isStoryLintRule(value)) {
        return {
          exitCode: 2,
          stderr: `Unknown --rule value: ${value}. Valid rules: ${PRODUCT_CARD_STORY_LINT_RULES.join(
            ", ",
          )}.\n\n${usage()}`,
          stdout: "",
        };
      }
      rules.add(value);
      index += 1;
      continue;
    }

    return {
      exitCode: 2,
      stderr: `Unknown option: ${arg ?? ""}\n\n${usage()}`,
      stdout: "",
    };
  }

  return {
    libraryRoot,
    projectRoot,
    rules: rules.size > 0 ? rules : null,
  };
}

export function runLibraryCatalogStoryLint(
  args: readonly string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  const parsed = parseArgs(args, cwd);
  if ("exitCode" in parsed) {
    return Effect.succeed(parsed);
  }

  return loadLibraryCatalogRoot(parsed.projectRoot, parsed.libraryRoot).pipe(
    Effect.map((catalog): CliResult => {
      const activeRules = parsed.rules;
      const violations = lintProductCatalogStories(catalog).filter(
        (violation) => activeRules == null || activeRules.has(violation.rule),
      );
      // Retired-connector issues are a diagram-parity concern, so they only
      // count when diagram-parity is being enforced — a no-orphans gate reports
      // orphans and nothing else.
      const retiredConnectorIssues =
        activeRules == null || activeRules.has("diagram-parity")
          ? catalog.meta.metadataIssues.filter((issue) =>
              issue.startsWith(RETIRED_PRODUCT_CARD_CONNECTORS_ISSUE_PREFIX),
            )
          : [];
      if (violations.length > 0 || retiredConnectorIssues.length > 0) {
        const output = [
          ...retiredConnectorIssues,
          ...(violations.length > 0 ? [formatProductCardStoryLint(violations)] : []),
        ].join("\n");
        return {
          exitCode: 1,
          stderr: output,
          stdout: "",
        };
      }

      return {
        exitCode: 0,
        stderr: "",
        stdout: formatProductCardStoryLint(violations),
      };
    }),
    Effect.catchAll((error) =>
      Effect.succeed({
        exitCode: 1,
        stderr: `Product card story lint failed to load ${parsed.libraryRoot}: ${
          error instanceof Error ? error.message : String(error)
        }`,
        stdout: "",
      }),
    ),
  );
}

if (import.meta.main) {
  const result = await runLibraryCatalogStoryLint(process.argv.slice(2), process.cwd()).pipe(
    Effect.provide(NodeFileSystem),
    Effect.runPromise,
  );
  await writeCliResult(result);
  process.exit(result.exitCode);
}
