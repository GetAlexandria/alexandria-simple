// The Map tab's entity create/edit form (S2, plan §1.1): name, kind, domain,
// context (optional — latent data), lifecycle, and cadence + colleague for
// systems. The colleague input folds into the entity's work-item `assignee`
// (colleague:<id>) through placement.ts's entityFromDraft — the full
// assignee picker (humans too, and projects) is a later PR. Pure form — the
// caller turns the submitted draft into the next full document via
// placement.ts (withEntityCreated / withEntityEdited) and saves it through
// useMapState's revision-guarded POST. Kind is create-only (see
// MapEntityDraft); editing shows it fixed.
//
// Work-system plan §1 additions (WS1 — data model only, no room UI): systems
// gain PURPOSE and a minimal PATTERN editor; projects gain an "Upgrades
// system" picker. Both are gated by kind in placement.ts's entityFromDraft,
// so switching kind mid-edit can't leak a system-only or project-only field
// onto the wrong entity.

import { useState } from "react";
import type { MapContext, MapDomain, MapEntity, MapEntityKind } from "../../app/runtime/schemas";
import { MAP_FALLBACK_COLORS } from "./colors";
import { ParchmentActionButton } from "./panel-buttons";
import {
  lifecyclesForKind,
  type MapEntityDraft,
  type MapEntityPatternRuleDraft,
} from "./placement";
import { ASSIGNEE_OPTIONS, assigneeColleagueId } from "./vocabulary";

const FIELD_LABEL_CLASS = "flex flex-col gap-0.5 text-[10px] font-semibold uppercase tracking-wide";
// w-full + min-w-0 keep side-by-side inputs from overflowing the w-64 panel
// (a bare <input>'s intrinsic minimum width is ~20 characters).
const INPUT_CLASS =
  "w-full min-w-0 rounded border px-2 py-1 text-[11px] font-normal normal-case tracking-normal";

/** An empty PATTERN row — what "Add rule" appends. */
const EMPTY_PATTERN_ROW: MapEntityPatternRuleDraft = { title: "", every: "", assignee: "" };

type MapEntityFormProps = {
  contexts: readonly MapContext[];
  /** Required domain picker's options — the shared Map/Board spine every entity carries. */
  domains: readonly MapDomain[];
  /** Null → create form; an entity → edit form (kind fixed). */
  entity: MapEntity | null;
  /**
   * The map's full entity set — sourced for the "Upgrades system" picker
   * (project kind: every system entity on the map, work-system plan §1).
   */
  entities: readonly MapEntity[];
  /**
   * Create-only initial kind (board-project-rooms: the Board's separate "New
   * project" / "New system" entry points preset this rather than always
   * landing on "project"). Ignored once `entity` is set — an edit's kind
   * always comes from the entity itself.
   */
  defaultKind?: MapEntityKind;
  onCancel: () => void;
  /** Resolves true when the save landed; the form then closes upstream. */
  onSubmit: (draft: MapEntityDraft) => Promise<boolean>;
  saving: boolean;
};

