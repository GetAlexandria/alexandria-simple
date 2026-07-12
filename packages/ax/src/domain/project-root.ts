import { realpathSync, statSync } from "fs";
import { dirname, join, resolve } from "path";
import { DEFAULT_CONFIG_DIR } from "./paths.js";

export class AlexandriaProjectRootNotFoundError extends Error {
  readonly start: string;

  constructor(start: string) {
    super("Alexandria is not initialized. Run `ax init`.");
    this.name = "AlexandriaProjectRootNotFoundError";
    this.start = start;
  }
}

export class AlexandriaProjectRootResolutionError extends Error {
  readonly root: string;

  constructor(root: string, cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);
    super(`Failed to resolve Alexandria project root ${root}: ${message}`);
    this.name = "AlexandriaProjectRootResolutionError";
    this.root = root;
  }
}

function hasAlexandriaDirectory(path: string): boolean {
  try {
    return statSync(join(path, DEFAULT_CONFIG_DIR)).isDirectory();
  } catch {
    return false;
  }
}

export function canonicalizeExistingPath(path: string): string | null {
  try {
    return realpathSync(resolve(path));
  } catch {
    return null;
  }
}

export function findAlexandriaProjectRoot(
  start: string,
): string | AlexandriaProjectRootNotFoundError | AlexandriaProjectRootResolutionError {
  let current = resolve(start);

  while (true) {
    if (hasAlexandriaDirectory(current)) {
      const canonical = canonicalizeExistingPath(current);
      if (canonical == null) {
        return new AlexandriaProjectRootResolutionError(current, "realpath failed");
      }
      return canonical;
    }

    const parent = dirname(current);
    if (parent === current) {
      return new AlexandriaProjectRootNotFoundError(start);
    }
    current = parent;
  }
}
