import { dirname, isAbsolute, join, resolve } from "path";
import { Effect } from "effect";
import type { AnswerSpec } from "../domain/play-answer.js";
import {
  frontOfHouseAnswerTextFromSpec,
  FRONT_OF_HOUSE_CURRENT_ITEM_FILE,
  parseFrontOfHouseCurrentItem,
  type FrontOfHouseAnswerReceipt,
} from "../domain/library-front-of-house.js";
import {
  payloadString,
  type AlexandriaActor,
  type AlexandriaStateEvent,
} from "../domain/state-events.js";
import type { AppendStateEventResult } from "../domain/state-store.js";
import { FileSystem, type FileSystemService } from "./filesystem.js";
import { loadProjectStorage, type AlexandriaProjectStorage } from "./project-state-loader.js";

export const DIRECTOR_GATE_ACTOR = {
  kind: "user",
  host: "claude-code",
  name: "Director",
} as const satisfies AlexandriaActor;

export interface FrontOfHouseAnswerFact {
  agendaItemId: string;
  eventId: string;
  status: AppendStateEventResult["status"];
}

function resolveAgainstCwd(cwd: string, path: string): string {
  return isAbsolute(path) ? path : resolve(cwd, path);
}

function bundleCurrentItemPaths(
  cwd: string,
  bundle: string,
): { bundlePath: string; currentItemPath: string } {
  const bundlePath = resolveAgainstCwd(cwd, bundle);
  return {
    bundlePath,
    currentItemPath: join(bundlePath, FRONT_OF_HOUSE_CURRENT_ITEM_FILE),
  };
}

function findFrontOfHouseHumanRequest(options: {
  events: readonly AlexandriaStateEvent[];
  fabroRunId: string;
  questionId: string;
}): AlexandriaStateEvent | null {
  return (
    [...options.events]
      .reverse()
      .find(
        (event) =>
          event.type === "play.human_input_requested" &&
          payloadString(event, "playId") === "front-of-house-walk" &&
          payloadString(event, "fabroRunId") === options.fabroRunId &&
          payloadString(event, "questionId") === options.questionId,
      ) ?? null
  );
}

function safeQuestionFileName(questionId: string): string {
  return questionId.replace(/[^A-Za-z0-9._-]+/g, "_");
}

function frontOfHouseBundleFromCurrentItemPath(path: string): string {
  return resolve(dirname(path), "../..");
}

function findFrontOfHouseCurrentItemInWorkspace(options: {
  fs: FileSystemService;
  playRunId: string;
  root: string;
}): Effect.Effect<{ bundlePath: string; currentItemPath: string } | null, Error> {
  const ignoredDirs = new Set([".git", "node_modules", ".ax-runtime"]);
  const walk = (
    dir: string,
    depth: number,
  ): Effect.Effect<{ bundlePath: string; currentItemPath: string } | null, Error> =>
    Effect.gen(function* () {
      if (depth > 8) {
        return null;
      }
      const entries = yield* options.fs
        .readDirectory(dir)
        .pipe(Effect.catchAll(() => Effect.succeed([])));
      for (const entry of entries) {
        const child = join(dir, entry.name);
        if (entry.type === "file" && child.endsWith(FRONT_OF_HOUSE_CURRENT_ITEM_FILE)) {
          const content = yield* options.fs
            .readText(child)
            .pipe(Effect.catchAll(() => Effect.succeed("")));
          const current = parseFrontOfHouseCurrentItem(content);
          if (!(current instanceof Error) && current.playRunId === options.playRunId) {
            return {
              bundlePath: frontOfHouseBundleFromCurrentItemPath(child),
              currentItemPath: child,
            };
          }
        }
        if (entry.type === "directory" && !ignoredDirs.has(entry.name)) {
          const found = yield* walk(child, depth + 1);
          if (found != null) {
            return found;
          }
        }
      }
      return null;
    });
  return walk(options.root, 0);
}

