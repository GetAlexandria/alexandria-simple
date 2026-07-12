import { resolve } from "path";
import type { AlexandriaNextConfig } from "./config.js";
import { isPathInsideRoot } from "./paths.js";

export type DefaultLibraryRootSource = "config" | "derived" | "process";

export interface ResolvedDefaultLibraryRoot {
  path: string;
  source: DefaultLibraryRootSource;
}

export class LibraryRootResolutionError extends Error {
  readonly _tag = "LibraryRootResolutionError";

  constructor(
    readonly field: "library.root" | "--library-root",
    message: string,
  ) {
    super(message);
  }
}

function resolveConfiguredRoot(input: {
  field: "library.root" | "--library-root";
  projectRoot: string;
  source: DefaultLibraryRootSource;
  value: string;
}): LibraryRootResolutionError | ResolvedDefaultLibraryRoot {
  const trimmed = input.value.trim();
  if (trimmed.length === 0) {
    return new LibraryRootResolutionError(input.field, `${input.field} must be a non-empty path.`);
  }

  const resolved = resolve(input.projectRoot, trimmed);
  if (!isPathInsideRoot(input.projectRoot, resolved)) {
    return new LibraryRootResolutionError(
      input.field,
      `${input.field} must resolve inside the project root: ${input.value}`,
    );
  }

  return {
    path: resolved,
    source: input.source,
  };
}

export function resolveDefaultLibraryRoot(input: {
  config: AlexandriaNextConfig;
  processLibraryRoot?: string;
  projectRoot: string;
  workspacePath: string;
}): LibraryRootResolutionError | ResolvedDefaultLibraryRoot {
  if (input.processLibraryRoot != null) {
    return resolveConfiguredRoot({
      field: "--library-root",
      projectRoot: input.projectRoot,
      source: "process",
      value: input.processLibraryRoot,
    });
  }

  if (input.config.library?.root != null) {
    return resolveConfiguredRoot({
      field: "library.root",
      projectRoot: input.projectRoot,
      source: "config",
      value: input.config.library.root,
    });
  }

  return {
    path: resolve(input.workspacePath, "library"),
    source: "derived",
  };
}
