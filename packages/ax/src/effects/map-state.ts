import { createHash } from "node:crypto";
import { Data, Effect } from "effect";
import { mapStatePathForWorkspacePath } from "../domain/paths.js";
import { FileSystem, isMissingFileError } from "./filesystem.js";

/**
 * Map state — the Map tab's Domain → Context → Work-to-be-done-or-doing
 * model (Map tab plan §1, `docs/alexandria/plans/map-tab/plan.md`), authored
 * fresh in house style on the `info-hub-board.ts` pattern. The state file is
 * git-tracked shared state at `<workspace>/map/map-state.json` — the director
 * edits positions, agents may add entities, and this module is the shared
 * contract both the file and the `/api/map/state` route serialize against.
 *
 * The document is validated as a whole: identifier uniqueness per collection,
 * referential integrity (context → domain, entity → context, position →
 * entity), and one entity per hex. Landmark positions reference things that
 * are not entities in this file (e.g. `colleague:raven`), so their `entityId`
 * is a free non-empty string.
 *
 * Half convention (plan §1.3): the map grid's `work` half is the r < 0 side,
 * the `personal` half the r > 0 side, and the r = 0 row stays neutral. A
 * domain's `region.center` r-sign must therefore match its declared `half`
 * (work → r < 0, personal → r > 0) — a wrong-side region would render as a
 * ghost domain (label over bare parchment, no territory), so it fails loudly
 * at validation time (both reads and writes run this validator) instead.
 */

export const MAP_DOMAIN_HALVES = ["work", "personal"] as const;
export const MAP_ENTITY_KINDS = ["project", "system"] as const;
export const MAP_PROJECT_LIFECYCLES = ["active", "completed"] as const;
export const MAP_SYSTEM_LIFECYCLES = ["planted", "hibernating", "uprooted"] as const;
export const MAP_POSITION_ENTITY_TYPES = ["project", "system", "landmark"] as const;

export type MapDomainHalf = (typeof MAP_DOMAIN_HALVES)[number];
export type MapEntityKind = (typeof MAP_ENTITY_KINDS)[number];
export type MapProjectLifecycle = (typeof MAP_PROJECT_LIFECYCLES)[number];
export type MapSystemLifecycle = (typeof MAP_SYSTEM_LIFECYCLES)[number];
export type MapPositionEntityType = (typeof MAP_POSITION_ENTITY_TYPES)[number];

// Exhaustive by construction: adding a kind to MAP_ENTITY_KINDS forces an
// entry here, so a new kind can never silently inherit another kind's
// lifecycle vocabulary.
const MAP_LIFECYCLES_BY_KIND: Record<MapEntityKind, readonly string[]> = {
  project: MAP_PROJECT_LIFECYCLES,
  system: MAP_SYSTEM_LIFECYCLES,
};

const DOMAIN_FIELD_ORDER = ["id", "name", "half", "owner", "region"] as const;
const CONTEXT_FIELD_ORDER = ["id", "name", "domainId", "libraryContext"] as const;
const ENTITY_FIELD_ORDER = [
  "id",
  "kind",
  "name",
  "contextId",
  "domainId",
  "assignee",
  "cadence",
  "purpose",
  "pattern",
  "upgrades",
  "lifecycle",
] as const;
const PATTERN_RULE_FIELD_ORDER = ["id", "title", "every", "assignee", "detail"] as const;
const POSITION_FIELD_ORDER = ["q", "r", "entityType", "entityId"] as const;
const ORG_FIELD_ORDER = ["id", "name"] as const;
const STATE_FIELD_ORDER = ["domains", "contexts", "entities", "positions"] as const;

const REQUIRED_DOMAIN_FIELDS = ["id", "name", "half", "region"] as const;
const REQUIRED_CONTEXT_FIELDS = ["id", "name", "domainId"] as const;
const REQUIRED_ENTITY_FIELDS = ["id", "kind", "name", "domainId", "lifecycle"] as const;
const REQUIRED_PATTERN_RULE_FIELDS = ["id", "title", "every"] as const;

