import type { LibraryBundle } from "./library-bundle-registry";

// The Builder section's bundle selector (issue #613, S5 Builder assembly): a
// dropdown, top of section, enumerating the checked-in registry and showing
// the active bundle. Selecting a bundle re-points every builder surface at
// it via the `?bundle=` route param (see viewer-routes.ts withBuilderBundle).
// The selector shows labels only, never registry internals (root paths,
// patch log paths) — those are implementation detail, not on-screen spec.
export function BuilderBundleSelector({
  bundles,
  onSelect,
  selectedBundleId,
  unknownBundleId,
}: {
  bundles: readonly LibraryBundle[];
  onSelect(bundleId: string): void;
  selectedBundleId: string;
  // An unresolved `?bundle=` id (issue: "unknown bundle" empty state):
  // renders an explicit disabled placeholder option carrying that id, so the
  // controlled <select> always has a matching <option> and never falls back
  // to the browser's blank/first-option display for a value with no match.
  unknownBundleId?: string;
}) {
  return (
    <label
      className="flex items-center gap-2 border border-[color:var(--viewer-canvas-rule)] bg-[color:var(--viewer-canvas-slate)] px-3 py-1.5 text-[color:var(--viewer-canvas-fg-dim)]"
      data-testid="builder-bundle-selector"
    >
      <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--viewer-canvas-fg-dim)]">
        Bundle
      </span>
      <select
        aria-label="Bundle"
        className="h-7 border border-[color:var(--viewer-canvas-panel-bd)] bg-[color:var(--viewer-canvas-slate-2)] px-2 font-sans text-[12px] text-[color:var(--viewer-canvas-amber-glow)]"
        onChange={(event) => onSelect(event.target.value)}
        value={selectedBundleId}
      >
        {unknownBundleId != null ? (
          <option disabled value={unknownBundleId}>
            {`Unknown bundle: ${unknownBundleId}`}
          </option>
        ) : null}
        {bundles.map((bundle) => (
          <option key={bundle.id} value={bundle.id}>
            {bundle.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// The "unknown bundle" empty state (an unresolvable `?bundle=` id): a clear
// message naming the bad id, never a crash and never a silent fallback to the
// default bundle.
export function BuilderUnknownBundleEmptyState({ bundleId }: { bundleId: string }) {
  return (
    <div
      className="raven-etched-note raven-etched-note-danger m-7 border border-dashed border-[color:var(--viewer-canvas-danger)] p-6 text-[13px]"
      data-testid="builder-unknown-bundle"
    >
      <h3 className="font-display text-[20px] font-semibold text-[color:var(--viewer-engine-confidence-low-text)]">
        Unknown bundle
      </h3>
      <p className="mt-2 max-w-[680px] break-words text-[14px] leading-6">
        No bundle named <span className="font-mono">{bundleId}</span> is in the registry. Choose a
        bundle from the selector above.
      </p>
    </div>
  );
}

// The Builder's registry-unavailable empty state (a malformed/empty checked-
// in library-bundles.json): another explicit error state, never a crash.
export function BuilderRegistryUnavailable({ message }: { message: string }) {
  return (
    <div
      className="raven-etched-note raven-etched-note-danger m-7 border border-dashed border-[color:var(--viewer-canvas-danger)] p-6 text-[13px]"
      data-testid="builder-registry-unavailable"
    >
      <h3 className="font-display text-[20px] font-semibold text-[color:var(--viewer-engine-confidence-low-text)]">
        Bundle registry unavailable
      </h3>
      <p className="mt-2 max-w-[680px] break-words text-[14px] leading-6">{message}</p>
    </div>
  );
}