const appendFrontOfHouseAnswerReceipt = Effect.fn("appendFrontOfHouseAnswerReceipt")(
  function* (options: {
    answerSpec: AnswerSpec;
    bundlePath: string;
    currentItemPath: string;
    fabroRunId: string;
    playRunId: string;
    questionId: string;
    storage: AlexandriaProjectStorage;
  }) {
    const fs = yield* FileSystem;
    const currentContent = yield* fs.readText(options.currentItemPath);
    const current = parseFrontOfHouseCurrentItem(currentContent);
    if (current instanceof Error) {
      return yield* Effect.fail(current);
    }
    if (current.playRunId !== options.playRunId) {
      return yield* Effect.fail(
        new Error(
          `Current front-of-house item belongs to playRunId ${current.playRunId}, not ${options.playRunId}.`,
        ),
      );
    }

    const answerText = frontOfHouseAnswerTextFromSpec(options.answerSpec);
    const append = yield* options.storage.store
      .appendEvent({
        actor: DIRECTOR_GATE_ACTOR,
        idempotencyKey: `foh:answer:${options.playRunId}:${options.questionId}`,
        payload: {
          playRunId: options.playRunId,
          fabroRunId: options.fabroRunId,
          questionId: options.questionId,
          agendaItemId: current.agendaItem.id,
          agendaItemKind: current.agendaItem.kind,
          answerText,
        },
        type: "library.front_of_house.answer_recorded",
      })
      .pipe(Effect.mapError((error) => new Error(error.message)));

    const receipt: FrontOfHouseAnswerReceipt = {
      agendaItemId: current.agendaItem.id,
      agendaItemKind: current.agendaItem.kind,
      answerEventId: append.event.id,
      answerText,
      fabroRunId: options.fabroRunId,
      playRunId: options.playRunId,
      questionId: options.questionId,
      schemaVersion: 1,
    };
    yield* fs.writeTextAtomic(
      join(
        options.bundlePath,
        "runtime/front-of-house/answers",
        `${safeQuestionFileName(options.questionId)}.json`,
      ),
      `${JSON.stringify(receipt, null, 2)}\n`,
    );

    return {
      agendaItemId: current.agendaItem.id,
      eventId: append.event.id,
      status: append.status,
    };
  },
);

export const appendFrontOfHouseAnswerForKnownQuestion = Effect.fn(
  "appendFrontOfHouseAnswerForKnownQuestion",
)(function* (options: {
  answerSpec: AnswerSpec;
  bundle: string;
  cwd: string;
  fabroRunId: string;
  playRunId: string;
  questionId: string;
}) {
  const storage = yield* loadProjectStorage(options.cwd);
  return yield* appendFrontOfHouseAnswerReceipt({
    answerSpec: options.answerSpec,
    ...bundleCurrentItemPaths(options.cwd, options.bundle),
    fabroRunId: options.fabroRunId,
    playRunId: options.playRunId,
    questionId: options.questionId,
    storage,
  });
});

export const appendFrontOfHouseAnswerForQuestion = Effect.fn("appendFrontOfHouseAnswerForQuestion")(
  function* (options: {
    answerSpec: AnswerSpec;
    bundle?: string | undefined;
    cwd: string;
    fabroRunId: string;
    questionId: string;
  }) {
    const fs = yield* FileSystem;
    const storageResult = yield* loadProjectStorage(options.cwd).pipe(Effect.either);
    if (storageResult._tag === "Left") {
      if (options.bundle == null) {
        return null;
      }
      return yield* Effect.fail(storageResult.left);
    }
    const storage = storageResult.right;
    const eventPage = yield* storage.store
      .listEvents({})
      .pipe(Effect.mapError((error) => new Error(error.message)));
    const request = findFrontOfHouseHumanRequest({
      events: eventPage.events,
      fabroRunId: options.fabroRunId,
      questionId: options.questionId,
    });
    if (request == null) {
      return null;
    }

    const playRunId = payloadString(request, "playRunId");
    if (playRunId == null) {
      return yield* Effect.fail(new Error("Front-of-house human request is missing playRunId."));
    }

    const inferred =
      options.bundle == null
        ? yield* findFrontOfHouseCurrentItemInWorkspace({
            fs,
            playRunId,
            root: storage.workspacePath,
          })
        : bundleCurrentItemPaths(options.cwd, options.bundle);

    if (inferred == null) {
      return yield* Effect.fail(
        new Error(
          "Could not find runtime/front-of-house/current-item.json for this front-of-house run. Pass --bundle <path>.",
        ),
      );
    }

    return yield* appendFrontOfHouseAnswerReceipt({
      answerSpec: options.answerSpec,
      bundlePath: inferred.bundlePath,
      currentItemPath: inferred.currentItemPath,
      fabroRunId: options.fabroRunId,
      playRunId,
      questionId: options.questionId,
      storage,
    });
  },
);
