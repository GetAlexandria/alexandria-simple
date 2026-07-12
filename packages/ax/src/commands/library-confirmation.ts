import { isAbsolute, resolve } from "path";
import { Effect } from "effect";
import type { CliResult } from "../cli/result.js";
import {
  confirmEmptyLibraryBundle,
  getLibraryConfirmationStatus,
  rejectEmptyLibraryBundle,
  validateLibraryConfirmationEditList,
  type LibraryConfirmationEdit,
} from "../domain/library-confirmation.js";
import {
  parseJsonObject,
  validateAlexandriaActor,
  type AlexandriaActor,
} from "../domain/state-events.js";
import { FileSystem } from "../effects/filesystem.js";
import { loadProjectStorage } from "../effects/project-state-loader.js";

export const LIBRARY_CONFIRMATION_EXIT_CODES = {
  success: 0,
  operationalFailure: 1,
  invalidInput: 2,
} as const;

type LibraryConfirmOptions =
  | {
      bundle: string;
      command: "status";
      cwd: string;
      json: boolean;
      libraryVersion?: number;
      product?: string;
    }
  | {
      actor: AlexandriaActor;
      bundle: string;
      command: "confirm";
      cwd: string;
      json: boolean;
      libraryVersion?: number;
      product?: string;
    }
  | {
      actor: AlexandriaActor;
      bundle: string;
      command: "reject";
      cwd: string;
      editList?: string;
      editListFile?: string;
      json: boolean;
      libraryVersion?: number;
      product?: string;
    };

const DEFAULT_DIRECTOR_ACTOR = {
  kind: "user",
  host: "viewer",
  name: "Director",
} as const satisfies AlexandriaActor;

export function formatLibraryConfirmationHelp(): string {
  return [
    "Usage: ax internal library-confirm <subcommand> [args]",
    "",
    "Internal deterministic support for the EL4 Empty Library Confirm Gate.",
    "",
    "Available subcommands:",
    "  status   Derive bundle approval from the Ledger",
    "  confirm  Append a user-authored library.confirmed event",
    "  reject   Append a structure-only rejection edit list",
    "",
    "Run `ax internal library-confirm <subcommand> --help` for subcommand options.",
  ].join("\n");
}

function formatSharedHelp(subcommand: "status" | "confirm" | "reject"): string {
  const action =
    subcommand === "status"
      ? "Derive approval for a post-EL3 bundle from the Ledger."
      : subcommand === "confirm"
        ? "Append one user-authored library.confirmed event for a bundle/version."
        : "Append a structure-only rejection edit list without approving the bundle.";
  return [
    `Usage: ax internal library-confirm ${subcommand} --bundle <path> [--product <slug>] [--library-version <n>] [--json]`,
    "",
    action,
    "",
    "Options:",
    "  --bundle <path>            Post-EL3 empty-library bundle path.",
    "  --product <slug>           Expected product slug. Defaults to the bundle manifest.",
    "  --library-version <n>      Expected library version. Defaults to the bundle manifest.",
    ...(subcommand === "status"
      ? []
      : [
          '  --actor <json>            User actor JSON. Defaults to {"kind":"user","host":"viewer","name":"Director"}.',
        ]),
    ...(subcommand === "reject"
      ? [
          "  --edit-list <json>        JSON array of structure edit-list items.",
          "  --edit-list-file <path>   Read edit-list JSON array from a file.",
        ]
      : []),
    "  --json                     Emit machine-readable JSON.",
  ].join("\n");
}

function isHelpFlag(value: string | undefined): boolean {
  return value === "--help" || value === "-h";
}

function invalidInput(message: string, help: string): CliResult {
  return {
    stdout: "",
    stderr: `${message}\n\n${help}`,
    exitCode: LIBRARY_CONFIRMATION_EXIT_CODES.invalidInput,
  };
}

function readOptionValue(
  args: string[],
  index: number,
  option: string,
  help: string,
): string | CliResult {
  const value = args[index + 1];
  if (value == null || value.length === 0 || value.startsWith("-")) {
    return invalidInput(`Missing value for ${option}.`, help);
  }
  return value;
}

