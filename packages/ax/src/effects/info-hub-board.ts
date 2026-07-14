import { Data, Effect } from "effect";
import { infoHubBoardPathForWorkspacePath } from "../domain/paths.js";
import { FileSystem, isMissingFileError } from "./filesystem.js";

/**
 * Info Hub work-board state — ported from the PlayMaker Studio work-order
 * board (`packages/pms/src/server/studio-api.ts`), dropping everything
 * play-related. Alexandria has no plays, so cards carry a required `domainId`
 * (the shared Map/Board domain a work item belongs to) instead of
 * `division`/`function`, there is no `play` field, and there is
 * no one-testing-card-per-play invariant. `checklist` is allowed on any
 * card type (PMS restricts it to `testing`). The board file is git-tracked
 * shared state at `<workspace>/info-hub/board-state.json` — agents edit it
 * directly, and this module is the shared contract both the file and the
 * `/api/info-hub/board` route serialize against.
 */

export const INFO_HUB_CARD_TYPES = ["task", "improvement", "bug", "testing"] as const;
export const INFO_HUB_CARD_STATUSES = [
  "open",
  "in-progress",
  "needs-a-human",
  "done",
  "wont-do",
] as const;

export type InfoHubCardType = (typeof INFO_HUB_CARD_TYPES)[number];
export type InfoHubCardStatus = (typeof INFO_HUB_CARD_STATUSES)[number];

const TERMINAL_INFO_HUB_CARD_STATUSES = new Set<InfoHubCardStatus>(["done", "wont-do"]);
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const REQUIRED_CARD_FIELDS = [
  "id",
  "type",
  "status",
  "domainId",
  "priority",
  "source",
  "created",
] as const;

const CARD_FIELD_ORDER = [
  "id",
  "type",
  "status",
  "domainId",
  "contextId",
  "entityId",
  "priority",
  "source",
  "created",
  "title",
  "detail",
  "checklist",
  "terminalAt",
  "archived",
  "pinned",
] as const;

const ALLOWED_CARD_FIELDS = new Set<string>(CARD_FIELD_ORDER);
const ALLOWED_CHECKLIST_FIELDS = new Set(["text", "done"]);

export const DEFAULT_INFO_HUB_BOARD_COMMENT =
  "Info Hub work board. Agents edit this file directly; the Info Hub board page persists here.";

export interface InfoHubChecklistItem {
  done: boolean;
  text: string;
}

export interface InfoHubCard {
  archived?: boolean;
  checklist?: InfoHubChecklistItem[];
  // Map-tab joins (Map tab plan §1.1, additive and optional): the map
  // context a card belongs to, and the project/system entity that contains
  // or generated it. Free strings here — the board file does not depend on
  // map-state.json; the map derives the join at read time.
  contextId?: string;
  created: string;
  detail?: string;
  // The shared Map/Board domain a work item belongs to (replaces the old
  // ad-hoc `area`). Validated shape-only here — a non-empty string; the map
  // owns the domain set, and the view constrains the picker.
  domainId: string;
  entityId?: string;
  id: string;
  pinned?: boolean;
  priority: number;
  source: string;
  status: InfoHubCardStatus;
  terminalAt?: string;
  title?: string;
  type: InfoHubCardType;
}

export interface InfoHubBoard {
  comment: string;
  cards: InfoHubCard[];
  updated: string;
}

export class InfoHubBoardValidationError extends Data.TaggedError("InfoHubBoardValidationError")<{
  readonly message: string;
}> {}