const ALLOWED_DOMAIN_FIELDS = new Set<string>(DOMAIN_FIELD_ORDER);
const ALLOWED_CONTEXT_FIELDS = new Set<string>(CONTEXT_FIELD_ORDER);
const ALLOWED_ENTITY_FIELDS = new Set<string>(ENTITY_FIELD_ORDER);
const ALLOWED_POSITION_FIELDS = new Set<string>(POSITION_FIELD_ORDER);
const ALLOWED_ORG_FIELDS = new Set<string>(ORG_FIELD_ORDER);
const ALLOWED_PATTERN_RULE_FIELDS = new Set<string>(PATTERN_RULE_FIELD_ORDER);
// A pattern rule's `every` is a time-only duration in v1 (plan §1): a count of
// hours, days, or weeks. Meter-/condition-based rules are reserved future work
// (a `kind` discriminator, not built here), so any other unit is rejected with
// a clear message rather than silently accepted.
const PATTERN_RULE_EVERY_PATTERN = /^\d+[hdw]$/;
// `org` is optional at the top level (a fresh/empty world has no org yet), so
// it is allowed but deliberately kept out of STATE_FIELD_ORDER, which doubles
// as the required-collection list.
const ALLOWED_STATE_FIELDS = new Set<string>([...STATE_FIELD_ORDER, "org"]);
const ALLOWED_REGION_FIELDS = new Set(["center", "radius"]);

export interface MapOrg {
  id: string;
  name: string;
}

export interface MapDomainRegion {
  center: [number, number];
  radius: number;
}

export interface MapDomain {
  half: MapDomainHalf;
  id: string;
  name: string;
  owner?: string;
  region: MapDomainRegion;
}

export interface MapContext {
  domainId: string;
  id: string;
  libraryContext?: string;
  name: string;
}

/**
 * A system's PATTERN rule (work-system plan §1, `docs/alexandria/plans/
 * work-system/plan.md`) — one generation rule, e.g. "check and respond to
 * customer emails, every 6h". Time-only in v1: `every` is a duration
 * (`"6h"` | `"1d"` | `"1w"`, hours/days/weeks); meter- and condition-based
 * rules are declared future work (a `kind` discriminator is reserved,
 * absent means `time`).
 */
export interface PatternRule {
  /** Non-empty, unique within the entity's `pattern` list. */
  id: string;
  /** The rule's human-readable name (becomes the spawned card's title). */
  title: string;
  /** A duration like `"6h"`, `"1d"`, or `"1w"` (hours/days/weeks). */
  every: string;
  /**
   * Rule-level delegation: who works the spawned cards. Falls back to the
   * system's own `assignee` when absent.
   */
  assignee?: string;
  /** Optional card-body text carried onto spawned cards. */
  detail?: string;
}

export interface MapEntity {
  /**
   * Who the work item is assigned to — a person, prefix-style
   * (`human:<id>` | `colleague:<id>`, the same scheme as a domain's `owner`).
   * A work-item field allowed on any kind; optional (unassigned = no field).
   * The system's former bare `colleague` folded into this as `colleague:<id>`.
   * For a system entity this reads as the system's OWNER (work-system plan
   * §1, ruling #4) — accountable for its health.
   */
  assignee?: string;
  cadence?: string;
  contextId?: string;
  domainId: string;
  id: string;
  kind: MapEntityKind;
  lifecycle: MapProjectLifecycle | MapSystemLifecycle;
  name: string;
  /**
   * One sentence: what does this system maintain? (anatomy: PURPOSE, work-
   * system plan §1). Optional; harmless but unused on a project.
   */
  purpose?: string;
  /**
   * The generation rules (anatomy: PATTERN, work-system plan §1). System
   * entities only; absent means none (an empty list is rejected rather than
   * accepted as equivalent to absent).
   */
  pattern?: PatternRule[];
  /**
   * A system id: this project is an upgrade project improving that system
   * (work-system plan §1). Project entities only; must resolve to a real
   * system entity.
   */
  upgrades?: string;
}

export interface MapPosition {
  entityId: string;
  entityType: MapPositionEntityType;
  q: number;
  r: number;
}

export interface MapState {
  contexts: MapContext[];
  domains: MapDomain[];
  entities: MapEntity[];
  org?: MapOrg;
  positions: MapPosition[];
}