function parsePositiveInteger(value: string, field: string): number | Error {
  if (!/^\d+$/.test(value)) {
    return new Error(`${field} must be a positive integer.`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return new Error(`${field} must be a positive integer.`);
  }
  return parsed;
}

function parseActorOption(content: string, help: string): AlexandriaActor | CliResult {
  const parsed = parseJsonObject(content, "Actor");
  if (parsed instanceof Error) {
    return invalidInput(parsed.message, help);
  }
  const actor = validateAlexandriaActor(parsed);
  if (actor instanceof Error) {
    return invalidInput(actor.message, help);
  }
  return actor;
}

function parseSharedArgs(
  command: LibraryConfirmOptions["command"],
  args: string[],
  cwd: string,
): LibraryConfirmOptions | CliResult {
  const help = formatSharedHelp(command);
  let actor: AlexandriaActor = DEFAULT_DIRECTOR_ACTOR;
  let bundle: string | undefined;
  let editList: string | undefined;
  let editListFile: string | undefined;
  let json = false;
  let libraryVersion: number | undefined;
  let product: string | undefined;

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (arg === "--json") {
      json = true;
      continue;
    }
    if (arg === "--bundle") {
      const value = readOptionValue(args, index, "--bundle", help);
      if (typeof value !== "string") return value;
      bundle = value;
      index++;
      continue;
    }
    if (arg.startsWith("--bundle=")) {
      bundle = arg.slice("--bundle=".length);
      continue;
    }
    if (arg === "--product") {
      const value = readOptionValue(args, index, "--product", help);
      if (typeof value !== "string") return value;
      product = value;
      index++;
      continue;
    }
    if (arg.startsWith("--product=")) {
      product = arg.slice("--product=".length);
      continue;
    }
    if (arg === "--library-version") {
      const value = readOptionValue(args, index, "--library-version", help);
      if (typeof value !== "string") return value;
      const parsed = parsePositiveInteger(value, "libraryVersion");
      if (parsed instanceof Error) return invalidInput(parsed.message, help);
      libraryVersion = parsed;
      index++;
      continue;
    }
    if (arg.startsWith("--library-version=")) {
      const parsed = parsePositiveInteger(arg.slice("--library-version=".length), "libraryVersion");
      if (parsed instanceof Error) return invalidInput(parsed.message, help);
      libraryVersion = parsed;
      continue;
    }
    if (arg === "--actor" && command !== "status") {
      const value = readOptionValue(args, index, "--actor", help);
      if (typeof value !== "string") return value;
      const parsed = parseActorOption(value, help);
      if ("exitCode" in parsed) return parsed;
      actor = parsed;
      index++;
      continue;
    }
    if (arg.startsWith("--actor=") && command !== "status") {
      const parsed = parseActorOption(arg.slice("--actor=".length), help);
      if ("exitCode" in parsed) return parsed;
      actor = parsed;
      continue;
    }
    if (arg === "--edit-list" && command === "reject") {
      const value = readOptionValue(args, index, "--edit-list", help);
      if (typeof value !== "string") return value;
      editList = value;
      index++;
      continue;
    }
    if (arg.startsWith("--edit-list=") && command === "reject") {
      editList = arg.slice("--edit-list=".length);
      continue;
    }
    if (arg === "--edit-list-file" && command === "reject") {
      const value = readOptionValue(args, index, "--edit-list-file", help);
      if (typeof value !== "string") return value;
      editListFile = value;
      index++;
      continue;
    }
    if (arg.startsWith("--edit-list-file=") && command === "reject") {
      editListFile = arg.slice("--edit-list-file=".length);
      continue;
    }
    return invalidInput(`Unknown option for library-confirm ${command}: ${arg}`, help);
  }

  if (bundle == null || bundle.length === 0) {
    return invalidInput("Missing required option: --bundle.", help);
  }
  if (command === "reject" && editList == null && editListFile == null) {
    return invalidInput("Missing required option: --edit-list or --edit-list-file.", help);
  }
  if (command === "reject" && editList != null && editListFile != null) {
    return invalidInput("Use only one of --edit-list or --edit-list-file.", help);
  }

  if (command === "status") {
    return {
      bundle,
      command,
      cwd,
      json,
      ...(libraryVersion == null ? {} : { libraryVersion }),
      ...(product == null ? {} : { product }),
    };
  }
  if (command === "confirm") {
    return {
      actor,
      bundle,
      command,
      cwd,
      json,
      ...(libraryVersion == null ? {} : { libraryVersion }),
      ...(product == null ? {} : { product }),
    };
  }
  return {
    actor,
    bundle,
    command,
    cwd,
    ...(editList == null ? {} : { editList }),
    ...(editListFile == null ? {} : { editListFile }),
    json,
    ...(libraryVersion == null ? {} : { libraryVersion }),
    ...(product == null ? {} : { product }),
  };
}

export function parseLibraryConfirmationArgs(
  args: string[],
  cwd: string,
): LibraryConfirmOptions | CliResult {
  const [subcommand, ...subcommandArgs] = args;
  if (subcommand == null || isHelpFlag(subcommand)) {
    return {
      stdout: formatLibraryConfirmationHelp(),
      stderr: "",
      exitCode: LIBRARY_CONFIRMATION_EXIT_CODES.success,
    };
  }

  if (subcommandArgs.some((arg) => isHelpFlag(arg))) {
    const help =
      subcommand === "status" || subcommand === "confirm" || subcommand === "reject"
        ? formatSharedHelp(subcommand)
        : formatLibraryConfirmationHelp();
    return { stdout: help, stderr: "", exitCode: LIBRARY_CONFIRMATION_EXIT_CODES.success };
  }

  if (subcommand !== "status" && subcommand !== "confirm" && subcommand !== "reject") {
    return invalidInput(
      `Unknown library-confirm subcommand: ${subcommand}`,
      formatLibraryConfirmationHelp(),
    );
  }

  return parseSharedArgs(subcommand, subcommandArgs, cwd);
}

