import { Effect } from "effect";
import { dirname, join, resolve } from "path";
import { parseConfig, serializeConfig, type AlexandriaNextConfig } from "../domain/config.js";
import {
  resolveDefaultLibraryRoot,
  type DefaultLibraryRootSource,
} from "../domain/library-root.js";
import {
  CONFIG_FILE_NAME,
  DEFAULT_CONFIG_DIR,
  inboxPathForWorkspace,
  ledgerPathForWorkspace,
  sourcesPathForRoot,
  validateProjectRelativePath,
  validateWorkspace,
} from "../domain/paths.js";
import { deriveProjectState, type AlexandriaProjectState } from "../domain/project-state.js";
import {
  derivePlaybook,
  parseTrackerLegsJson,
  PLAY_MANIFEST,
  type Playbook,
  type WorkflowGraphSources,
} from "../domain/plays.js";
import { deriveSourceOfTruths, discoverAtomicCards } from "../domain/knowledge-artifacts.js";
import { resolveWorkflowTemplatePath } from "../domain/orchestration.js";
import type { AlexandriaStateStore } from "../domain/state-store.js";
import { discoverInboxSources, reduceSourceItems } from "../domain/sources.js";
import { FileSystem, isMissingFileError } from "./filesystem.js";
import { makeJsonlStateStore } from "./jsonl-state-store.js";

export interface AlexandriaProjectStorage {
  config: AlexandriaNextConfig;
  configPath: string;
  inboxPath: string;
  ledgerPath: string;
  libraryRoot: string;
  libraryRootSource: DefaultLibraryRootSource;
  sourcesPath: string;
  store: AlexandriaStateStore;
  workspace: string;
  workspacePath: string;
}

export interface LoadedAlexandriaProjectState extends AlexandriaProjectStorage {
  state: AlexandriaProjectState;
}

export function loadProjectStorage(
  cwd: string,
): Effect.Effect<AlexandriaProjectStorage, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const configPath = join(cwd, DEFAULT_CONFIG_DIR, CONFIG_FILE_NAME);

    const config = yield* fs.readText(configPath).pipe(
      Effect.flatMap((content) =>
        Effect.try({
          try: () => parseConfig(content),
          catch: (error) => (error instanceof Error ? error : new Error(String(error))),
        }),
      ),
      Effect.mapError((error) =>
        isMissingFileError(error)
          ? new Error("Alexandria is not initialized. Run `ax init`.")
          : new Error(`Failed to read Alexandria config: ${error.message}`),
      ),
    );

    const workspace = validateWorkspace(config.workspace);
    if (workspace instanceof Error) {
      return yield* Effect.fail(
        new Error(`Failed to read Alexandria config: ${workspace.message}`),
      );
    }

    const workspacePath = resolve(cwd, workspace);
    const ledgerPath = ledgerPathForWorkspace(cwd, workspace);
    const validatedSourcesPath = validateProjectRelativePath(config.sourcesPath);
    if (validatedSourcesPath instanceof Error) {
      return yield* Effect.fail(
        new Error(`Failed to read Alexandria config: sourcesPath ${validatedSourcesPath.message}`),
      );
    }
    const sourcesPath = sourcesPathForRoot(cwd, validatedSourcesPath);
    const libraryRoot = resolveDefaultLibraryRoot({
      config,
      projectRoot: cwd,
      workspacePath,
    });
    if (libraryRoot instanceof Error) {
      return yield* Effect.fail(
        new Error(`Failed to read Alexandria config: ${libraryRoot.message}`),
      );
    }

    return {
      config,
      configPath,
      inboxPath: inboxPathForWorkspace(cwd, workspace),
      ledgerPath,
      libraryRoot: libraryRoot.path,
      libraryRootSource: libraryRoot.source,
      sourcesPath,
      store: makeJsonlStateStore({ ledgerPath, workspacePath }),
      workspace,
      workspacePath,
    };
  });
}

export function writeProjectConfig(options: {
  config: AlexandriaNextConfig;
  configPath: string;
}): Effect.Effect<void, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    yield* fs.writeTextAtomic(options.configPath, serializeConfig(options.config));
  });
}

function loadPlaybook(
  cwd: string,
  workspacePath: string,
): Effect.Effect<Playbook, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const workflowSources: WorkflowGraphSources = {};

    for (const play of Object.values(PLAY_MANIFEST)) {
      const templatePath = resolveWorkflowTemplatePath(play.id, process.env, cwd, {
        workspacePath,
      });
      if (templatePath == null) {
        continue;
      }

      const source = yield* fs.readText(templatePath);
      const legsPath = join(dirname(templatePath), "legs.json");
      // Tracker legs are presentation metadata. A malformed or mismatched
      // legs.json must never crash project-state loading (parseTrackerLegsJson
      // throws, which would surface as an Effect defect) — degrade to no legs
      // and let the tracker fall back to graph labels.
      const trackerLegs = yield* fs.pathExists(legsPath).pipe(
        Effect.flatMap((exists) =>
          exists
            ? fs.readText(legsPath).pipe(
                Effect.flatMap((legsSource) =>
                  Effect.try(() =>
                    parseTrackerLegsJson({
                      playId: play.id,
                      source: legsSource,
                      sourcePath: legsPath,
                    }),
                  ),
                ),
              )
            : Effect.succeed(undefined),
        ),
        Effect.catchAll((error) =>
          Effect.logWarning(`Ignoring tracker legs for ${play.id}: ${String(error)}`).pipe(
            Effect.as(undefined),
          ),
        ),
      );
      workflowSources[play.id] = {
        graphPath: templatePath,
        source,
        ...(trackerLegs == null ? {} : { trackerLegs }),
      };
    }

    return derivePlaybook(workflowSources);
  });
}

export function loadAlexandriaProjectState(
  cwd: string,
): Effect.Effect<LoadedAlexandriaProjectState, Error, FileSystem> {
  return Effect.gen(function* () {
    const storage = yield* loadProjectStorage(cwd);
    const [eventPage, inboxSources, playbook, atomicCards] = yield* Effect.all(
      [
        storage.store.listEvents({}),
        discoverInboxSources({
          inboxPath: storage.inboxPath,
          workspace: storage.workspace,
        }),
        loadPlaybook(cwd, storage.workspacePath),
        discoverAtomicCards({
          projectRoot: cwd,
          workspacePath: storage.workspacePath,
        }),
      ],
      { concurrency: "unbounded" },
    );
    const sourceItems = reduceSourceItems(eventPage.events);
    if (sourceItems instanceof Error) {
      return yield* Effect.fail(sourceItems);
    }

    return {
      ...storage,
      state: deriveProjectState({
        atomicCards,
        config: storage.config,
        inboxSources,
        playbook,
        sourceItems,
        stateEvents: eventPage.events,
        sourceOfTruths: deriveSourceOfTruths(eventPage.events),
        workspacePath: storage.workspacePath,
      }),
    };
  });
}