function validationError(message: string): InfoHubBoardValidationError {
  return new InfoHubBoardValidationError({ message });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function cardRef(card: unknown, index: number): string {
  if (isRecord(card) && typeof card.id === "string" && card.id.length > 0) {
    return card.id;
  }
  return `card ${index}`;
}

function hasOnlyAllowedFields(
  record: Record<string, unknown>,
  allowed: ReadonlySet<string>,
): string[] {
  return Object.keys(record).filter((key) => !allowed.has(key));
}

export function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function isTerminalInfoHubCardStatus(status: InfoHubCardStatus): boolean {
  return TERMINAL_INFO_HUB_CARD_STATUSES.has(status);
}

function validateChecklist(value: unknown, ref: string): InfoHubBoardValidationError | null {
  if (!Array.isArray(value)) {
    return validationError(`${ref} checklist must be a list`);
  }

  for (const [index, item] of value.entries()) {
    if (!isRecord(item)) {
      return validationError(`${ref} checklist item ${index + 1} must be an object`);
    }
    const unknownFields = hasOnlyAllowedFields(item, ALLOWED_CHECKLIST_FIELDS);
    if (unknownFields.length > 0) {
      return validationError(`${ref} checklist item ${index + 1} has unknown fields`);
    }
    if (typeof item.text !== "string" || item.text.trim().length === 0) {
      return validationError(`${ref} checklist item ${index + 1} text must be a string`);
    }
    if (typeof item.done !== "boolean") {
      return validationError(`${ref} checklist item ${index + 1} done must be a boolean`);
    }
  }

  return null;
}

function canonicalizeCard(card: Record<string, unknown>): InfoHubCard {
  const canonical = {} as Record<string, unknown>;
  for (const field of CARD_FIELD_ORDER) {
    if (!hasOwn(card, field)) {
      continue;
    }
    if (field === "checklist" && Array.isArray(card.checklist)) {
      canonical.checklist = card.checklist.map((item) => {
        const checklistItem = item as Record<string, unknown>;
        return { done: checklistItem.done, text: checklistItem.text };
      });
      continue;
    }
    canonical[field] = card[field];
  }
  return canonical as unknown as InfoHubCard;
}

/**
 * Validates a full card list: allowed/required fields, enums, id
 * uniqueness, date patterns, and checklist shape. Returns the canonicalized
 * card list (stable field order) or the first validation failure.
 */
export function validateInfoHubCards(
  cardsValue: unknown,
  label = "cards",
): InfoHubCard[] | InfoHubBoardValidationError {
  if (!Array.isArray(cardsValue)) {
    return validationError(`${label} must be a list`);
  }

  const seenIds = new Set<string>();
  const validCards: InfoHubCard[] = [];

  for (const [index, rawCard] of cardsValue.entries()) {
    const ref = cardRef(rawCard, index + 1);
    if (!isRecord(rawCard)) {
      return validationError(`${label} must contain objects`);
    }

    const unknownFields = hasOnlyAllowedFields(rawCard, ALLOWED_CARD_FIELDS);
    if (unknownFields.length > 0) {
      return validationError(`${ref} has unknown fields: ${JSON.stringify(unknownFields.sort())}`);
    }

    const missing = REQUIRED_CARD_FIELDS.filter((field) => !hasOwn(rawCard, field));
    if (missing.length > 0) {
      return validationError(`${ref} is missing fields: ${JSON.stringify(missing.sort())}`);
    }

    if (typeof rawCard.id !== "string" || rawCard.id.length === 0) {
      return validationError(`${ref} id must be a string`);
    }
    if (seenIds.has(rawCard.id)) {
      return validationError(`duplicate card id ${rawCard.id}`);
    }
    seenIds.add(rawCard.id);

    if (!INFO_HUB_CARD_TYPES.some((type) => type === rawCard.type)) {
      return validationError(
        `${ref} type must be one of ${JSON.stringify([...INFO_HUB_CARD_TYPES].sort())}`,
      );
    }
    if (!INFO_HUB_CARD_STATUSES.some((status) => status === rawCard.status)) {
      return validationError(
        `${ref} status must be one of ${JSON.stringify([...INFO_HUB_CARD_STATUSES].sort())}`,
      );
    }
    if (!Number.isInteger(rawCard.priority)) {
      return validationError(`${ref} priority must be an integer`);
    }
    if (typeof rawCard.source !== "string" || rawCard.source.length === 0) {
      return validationError(`${ref} source must be a string`);
    }
    if (typeof rawCard.created !== "string" || !DATE_ONLY_PATTERN.test(rawCard.created)) {
      return validationError(`${ref} created must be YYYY-MM-DD`);
    }
    if (typeof rawCard.domainId !== "string" || rawCard.domainId.length === 0) {
      return validationError(`${ref} domainId must be a non-empty string`);
    }
    if (
      hasOwn(rawCard, "contextId") &&
      (typeof rawCard.contextId !== "string" || rawCard.contextId.length === 0)
    ) {
      return validationError(`${ref} contextId must be a non-empty string`);
    }
    if (
      hasOwn(rawCard, "entityId") &&
      (typeof rawCard.entityId !== "string" || rawCard.entityId.length === 0)
    ) {
      return validationError(`${ref} entityId must be a non-empty string`);
    }
    if (hasOwn(rawCard, "terminalAt")) {
      if (typeof rawCard.terminalAt !== "string" || !DATE_ONLY_PATTERN.test(rawCard.terminalAt)) {
        return validationError(`${ref} terminalAt must be YYYY-MM-DD`);
      }
    }
    if (hasOwn(rawCard, "archived") && typeof rawCard.archived !== "boolean") {
      return validationError(`${ref} archived must be a boolean`);
    }
    if (hasOwn(rawCard, "pinned") && typeof rawCard.pinned !== "boolean") {
      return validationError(`${ref} pinned must be a boolean`);
    }
    if (hasOwn(rawCard, "title")) {
      if (typeof rawCard.title !== "string" || rawCard.title.trim().length === 0) {
        return validationError(`${ref} title must be a string`);
      }
    }
    if (hasOwn(rawCard, "detail") && typeof rawCard.detail !== "string") {
      return validationError(`${ref} detail must be a string`);
    }
    if (hasOwn(rawCard, "checklist")) {
      const checklistError = validateChecklist(rawCard.checklist, ref);
      if (checklistError != null) {
        return checklistError;
      }
    }

    validCards.push(canonicalizeCard(rawCard));
  }

  return validCards;
}

/**
 * Ported from PMS `normalizeCardStatusTransition`: when a card's status
 * becomes terminal (done/wont-do) and it has no `terminalAt`, stamp one
 * (preferring the prior card's terminalAt/created date when re-affirming an
 * already-terminal card, otherwise today). When a card leaves terminal
 * status, drop `terminalAt`. PMS does not touch `archived` in this
 * transition, so neither do we.
 */
export function normalizeCardStatusTransition(
  existingCard: InfoHubCard | undefined,
  nextCard: InfoHubCard,
  today: string,
): InfoHubCard {
  const next = { ...nextCard };
  if (!isTerminalInfoHubCardStatus(next.status)) {
    delete next.terminalAt;
    return next;
  }
  if (next.terminalAt != null) {
    return next;
  }
  if (existingCard != null && isTerminalInfoHubCardStatus(existingCard.status)) {
    if (existingCard.terminalAt != null) {
      next.terminalAt = existingCard.terminalAt;
    } else if (DATE_ONLY_PATTERN.test(next.created)) {
      next.terminalAt = next.created;
    } else {
      next.terminalAt = today;
    }
    return next;
  }
  next.terminalAt = today;
  return next;
}

/**
 * Merges a posted card list into the on-disk set by id: posted cards
 * replace the on-disk card (after status-transition normalization against
 * the previous version), and on-disk cards not present in the POST are
 * preserved. Both inputs and the final merged set are validated.
 */
export function mergeInfoHubCards(
  existingCardsValue: unknown,
  postedCardsValue: unknown,
  today: string,
): InfoHubCard[] | InfoHubBoardValidationError {
  const existing = validateInfoHubCards(existingCardsValue, "existing cards");
  if (existing instanceof InfoHubBoardValidationError) {
    return existing;
  }
  const posted = validateInfoHubCards(postedCardsValue, "cards");
  if (posted instanceof InfoHubBoardValidationError) {
    return posted;
  }

  const byId = new Map(existing.map((card) => [card.id, card]));
  const order = existing.map((card) => card.id);
  for (const card of posted) {
    byId.set(card.id, normalizeCardStatusTransition(byId.get(card.id), card, today));
    if (!order.includes(card.id)) {
      order.push(card.id);
    }
  }
  const merged = order.flatMap((id) => {
    const card = byId.get(id);
    return card == null ? [] : [card];
  });

  return validateInfoHubCards(merged, "cards");
}

export function defaultInfoHubBoard(): InfoHubBoard {
  return {
    comment: DEFAULT_INFO_HUB_BOARD_COMMENT,
    cards: [],
    updated: todayDateOnly(),
  };
}

function parseInfoHubBoard(parsed: unknown): InfoHubBoard | InfoHubBoardValidationError {
  if (!isRecord(parsed)) {
    return validationError("board must be an object");
  }

  const comment =
    typeof parsed.comment === "string" ? parsed.comment : DEFAULT_INFO_HUB_BOARD_COMMENT;
  const updated = typeof parsed.updated === "string" ? parsed.updated : todayDateOnly();
  const cardsValue = hasOwn(parsed, "cards") ? parsed.cards : [];
  const cards = validateInfoHubCards(cardsValue, "board.cards");
  if (cards instanceof InfoHubBoardValidationError) {
    return cards;
  }

  return { comment, cards, updated };
}

function serializeInfoHubBoard(board: InfoHubBoard): string {
  const ordered = {
    comment: board.comment,
    updated: board.updated,
    cards: board.cards.map((card) => canonicalizeCard(card as unknown as Record<string, unknown>)),
  };
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

/**
 * Reads the Info Hub board file. A missing file is not an error: it
 * returns the default empty board without creating the file. A malformed
 * file (bad JSON or a card list that fails validation) fails the effect —
 * that is real on-disk corruption, distinct from a bad POST body.
 */
export function readInfoHubBoard(options: {
  workspacePath: string;
}): Effect.Effect<InfoHubBoard, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const boardPath = infoHubBoardPathForWorkspacePath(options.workspacePath);
    const content = yield* fs.readText(boardPath).pipe(
      Effect.map((text): string | null => text),
      Effect.catchAll((error) =>
        isMissingFileError(error) ? Effect.succeed(null) : Effect.fail(error),
      ),
    );

    if (content == null) {
      return defaultInfoHubBoard();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      return yield* Effect.fail(
        new Error(
          `Invalid Info Hub board JSON at ${boardPath}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ),
      );
    }

    const board = parseInfoHubBoard(parsed);
    if (board instanceof InfoHubBoardValidationError) {
      return yield* Effect.fail(
        new Error(`Invalid Info Hub board state at ${boardPath}: ${board.message}`),
      );
    }

    return board;
  });
}

/**
 * Writes the Info Hub board file atomically (temp file + rename in the
 * same directory), creating `info-hub/` if it does not exist yet. Ported
 * from PMS `writeJsonAtomic` via the shared `FileSystem.writeTextAtomic`
 * effect, which already creates the parent directory.
 */
export function writeInfoHubBoard(options: {
  board: InfoHubBoard;
  workspacePath: string;
}): Effect.Effect<void, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const boardPath = infoHubBoardPathForWorkspacePath(options.workspacePath);
    yield* fs.writeTextAtomic(boardPath, serializeInfoHubBoard(options.board));
  });
}