export class MapStateValidationError extends Data.TaggedError("MapStateValidationError")<{
  readonly message: string;
}> {}

/**
 * A malformed on-disk map-state file (bad JSON or a document that fails
 * validation). Kept distinct from `MapStateValidationError` so the GET route
 * can answer real on-disk corruption with a structured error instead of
 * treating it like a bad POST body.
 */
export class MapStateFileError extends Data.TaggedError("MapStateFileError")<{
  readonly message: string;
}> {}

function validationError(message: string): MapStateValidationError {
  return new MapStateValidationError({ message });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value != null && !Array.isArray(value);
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

function entryRef(label: string, entry: unknown, index: number): string {
  if (isRecord(entry) && typeof entry.id === "string" && entry.id.length > 0) {
    return `${label} ${entry.id}`;
  }
  return `${label} ${index}`;
}

function unknownFieldsIn(record: Record<string, unknown>, allowed: ReadonlySet<string>): string[] {
  return Object.keys(record).filter((key) => !allowed.has(key));
}

function requireString(
  record: Record<string, unknown>,
  field: string,
  ref: string,
): MapStateValidationError | null {
  const value = record[field];
  if (typeof value !== "string" || value.length === 0) {
    return validationError(`${ref} ${field} must be a non-empty string`);
  }
  return null;
}

function validateRegion(value: unknown, ref: string): MapStateValidationError | null {
  if (!isRecord(value)) {
    return validationError(`${ref} region must be an object`);
  }
  const unknownFields = unknownFieldsIn(value, ALLOWED_REGION_FIELDS);
  if (unknownFields.length > 0) {
    return validationError(
      `${ref} region has unknown fields: ${JSON.stringify(unknownFields.sort())}`,
    );
  }
  const center = value.center;
  if (
    !Array.isArray(center) ||
    center.length !== 2 ||
    !center.every((coordinate) => Number.isInteger(coordinate))
  ) {
    return validationError(`${ref} region center must be a [q, r] pair of integers`);
  }
  if (!Number.isInteger(value.radius) || (value.radius as number) < 1) {
    return validationError(`${ref} region radius must be a positive integer`);
  }
  return null;
}

function validateOrg(value: unknown): MapOrg | MapStateValidationError {
  if (!isRecord(value)) {
    return validationError("org must be an object");
  }
  const unknownFields = unknownFieldsIn(value, ALLOWED_ORG_FIELDS);
  if (unknownFields.length > 0) {
    return validationError(`org has unknown fields: ${JSON.stringify(unknownFields.sort())}`);
  }
  for (const field of ORG_FIELD_ORDER) {
    const fieldError = requireString(value, field, "org");
    if (fieldError != null) {
      return fieldError;
    }
  }
  return { id: value.id as string, name: value.name as string };
}

function validateDomains(value: unknown): MapDomain[] | MapStateValidationError {
  if (!Array.isArray(value)) {
    return validationError("domains must be a list");
  }

  const seenIds = new Set<string>();
  const domains: MapDomain[] = [];

  for (const [index, rawDomain] of value.entries()) {
    const ref = entryRef("domain", rawDomain, index + 1);
    if (!isRecord(rawDomain)) {
      return validationError("domains must contain objects");
    }

    const unknownFields = unknownFieldsIn(rawDomain, ALLOWED_DOMAIN_FIELDS);
    if (unknownFields.length > 0) {
      return validationError(`${ref} has unknown fields: ${JSON.stringify(unknownFields.sort())}`);
    }
    const missing = REQUIRED_DOMAIN_FIELDS.filter((field) => !hasOwn(rawDomain, field));
    if (missing.length > 0) {
      return validationError(`${ref} is missing fields: ${JSON.stringify(missing.sort())}`);
    }

    for (const field of ["id", "name"] as const) {
      const fieldError = requireString(rawDomain, field, ref);
      if (fieldError != null) {
        return fieldError;
      }
    }
    if (seenIds.has(rawDomain.id as string)) {
      return validationError(`duplicate domain id ${rawDomain.id as string}`);
    }
    seenIds.add(rawDomain.id as string);

    if (!MAP_DOMAIN_HALVES.some((half) => half === rawDomain.half)) {
      return validationError(
        `${ref} half must be one of ${JSON.stringify([...MAP_DOMAIN_HALVES].sort())}`,
      );
    }
    // `owner` is optional by design: an unowned domain is a demand signal on
    // the map (plan §1.2), not an invalid document.
    if (hasOwn(rawDomain, "owner")) {
      const ownerError = requireString(rawDomain, "owner", ref);
      if (ownerError != null) {
        return ownerError;
      }
    }
    const regionError = validateRegion(rawDomain.region, ref);
    if (regionError != null) {
      return regionError;
    }

    const region = rawDomain.region as Record<string, unknown>;
    const center = region.center as [number, number];
    // Half/center r-sign consistency (see the module header): a work-half
    // domain must sit on the r < 0 side, a personal-half domain on r > 0.
    const half = rawDomain.half as MapDomainHalf;
    const centerR = center[1];
    if (half === "work" ? centerR >= 0 : centerR <= 0) {
      return validationError(
        `${ref} region center r must be ${half === "work" ? "negative" : "positive"} for a ` +
          `${half}-half domain (work is the r < 0 side, personal the r > 0 side; r = 0 is neutral)`,
      );
    }
    domains.push({
      id: rawDomain.id as string,
      name: rawDomain.name as string,
      half: rawDomain.half as MapDomainHalf,
      ...(hasOwn(rawDomain, "owner") ? { owner: rawDomain.owner as string } : {}),
      region: { center: [center[0], center[1]], radius: region.radius as number },
    });
  }

  return domains;
}

function validateContexts(
  value: unknown,
  domainIds: ReadonlySet<string>,
): MapContext[] | MapStateValidationError {
  if (!Array.isArray(value)) {
    return validationError("contexts must be a list");
  }

  const seenIds = new Set<string>();
  const contexts: MapContext[] = [];

  for (const [index, rawContext] of value.entries()) {
    const ref = entryRef("context", rawContext, index + 1);
    if (!isRecord(rawContext)) {
      return validationError("contexts must contain objects");
    }

    const unknownFields = unknownFieldsIn(rawContext, ALLOWED_CONTEXT_FIELDS);
    if (unknownFields.length > 0) {
      return validationError(`${ref} has unknown fields: ${JSON.stringify(unknownFields.sort())}`);
    }
    const missing = REQUIRED_CONTEXT_FIELDS.filter((field) => !hasOwn(rawContext, field));
    if (missing.length > 0) {
      return validationError(`${ref} is missing fields: ${JSON.stringify(missing.sort())}`);
    }

    for (const field of ["id", "name", "domainId"] as const) {
      const fieldError = requireString(rawContext, field, ref);
      if (fieldError != null) {
        return fieldError;
      }
    }
    if (seenIds.has(rawContext.id as string)) {
      return validationError(`duplicate context id ${rawContext.id as string}`);
    }
    seenIds.add(rawContext.id as string);

    if (!domainIds.has(rawContext.domainId as string)) {
      return validationError(`${ref} references unknown domainId ${rawContext.domainId as string}`);
    }
    if (hasOwn(rawContext, "libraryContext")) {
      const libraryContextError = requireString(rawContext, "libraryContext", ref);
      if (libraryContextError != null) {
        return libraryContextError;
      }
    }

    contexts.push({
      id: rawContext.id as string,
      name: rawContext.name as string,
      domainId: rawContext.domainId as string,
      ...(hasOwn(rawContext, "libraryContext")
        ? { libraryContext: rawContext.libraryContext as string }
        : {}),
    });
  }

  return contexts;
}

/**
 * Validates one entity's `pattern` list (work-system plan §1): a non-empty
 * array of PATTERN rules, each with a unique id within the entity, a
 * duration-shaped `every`, and optional rule-level `assignee`/`detail`.
 * Absent means none, so an empty array is rejected rather than accepted as a
 * no-op — callers should omit the field instead.
 */
function validatePatternRules(
  value: unknown,
  entityRef: string,
): PatternRule[] | MapStateValidationError {
  if (!Array.isArray(value)) {
    return validationError(`${entityRef} pattern must be a list`);
  }
  if (value.length === 0) {
    return validationError(
      `${entityRef} pattern must not be an empty list (omit the field for no pattern)`,
    );
  }

  const seenRuleIds = new Set<string>();
  const rules: PatternRule[] = [];

  for (const [index, rawRule] of value.entries()) {
    const ruleRef = `${entityRef} pattern rule ${index + 1}`;
    if (!isRecord(rawRule)) {
      return validationError(`${entityRef} pattern must contain objects`);
    }

    const unknownFields = unknownFieldsIn(rawRule, ALLOWED_PATTERN_RULE_FIELDS);
    if (unknownFields.length > 0) {
      return validationError(
        `${ruleRef} has unknown fields: ${JSON.stringify(unknownFields.sort())}`,
      );
    }
    const missing = REQUIRED_PATTERN_RULE_FIELDS.filter((field) => !hasOwn(rawRule, field));
    if (missing.length > 0) {
      return validationError(`${ruleRef} is missing fields: ${JSON.stringify(missing.sort())}`);
    }

    for (const field of ["id", "title", "every"] as const) {
      const fieldError = requireString(rawRule, field, ruleRef);
      if (fieldError != null) {
        return fieldError;
      }
    }

    const id = rawRule.id as string;
    if (seenRuleIds.has(id)) {
      return validationError(`${entityRef} has duplicate pattern rule id ${id}`);
    }
    seenRuleIds.add(id);

    if (!PATTERN_RULE_EVERY_PATTERN.test(rawRule.every as string)) {
      return validationError(
        `${ruleRef} every must be a duration like "6h", "1d", or "1w" (hours, days, or weeks)`,
      );
    }

    if (hasOwn(rawRule, "assignee")) {
      const assigneeError = requireString(rawRule, "assignee", ruleRef);
      if (assigneeError != null) {
        return assigneeError;
      }
    }
    if (hasOwn(rawRule, "detail")) {
      const detailError = requireString(rawRule, "detail", ruleRef);
      if (detailError != null) {
        return detailError;
      }
    }

    rules.push({
      id,
      title: rawRule.title as string,
      every: rawRule.every as string,
      ...(hasOwn(rawRule, "assignee") ? { assignee: rawRule.assignee as string } : {}),
      ...(hasOwn(rawRule, "detail") ? { detail: rawRule.detail as string } : {}),
    });
  }

  return rules;
}

function validateEntities(
  value: unknown,
  contextIds: ReadonlySet<string>,
  domainIds: ReadonlySet<string>,
): MapEntity[] | MapStateValidationError {
  if (!Array.isArray(value)) {
    return validationError("entities must be a list");
  }

  const seenIds = new Set<string>();
  const entities: MapEntity[] = [];

  for (const [index, rawEntity] of value.entries()) {
    const ref = entryRef("entity", rawEntity, index + 1);
    if (!isRecord(rawEntity)) {
      return validationError("entities must contain objects");
    }

    const unknownFields = unknownFieldsIn(rawEntity, ALLOWED_ENTITY_FIELDS);
    if (unknownFields.length > 0) {
      return validationError(`${ref} has unknown fields: ${JSON.stringify(unknownFields.sort())}`);
    }
    const missing = REQUIRED_ENTITY_FIELDS.filter((field) => !hasOwn(rawEntity, field));
    if (missing.length > 0) {
      return validationError(`${ref} is missing fields: ${JSON.stringify(missing.sort())}`);
    }

    for (const field of ["id", "name"] as const) {
      const fieldError = requireString(rawEntity, field, ref);
      if (fieldError != null) {
        return fieldError;
      }
    }
    if (seenIds.has(rawEntity.id as string)) {
      return validationError(`duplicate entity id ${rawEntity.id as string}`);
    }
    seenIds.add(rawEntity.id as string);

    if (!MAP_ENTITY_KINDS.some((kind) => kind === rawEntity.kind)) {
      return validationError(
        `${ref} kind must be one of ${JSON.stringify([...MAP_ENTITY_KINDS].sort())}`,
      );
    }
    // `contextId` is latent data now (Context is demoted to an optional tag,
    // never required by the Map or Board): optional, but a PRESENT value
    // must still be non-empty and reference a real context — a stray/typo'd
    // contextId fails loudly rather than silently pointing nowhere.
    if (hasOwn(rawEntity, "contextId")) {
      const contextIdError = requireString(rawEntity, "contextId", ref);
      if (contextIdError != null) {
        return contextIdError;
      }
      if (!contextIds.has(rawEntity.contextId as string)) {
        return validationError(
          `${ref} references unknown contextId ${rawEntity.contextId as string}`,
        );
      }
    }
    const domainIdError = requireString(rawEntity, "domainId", ref);
    if (domainIdError != null) {
      return domainIdError;
    }
    if (!domainIds.has(rawEntity.domainId as string)) {
      return validationError(`${ref} references unknown domainId ${rawEntity.domainId as string}`);
    }

    const kind = rawEntity.kind as MapEntityKind;
    const lifecycles = MAP_LIFECYCLES_BY_KIND[kind];
    if (!lifecycles.some((lifecycle) => lifecycle === rawEntity.lifecycle)) {
      return validationError(
        `${ref} lifecycle must be one of ${JSON.stringify([...lifecycles].sort())} for a ${kind}`,
      );
    }

    // `cadence` belongs to the System primitive (loops with a duty rhythm);
    // it stays optional so standing human rhythms are valid systems, and it
    // may not appear on a project.
    if (hasOwn(rawEntity, "cadence")) {
      if (kind !== "system") {
        return validationError(`${ref} cadence is only allowed on system entities`);
      }
      const cadenceError = requireString(rawEntity, "cadence", ref);
      if (cadenceError != null) {
        return cadenceError;
      }
    }

    // `assignee` is a work-item field (who the work is assigned to,
    // prefix-style human:/colleague:), allowed on ANY kind unlike the
    // system-only cadence. Optional; a non-empty string when present. The
    // system's former bare `colleague` folded into this as `colleague:<id>`.
    if (hasOwn(rawEntity, "assignee")) {
      const assigneeError = requireString(rawEntity, "assignee", ref);
      if (assigneeError != null) {
        return assigneeError;
      }
    }

    // `purpose` (anatomy: PURPOSE, work-system plan §1) is a work-item field
    // like assignee: allowed on any kind (systems mainly; harmless on a
    // project), optional, non-empty when present.
    if (hasOwn(rawEntity, "purpose")) {
      const purposeError = requireString(rawEntity, "purpose", ref);
      if (purposeError != null) {
        return purposeError;
      }
    }

    // `pattern` (anatomy: PATTERN) belongs to the System primitive only —
    // the rules that generate cards. Optional; a project may not carry it.
    let pattern: PatternRule[] | undefined;
    if (hasOwn(rawEntity, "pattern")) {
      if (kind !== "system") {
        return validationError(`${ref} pattern is only allowed on system entities`);
      }
      const patternResult = validatePatternRules(rawEntity.pattern, ref);
      if (patternResult instanceof MapStateValidationError) {
        return patternResult;
      }
      pattern = patternResult;
    }

    // `upgrades` belongs to the Project primitive only — an upgrade project
    // linked to the system it improves. Optional; a system may not carry it.
    // The referenced id must resolve to a real system entity; that
    // referential check runs after every entity is known (below), the same
    // deferred pattern positions use against entities.
    if (hasOwn(rawEntity, "upgrades")) {
      if (kind !== "project") {
        return validationError(`${ref} upgrades is only allowed on project entities`);
      }
      const upgradesError = requireString(rawEntity, "upgrades", ref);
      if (upgradesError != null) {
        return upgradesError;
      }
    }

    entities.push({
      id: rawEntity.id as string,
      kind,
      name: rawEntity.name as string,
      ...(hasOwn(rawEntity, "contextId") ? { contextId: rawEntity.contextId as string } : {}),
      domainId: rawEntity.domainId as string,
      ...(hasOwn(rawEntity, "assignee") ? { assignee: rawEntity.assignee as string } : {}),
      ...(hasOwn(rawEntity, "cadence") ? { cadence: rawEntity.cadence as string } : {}),
      ...(hasOwn(rawEntity, "purpose") ? { purpose: rawEntity.purpose as string } : {}),
      ...(pattern != null ? { pattern } : {}),
      ...(hasOwn(rawEntity, "upgrades") ? { upgrades: rawEntity.upgrades as string } : {}),
      lifecycle: rawEntity.lifecycle as MapEntity["lifecycle"],
    });
  }

  // `upgrades` referential check (like position→entity checks): deferred
  // until every entity is known, since an upgrade project may be declared
  // before or after the system it names.
  for (const entity of entities) {
    if (entity.upgrades == null) {
      continue;
    }
    const target = entities.find((candidate) => candidate.id === entity.upgrades);
    if (target == null) {
      return validationError(
        `entity ${entity.id} upgrades references unknown entity id ${entity.upgrades}`,
      );
    }
    if (target.kind !== "system") {
      return validationError(
        `entity ${entity.id} upgrades must reference a system entity, but ${entity.upgrades} is a ${target.kind}`,
      );
    }
  }

  return entities;
}

function validatePositions(
  value: unknown,
  entities: readonly MapEntity[],
): MapPosition[] | MapStateValidationError {
  if (!Array.isArray(value)) {
    return validationError("positions must be a list");
  }

  const entityKindById = new Map(entities.map((entity) => [entity.id, entity.kind]));
  const seenHexes = new Set<string>();
  // Landmark ids live in a different namespace than entity ids (a landmark's
  // free-string id may coincide with a real entity id), so the one-position-
  // per-thing rule is tracked per namespace, not across both.
  const seenEntityKeys = new Set<string>();
  const positions: MapPosition[] = [];

  for (const [index, rawPosition] of value.entries()) {
    const ref = entryRef("position", rawPosition, index + 1);
    if (!isRecord(rawPosition)) {
      return validationError("positions must contain objects");
    }

    const unknownFields = unknownFieldsIn(rawPosition, ALLOWED_POSITION_FIELDS);
    if (unknownFields.length > 0) {
      return validationError(`${ref} has unknown fields: ${JSON.stringify(unknownFields.sort())}`);
    }
    const missing = POSITION_FIELD_ORDER.filter((field) => !hasOwn(rawPosition, field));
    if (missing.length > 0) {
      return validationError(`${ref} is missing fields: ${JSON.stringify(missing.sort())}`);
    }

    if (!Number.isInteger(rawPosition.q) || !Number.isInteger(rawPosition.r)) {
      return validationError(`${ref} q and r must be integers`);
    }
    if (!MAP_POSITION_ENTITY_TYPES.some((entityType) => entityType === rawPosition.entityType)) {
      return validationError(
        `${ref} entityType must be one of ${JSON.stringify([...MAP_POSITION_ENTITY_TYPES].sort())}`,
      );
    }
    const entityIdError = requireString(rawPosition, "entityId", ref);
    if (entityIdError != null) {
      return entityIdError;
    }

    const entityId = rawPosition.entityId as string;
    const entityType = rawPosition.entityType as MapPositionEntityType;
    // Landmarks reference things outside this file (e.g. `colleague:raven`),
    // so only project/system positions are checked against `entities`.
    if (entityType !== "landmark") {
      const kind = entityKindById.get(entityId);
      if (kind == null) {
        return validationError(`${ref} references unknown entityId ${entityId}`);
      }
      if (kind !== entityType) {
        return validationError(
          `${ref} entityType ${entityType} does not match entity ${entityId} kind ${kind}`,
        );
      }
    }

    const hexKey = `${rawPosition.q as number},${rawPosition.r as number}`;
    if (seenHexes.has(hexKey)) {
      return validationError(`duplicate position at hex (${hexKey}): one entity per hex`);
    }
    seenHexes.add(hexKey);

    const entityKey = entityType === "landmark" ? `landmark:${entityId}` : `entity:${entityId}`;
    if (seenEntityKeys.has(entityKey)) {
      return validationError(
        entityType === "landmark"
          ? `duplicate position for landmark ${entityId}`
          : `duplicate position for entity ${entityId}`,
      );
    }
    seenEntityKeys.add(entityKey);

    positions.push({
      q: rawPosition.q as number,
      r: rawPosition.r as number,
      entityType,
      entityId,
    });
  }

  return positions;
}

/**
 * Validates a full map-state document: allowed/required fields, enums,
 * id uniqueness, referential integrity, and the one-entity-per-hex rule.
 * Returns the canonicalized document (stable field order) or the first
 * validation failure.
 */
export function validateMapState(value: unknown): MapState | MapStateValidationError {
  if (!isRecord(value)) {
    return validationError("map state must be an object");
  }

  const unknownFields = unknownFieldsIn(value, ALLOWED_STATE_FIELDS);
  if (unknownFields.length > 0) {
    return validationError(`map state has unknown fields: ${JSON.stringify(unknownFields.sort())}`);
  }
  const missing = STATE_FIELD_ORDER.filter((field) => !hasOwn(value, field));
  if (missing.length > 0) {
    return validationError(`map state is missing fields: ${JSON.stringify(missing.sort())}`);
  }

  const org = hasOwn(value, "org") ? validateOrg(value.org) : undefined;
  if (org instanceof MapStateValidationError) {
    return org;
  }

  const domains = validateDomains(value.domains);
  if (domains instanceof MapStateValidationError) {
    return domains;
  }
  const domainIds = new Set(domains.map((domain) => domain.id));
  const contexts = validateContexts(value.contexts, domainIds);
  if (contexts instanceof MapStateValidationError) {
    return contexts;
  }
  const entities = validateEntities(
    value.entities,
    new Set(contexts.map((context) => context.id)),
    domainIds,
  );
  if (entities instanceof MapStateValidationError) {
    return entities;
  }
  const positions = validatePositions(value.positions, entities);
  if (positions instanceof MapStateValidationError) {
    return positions;
  }

  return { ...(org ? { org } : {}), domains, contexts, entities, positions };
}

export function defaultMapState(): MapState {
  return { domains: [], contexts: [], entities: [], positions: [] };
}

function serializeMapState(state: MapState): string {
  const ordered = {
    ...(state.org ? { org: state.org } : {}),
    domains: state.domains,
    contexts: state.contexts,
    entities: state.entities,
    positions: state.positions,
  };
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

/**
 * The document's revision: a content hash of its canonical serialized form.
 * `GET /api/map/state` serves it as an `ETag`; a writer echoes it back via
 * `If-Match` so a stale full-document POST fails with a structured 409
 * instead of silently clobbering a concurrent write (the S1 concurrency
 * guard — a cheap precondition chosen over read-merge because the document
 * is replaced whole and already has one canonical serialization to hash).
 */
export function mapStateRevision(state: MapState): string {
  return createHash("sha256").update(serializeMapState(state)).digest("hex").slice(0, 16);
}

/**
 * Reads the map-state file. A missing file is not an error: it returns the
 * default empty state without creating the file. A malformed file (bad JSON
 * or a document that fails validation) fails the effect with a
 * `MapStateFileError` — real on-disk corruption, distinct from a bad POST
 * body.
 */
export function readMapState(options: {
  workspacePath: string;
}): Effect.Effect<MapState, Error | MapStateFileError, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const statePath = mapStatePathForWorkspacePath(options.workspacePath);
    const content = yield* fs
      .readText(statePath)
      .pipe(
        Effect.catchAll((error) =>
          isMissingFileError(error) ? Effect.succeed<string | null>(null) : Effect.fail(error),
        ),
      );

    if (content == null) {
      return defaultMapState();
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      return yield* Effect.fail(
        new MapStateFileError({
          message: `Invalid map state JSON at ${statePath}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        }),
      );
    }

    const state = validateMapState(parsed);
    if (state instanceof MapStateValidationError) {
      return yield* Effect.fail(
        new MapStateFileError({ message: `Invalid map state at ${statePath}: ${state.message}` }),
      );
    }

    return state;
  });
}

/**
 * Writes the map-state file atomically (temp file + rename in the same
 * directory), creating `map/` if it does not exist yet, via the shared
 * `FileSystem.writeTextAtomic` effect. The output is pretty-printed with a
 * trailing newline so hand merges stay reviewable.
 */
export function writeMapState(options: {
  state: MapState;
  workspacePath: string;
}): Effect.Effect<void, Error, FileSystem> {
  return Effect.gen(function* () {
    const fs = yield* FileSystem;
    const statePath = mapStatePathForWorkspacePath(options.workspacePath);
    yield* fs.writeTextAtomic(statePath, serializeMapState(options.state));
  });
}
