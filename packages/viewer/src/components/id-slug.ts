// Shared id-slug primitives used by both the Info Hub board's card ids
// (InfoHubBoardView.createCardId) and the Map tab's entity ids
// (placement.entityIdForDraft). Kept in one place so the slug shape and the
// unique-suffix scheme can't drift apart between the two callers again (they
// had already split to 60- vs 70-char caps before this was shared).

/** Lowercase, dash-joined, trimmed slug of `text`, capped at `maxLength` characters. */
export function slugify(text: string, maxLength = 64): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
}

/** `base`, or `base-2`, `base-3`, … — the first value not already in `existingIds`. */
export function uniqueId(base: string, existingIds: ReadonlySet<string>): string {
  let id = base;
  let suffix = 2;
  while (existingIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}