function jsonResult(value: unknown, json: boolean, text: string): CliResult {
  return {
    stdout: json ? `${JSON.stringify(value, null, 2)}\n` : text,
    stderr: "",
    exitCode: LIBRARY_CONFIRMATION_EXIT_CODES.success,
  };
}

function parseEditList(content: string): LibraryConfirmationEdit[] | Error {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
  return validateLibraryConfirmationEditList(parsed);
}

function readEditList(
  options: Extract<LibraryConfirmOptions, { command: "reject" }>,
): Effect.Effect<LibraryConfirmationEdit[], Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    let content = options.editList;
    if (content == null && options.editListFile != null) {
      const path = isAbsolute(options.editListFile)
        ? options.editListFile
        : resolve(options.cwd, options.editListFile);
      content = yield* fs.readText(path);
    }
    if (content == null) {
      return yield* Effect.fail(new Error("Missing edit list."));
    }
    const editList = parseEditList(content);
    if (editList instanceof Error) {
      return yield* Effect.fail(editList);
    }
    return editList;
  });
}

const runStatus = Effect.fn("runLibraryConfirmationStatus")(function* (
  options: Extract<LibraryConfirmOptions, { command: "status" }>,
) {
  const storage = yield* loadProjectStorage(options.cwd);
  const page = yield* storage.store
    .listEvents({})
    .pipe(Effect.mapError((error) => new Error(error.message)));
  const status = yield* getLibraryConfirmationStatus({
    bundlePath: options.bundle,
    events: page.events,
    ...(options.libraryVersion == null ? {} : { libraryVersion: options.libraryVersion }),
    ...(options.product == null ? {} : { product: options.product }),
    projectRoot: options.cwd,
  });

  return jsonResult(
    status,
    options.json,
    status.approved
      ? `approved ${status.product} ${status.bundlePath} v${status.libraryVersion}`
      : `${status.status} ${status.product} ${status.bundlePath} v${status.libraryVersion}`,
  );
});

const runConfirm = Effect.fn("runLibraryConfirmationConfirm")(function* (
  options: Extract<LibraryConfirmOptions, { command: "confirm" }>,
) {
  const storage = yield* loadProjectStorage(options.cwd);
  const page = yield* storage.store
    .listEvents({})
    .pipe(Effect.mapError((error) => new Error(error.message)));
  const result = yield* confirmEmptyLibraryBundle({
    actor: options.actor,
    bundlePath: options.bundle,
    events: page.events,
    ...(options.libraryVersion == null ? {} : { libraryVersion: options.libraryVersion }),
    ...(options.product == null ? {} : { product: options.product }),
    projectRoot: options.cwd,
    store: storage.store,
  });

  return jsonResult(
    result,
    options.json,
    `${result.eventStatus} library.confirmed ${result.product} ${result.bundlePath} v${result.libraryVersion}`,
  );
});

const runReject = Effect.fn("runLibraryConfirmationReject")(function* (
  options: Extract<LibraryConfirmOptions, { command: "reject" }>,
) {
  const storage = yield* loadProjectStorage(options.cwd);
  const [editList, page] = yield* Effect.all([
    readEditList(options),
    storage.store.listEvents({}).pipe(Effect.mapError((error) => new Error(error.message))),
  ]);
  const result = yield* rejectEmptyLibraryBundle({
    actor: options.actor,
    bundlePath: options.bundle,
    editList,
    events: page.events,
    ...(options.libraryVersion == null ? {} : { libraryVersion: options.libraryVersion }),
    ...(options.product == null ? {} : { product: options.product }),
    projectRoot: options.cwd,
    store: storage.store,
  });

  return jsonResult(
    result,
    options.json,
    `${result.eventStatus} library.confirmation_rejected ${result.product} ${result.bundlePath} v${result.libraryVersion}`,
  );
});

export function runLibraryConfirmationCli(
  args: string[],
  cwd: string,
): Effect.Effect<CliResult, never, FileSystem> {
  const parsed = parseLibraryConfirmationArgs(args, cwd);
  if ("exitCode" in parsed) {
    return Effect.succeed(parsed);
  }

  const effect =
    parsed.command === "status"
      ? runStatus(parsed)
      : parsed.command === "confirm"
        ? runConfirm(parsed)
        : runReject(parsed);

  return effect.pipe(
    Effect.catchAll((error) =>
      Effect.succeed({
        stdout: "",
        stderr: error.message,
        exitCode: LIBRARY_CONFIRMATION_EXIT_CODES.invalidInput,
      }),
    ),
  );
}
