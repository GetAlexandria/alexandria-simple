#!/usr/bin/env sh
# derive-views.sh — re-derive a play's two review surfaces from its sources.
#
# A play's logic is authored once (brief.md §4) and DERIVED into a Fabro
# workflow package plus generated review renderings. This wrapper emits the
# two renderings, so neither is ever hand-drawn (a hand-edited rendering is a
# Protocol E parity failure — see studio/plays/README.md, "One source,
# derived renderings"):
#
#   <play-dir>/diagram.svg  — the play drawn   (fabro graph workflow.fabro)
#   <play-dir>/story.md     — the play as one story (generate-story.py)
#
# Both are assembled from the same sources as the workflow itself
# (brief.md, workflow.fabro, prompts/), so they cannot drift.
#
# After deriving, this also runs an ADVISORY check of the play's authored
# `moves.md` overlay if one exists (studio/plays/README.md, "Authored explainer
# overlays"). That overlay is authored, not derived, so re-deriving the spine
# here can leave it stale — the check flags that at the moment it happens. It
# never aborts the derive (fixing the overlay is the Author's next step); the
# Lint rung is where it actually gates.
#
# Usage:
#   studio/tools/derive-views.sh <play-dir>
#
# Requires: the `fabro` CLI (on PATH or at ~/.fabro/bin/fabro), python3. `bun`
# is optional — used only for the advisory moves.md overlay check.

set -eu

if [ "$#" -ne 1 ]; then
	echo "usage: $0 <play-dir>" >&2
	exit 2
fi

PLAY_DIR="$1"
TOOLS_DIR="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"

# --- Resolve inputs -------------------------------------------------------
WORKFLOW="$PLAY_DIR/workflow.fabro"
PROMPTS="$PLAY_DIR/prompts"

if [ ! -d "$PLAY_DIR" ]; then
	echo "error: play dir not found: $PLAY_DIR" >&2
	exit 1
fi
if [ ! -f "$WORKFLOW" ]; then
	echo "error: missing workflow.fabro: $WORKFLOW" >&2
	exit 1
fi
if [ ! -d "$PROMPTS" ]; then
	echo "error: missing prompts/ dir: $PROMPTS" >&2
	exit 1
fi

# --- Resolve the fabro CLI (PATH first, then the standard install path) ---
if command -v fabro >/dev/null 2>&1; then
	FABRO="$(command -v fabro)"
elif [ -x "$HOME/.fabro/bin/fabro" ]; then
	FABRO="$HOME/.fabro/bin/fabro"
else
	echo "error: fabro CLI not found on PATH or at ~/.fabro/bin/fabro" >&2
	exit 1
fi

# --- (0) PREFLIGHT: validate the workflow before writing anything ----------
# `fabro graph` validates by default and can fail mid-derivation, leaving
# diagram.svg and story.md out of sync. Validate up front so a bad workflow
# aborts the run before either rendering is touched (keeps the pair atomic).
python3 "$TOOLS_DIR/check-workflow-edges.py" "$WORKFLOW"
if ! "$FABRO" validate --no-upgrade-check "$WORKFLOW"; then
	echo "error: workflow failed validation, aborting (no renderings written): $WORKFLOW" >&2
	exit 1
fi

# --- (a) Draw the play: workflow.fabro -> diagram.svg ---------------------
# Top-down (`-d tb`) by default: a play is a mostly-linear pipeline, so a
# left-right graph renders as an unreadable ~13:1 strip; top-down gives a
# portrait diagram that fits a reading column and the viewer's zoom overlay.
DIAGRAM="$PLAY_DIR/diagram.svg"
STORY="$PLAY_DIR/story.md"
TMP_DIR="$(mktemp -d "$PLAY_DIR/.derive-views.XXXXXX")"
trap 'rm -rf "$TMP_DIR"' EXIT INT HUP TERM
TMP_DIAGRAM="$TMP_DIR/diagram.svg"
TMP_STORY="$TMP_DIR/story.md"

"$FABRO" graph --no-upgrade-check "$WORKFLOW" -d tb -o "$TMP_DIAGRAM"

# --- (a2) Theme the drawing for the workshop's dark page -------------------
# graphviz emits light-on-white with one stroke colour for every node. Recolour
# in place by the play's own semantics (judgment=gold, mechanical=teal, the
# golden path solid, every bounce dashed) so the drawing reads on the dark page
# and carries its key. Deterministic, re-run every derive — still a derived
# rendering, not a hand-edit. Reads brief.md (declared doer) + workflow.fabro.
python3 "$TOOLS_DIR/theme-diagram.py" "$PLAY_DIR" "$TMP_DIAGRAM"

# --- (b) Read the play: brief.md + workflow + prompts -> story.md ----------
# generate-story.py writes the temporary story path here (and logs to stdout).
python3 "$TOOLS_DIR/generate-story.py" "$PLAY_DIR" "$TMP_STORY"

# --- (c) Commit both derived renderings together ---------------------------
# If any step above fails, the trap removes the temp dir and the canonical
# renderings stay untouched. Only a fully generated pair is promoted.
mv "$TMP_DIAGRAM" "$DIAGRAM"
mv "$TMP_STORY" "$STORY"
echo "wrote: $DIAGRAM"
echo "wrote: $STORY"

# --- (d) ADVISORY: re-check the authored moves.md overlay, if present -------
# moves.md is an AUTHORED rendering, not derived, so the spine just rewritten
# above may have outrun it. Flag gaps now, at the moment of change — but never
# abort: the derive succeeded, and updating the overlay is the Author's next
# step, gated for real at Lint. Skipped cleanly when there's no overlay (the
# common case) or no bun. The `|| ...` keeps a non-zero check from tripping -e.
if [ -f "$PLAY_DIR/moves.md" ]; then
	echo "--- checking moves.md overlay (advisory) ---"
	if command -v bun >/dev/null 2>&1; then
		bun "$TOOLS_DIR/check-moves.ts" "$PLAY_DIR" ||
			echo "note: moves.md has gaps after this derive — update it per studio/plays/AUTHORING-moves.md (gated at Lint)" >&2
	else
		echo "note: moves.md present but bun not found — skipped; run: studio/tools/check-moves.ts $PLAY_DIR" >&2
	fi
fi