export function MapEntityForm({
  contexts,
  domains,
  entity,
  entities,
  defaultKind,
  onCancel,
  onSubmit,
  saving,
}: MapEntityFormProps) {
  const [name, setName] = useState(entity?.name ?? "");
  const [kind, setKind] = useState<MapEntityKind>(entity?.kind ?? defaultKind ?? "project");
  // Context is latent data now: no fallback to "the first context" — a new
  // entity defaults to no context, same as a new board card.
  const [contextId, setContextId] = useState(entity?.contextId ?? "");
  // Domain is required and no longer derived from context at read time: it
  // defaults to the entity's own domain on edit, else the first domain on
  // the map for a new entity (a new entity starts with no context picked,
  // so there is no context to derive an initial domain from).
  const [domainId, setDomainId] = useState(entity?.domainId ?? domains[0]?.id ?? "");
  const [lifecycle, setLifecycle] = useState(entity?.lifecycle ?? lifecyclesForKind(kind)[0]!);
  const [cadence, setCadence] = useState(entity?.cadence ?? "");
  // Prefill the bare colleague id from the entity's assignee when it is
  // colleague-kind (the fold's read side); a human-assigned system shows blank.
  const [colleague, setColleague] = useState(assigneeColleagueId(entity?.assignee) ?? "");
  // System-only (work-system plan §1): PURPOSE and the PATTERN rows. A rule
  // starts with an empty row on create so the panel isn't a bare "Add rule"
  // button; editing prefills one row per existing rule.
  const [purpose, setPurpose] = useState(entity?.purpose ?? "");
  const [patternRows, setPatternRows] = useState<MapEntityPatternRuleDraft[]>(
    entity?.pattern?.map((rule) => ({
      title: rule.title,
      every: rule.every,
      assignee: rule.assignee ?? "",
    })) ?? [],
  );
  // Project-only (work-system plan §1): the system this project upgrades.
  const [upgrades, setUpgrades] = useState(entity?.upgrades ?? "");

  const systemOptions = entities.filter((candidate) => candidate.kind === "system");

  function updatePatternRow(index: number, next: Partial<MapEntityPatternRuleDraft>) {
    setPatternRows((rows) => rows.map((row, i) => (i === index ? { ...row, ...next } : row)));
  }

  const nameError = name.trim().length === 0 ? "Name is required." : null;
  const domainError = domainId.length === 0 ? "Pick a domain." : null;
  const formError = nameError ?? domainError;

  const inputStyle = {
    backgroundColor: MAP_FALLBACK_COLORS.field,
    borderColor: MAP_FALLBACK_COLORS.border,
    color: MAP_FALLBACK_COLORS.heading,
  };
  const labelStyle = { color: MAP_FALLBACK_COLORS.subtext };

  return (
    <form
      className="flex flex-col gap-2 px-3 py-2"
      data-testid="map-entity-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (formError != null || saving) {
          return;
        }
        void onSubmit({
          cadence,
          colleague,
          contextId,
          domainId,
          kind,
          lifecycle,
          name,
          pattern: patternRows,
          purpose,
          upgrades,
        });
      }}
    >
      <p className="text-xs font-semibold" style={{ color: MAP_FALLBACK_COLORS.heading }}>
        {entity == null ? "New entity" : `Editing ${entity.name}`}
      </p>

      <label className={FIELD_LABEL_CLASS} style={labelStyle}>
        Name
        <input
          aria-label="Entity name"
          className={INPUT_CLASS}
          onChange={(event) => setName(event.target.value)}
          style={inputStyle}
          value={name}
        />
      </label>

      <div className="flex gap-2">
        <label className={`${FIELD_LABEL_CLASS} flex-1`} style={labelStyle}>
          Kind
          <select
            aria-label="Entity kind"
            className={INPUT_CLASS}
            disabled={entity != null}
            onChange={(event) => {
              const nextKind = event.target.value as MapEntityKind;
              setKind(nextKind);
              setLifecycle(lifecyclesForKind(nextKind)[0]!);
            }}
            style={inputStyle}
            value={kind}
          >
            <option value="project">Project</option>
            <option value="system">System</option>
          </select>
        </label>
        <label className={`${FIELD_LABEL_CLASS} flex-1`} style={labelStyle}>
          Lifecycle
          <select
            aria-label="Entity lifecycle"
            className={INPUT_CLASS}
            onChange={(event) => setLifecycle(event.target.value)}
            style={inputStyle}
            value={lifecycle}
          >
            {lifecyclesForKind(kind).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex gap-2">
        <label className={`${FIELD_LABEL_CLASS} flex-1`} style={labelStyle}>
          Domain
          <select
            aria-label="Entity domain"
            className={INPUT_CLASS}
            onChange={(event) => {
              const nextDomainId = event.target.value;
              setDomainId(nextDomainId);
              // Keep the pair consistent the other way too: a picked
              // context that no longer matches the new domain is cleared
              // rather than left silently disagreeing with domainId.
              const context = contexts.find((candidate) => candidate.id === contextId);
              if (context != null && context.domainId !== nextDomainId) {
                setContextId("");
              }
            }}
            style={inputStyle}
            value={domainId}
          >
            {domains.length === 0 ? <option value="">No domains available</option> : null}
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.name}
              </option>
            ))}
          </select>
        </label>
        <label className={`${FIELD_LABEL_CLASS} flex-1`} style={labelStyle}>
          Context (optional)
          <select
            aria-label="Entity context"
            className={INPUT_CLASS}
            onChange={(event) => {
              const nextContextId = event.target.value;
              setContextId(nextContextId);
              // Picking a context adopts its domain — Context is latent
              // data, but when it's set it should still agree with domainId.
              if (nextContextId.length > 0) {
                const context = contexts.find((candidate) => candidate.id === nextContextId);
                if (context != null) {
                  setDomainId(context.domainId);
                }
              }
            }}
            style={inputStyle}
            value={contextId}
          >
            <option value="">No context</option>
            {contexts.map((context) => (
              <option key={context.id} value={context.id}>
                {context.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {kind === "system" ? (
        <>
          <div className="flex gap-2">
            {/* Entity-level assignee: labeled "Assignee" — director ruling
                (2026-07-14) overrode the plan's earlier "Owner"-label idea:
                the field says what it is, no front-name/back-name split. */}
            <label className={`${FIELD_LABEL_CLASS} flex-1`} style={labelStyle}>
              Assignee
              <input
                aria-label="System assignee"
                className={INPUT_CLASS}
                onChange={(event) => setColleague(event.target.value)}
                placeholder="raven, damien…"
                style={inputStyle}
                value={colleague}
              />
            </label>
            <label className={`${FIELD_LABEL_CLASS} flex-1`} style={labelStyle}>
              Cadence
              <input
                aria-label="System cadence"
                className={INPUT_CLASS}
                onChange={(event) => setCadence(event.target.value)}
                placeholder="30m, weekly…"
                style={inputStyle}
                value={cadence}
              />
            </label>
          </div>

          <label className={FIELD_LABEL_CLASS} style={labelStyle}>
            Purpose (optional)
            <input
              aria-label="System purpose"
              className={INPUT_CLASS}
              onChange={(event) => setPurpose(event.target.value)}
              placeholder="What does this system maintain?"
              style={inputStyle}
              value={purpose}
            />
          </label>

          <div className="flex flex-col gap-1">
            <p className={FIELD_LABEL_CLASS} style={labelStyle}>
              Pattern (optional)
            </p>
            {patternRows.map((row, index) => (
              <div
                className="flex flex-col gap-1 rounded border p-1.5"
                key={index}
                style={inputStyle}
              >
                <input
                  aria-label={`Pattern rule ${index + 1} title`}
                  className={INPUT_CLASS}
                  onChange={(event) => updatePatternRow(index, { title: event.target.value })}
                  placeholder="Rule title"
                  style={inputStyle}
                  value={row.title}
                />
                <div className="flex gap-1">
                  <input
                    aria-label={`Pattern rule ${index + 1} every`}
                    className={INPUT_CLASS}
                    onChange={(event) => updatePatternRow(index, { every: event.target.value })}
                    placeholder="6h / 1d / 1w / 1mo / 1q / 1y"
                    style={inputStyle}
                    value={row.every}
                  />
                  <select
                    aria-label={`Pattern rule ${index + 1} assignee`}
                    className={INPUT_CLASS}
                    onChange={(event) => updatePatternRow(index, { assignee: event.target.value })}
                    style={inputStyle}
                    value={row.assignee ?? ""}
                  >
                    <option value="">System assignee</option>
                    {ASSIGNEE_OPTIONS.map((option) => (
                      <option key={option.ref} value={option.ref}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
                <ParchmentActionButton
                  label="Remove rule"
                  onClick={() => setPatternRows((rows) => rows.filter((_, i) => i !== index))}
                />
              </div>
            ))}
            <ParchmentActionButton
              label="Add rule"
              onClick={() => setPatternRows((rows) => [...rows, { ...EMPTY_PATTERN_ROW }])}
            />
          </div>
        </>
      ) : null}

      {kind === "project" ? (
        <label className={FIELD_LABEL_CLASS} style={labelStyle}>
          Upgrades system (optional)
          <select
            aria-label="Project upgrades system"
            className={INPUT_CLASS}
            onChange={(event) => setUpgrades(event.target.value)}
            style={inputStyle}
            value={upgrades}
          >
            <option value="">None</option>
            {systemOptions.map((system) => (
              <option key={system.id} value={system.id}>
                {system.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="flex items-center gap-2">
        <ParchmentActionButton
          disabled={saving || formError != null}
          label={entity == null ? "Create entity" : "Save entity"}
          testId="map-entity-form-submit"
          type="submit"
        />
        <ParchmentActionButton label="Cancel" onClick={onCancel} />
      </div>
      {formError != null ? (
        <p className="text-[10px]" style={{ color: MAP_FALLBACK_COLORS.subtext }}>
          {formError}
        </p>
      ) : null}
    </form>
  );
}
