---
name: empty-library-confirm
description: >
  Raven's procedure for running EL4 Empty Library Confirm: open a post-EL3
  draft bundle as a body-free catalog, guide the director's structural review,
  and record either a user-authored library.confirmed Ledger event or a
  structure-only rejection edit list routed back to EL3.
---

# Empty Library Confirm

Use this skill when the director wants to run **EL4 Empty Library Confirm** or
when a library confirmation/rejection event needs interpretation.

You are Raven. You may guide the director through the catalog, but you cannot
approve the bundle yourself. The confirm event is a human ruling:
`actor.kind = user`.

## Triggers

- The director asks to confirm a post-EL3 empty-library bundle.
- The director asks whether a bundle/version is approved for atomization.
- A `library.confirmed` or `library.confirmation_rejected` event appears in the
  Ledger and needs interpretation.
- EL3 completes and hands over a draft bundle for final structural review.

## Open The Catalog

Check the bundle gate state:

```bash
ax internal library-confirm status --bundle /abs/path/to/bundle --json
```

Start the viewer if needed:

```bash
ax start viewer
```

Open:

```text
http://127.0.0.1:4321/library/empty?bundlePath=/abs/path/to/bundle
```

If the status output includes a product or version mismatch, do not work around
it. Ask for the correct bundle or send the bundle back through EL3 finalize.

## Review Discipline

Keep the review at catalog altitude:

- context boundaries;
- noun placements;
- plane assignments;
- relationship topology;
- explicit gaps and provenance.

Do not ask for card body prose. Do not review body content. Do not tell the
director that a bundle is approved unless a matching `library.confirmed` event
exists for the exact product, path, and version.

## Confirm

Only after the director explicitly says to approve the structure, record the
gate through AX:

```bash
ax internal library-confirm confirm --bundle /abs/path/to/bundle --json
```

Then verify the event is visible:

```bash
ax inspect events list --type library.confirmed --json --limit 5
```

Report the product, bundle path, library version, and event id. If the command
returns `already_appended`, treat that as the existing approval, not a new one.

## Reject

If the director wants edits, record a structure-only edit list:

```bash
ax internal library-confirm reject \
  --bundle /abs/path/to/bundle \
  --edit-list '[{"kind":"context_boundary","target":"<area>","requestedChange":"<change>"}]' \
  --json
```

Valid edit kinds are:

- `context_boundary`
- `noun_placement`
- `plane_assignment`
- `relationship_topology`

A rejection appends no `library.confirmed` event. Route the bundle back to
`front-of-house-walk` with the edit list. Do not treat a polite rejection,
partial acceptance, or empty edit list as approval.

## Never

- Never self-approve the bundle.
- Never append or edit `events.jsonl` directly.
- Never hand-set approval in card frontmatter, bundle metadata, or config.
- Never let version `N` approval cover version `N+1`.
- Never fill, rewrite, or request card bodies in EL4.
