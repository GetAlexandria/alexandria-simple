/**
 * Shared path resolution for canvas spike helpers.
 *
 * Each helper takes an optional `--project-root <path>` arg and otherwise
 * uses CLAUDE_PROJECT_DIR (set by the Claude Code host) or the current
 * working directory. Centralized here so adding a new helper doesn't
 * re-derive the rule.
 */

import { resolve } from "path";

export function projectRootFromArgs(argv: string[]): string {
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--project-root") return resolve(argv[i + 1] ?? ".");
  }
  return resolve(process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
}
