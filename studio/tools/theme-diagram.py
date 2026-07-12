#!/usr/bin/env python3
"""Theme a play's derived diagram so it reads on the workshop's dark page.

A post-pass over the SVG that `fabro graph` emits (graphviz default: light
text, one blue stroke for every node, gray edges, no key). It re-colors the
diagram by the play's own semantics so the drawing carries its meaning:

  * judgment moves  -> gold     (a doer reads and decides)
  * mechanical/software moves -> teal  (a closed rule a checker runs)
  * start / exit    -> muted, the terminals
  * the golden path -> solid spine; every other edge (refusals, fix-bounces,
                       the meeting loop) -> dashed and muted

This is still a DERIVED rendering, not a hand-edit: it is deterministic and
re-run every time by `derive-views.sh` right after `fabro graph`, reading the
same sources as the workflow (brief.md for each move's declared doer,
workflow.fabro for the graph shape and the golden path). The legend the
viewer draws under the diagram is keyed to these same categories.

Doer source of truth: brief.md §4 ("doer honesty", studio/plays/README.md).
Falls back to the graph shape (parallelogram / `script=` -> mechanical) when
a move declares no doer.

Usage: theme-diagram.py <play-dir> [diagram-svg]
"""
import re
import sys
from pathlib import Path

from workflow_model import golden_path, parse_workflow

# --- palette (matches the studio dark page + the prototype's key) ----------
BG = "#0e0a06"  # near-black warm; baked in so the diagram reads anywhere
PALETTE = {
    "judgment":   {"stroke": "#d4a052", "fill": "#2a2014"},  # gold
    "mechanical": {"stroke": "#4fb8a8", "fill": "#16221f"},  # teal
    "terminal":   {"stroke": "#8a7a5e", "fill": "#1b1510"},  # muted
}
NODE_TEXT = "#ece4d6"          # light beige, every node label
GOLDEN_EDGE = "#c9a86a"        # warm gold spine
OFFPATH_EDGE = "#7d6f59"       # muted; carries a dash
EDGE_LABEL = "#b7a888"         # readable muted for edge labels

def doer_of(node, attrs, brief):
    """Category for a node: terminal | mechanical | judgment."""
    if attrs.get("shape") in ("Mdiamond", "Msquare") or node in ("start", "exit"):
        return "terminal"
    m = re.search(rf"(?m)^{re.escape(node)}:\s*\n\s*doer:\s*(\w+)", brief)
    if m:
        d = m.group(1).lower()
        if d in ("mechanical", "software"):
            return "mechanical"
        return "judgment"  # judgment, human, anything declared but non-mechanical
    # no declared doer — fall back to graph shape
    if attrs.get("shape") == "parallelogram" or "script" in attrs:
        return "mechanical"
    return "judgment"


# --- SVG surgery (minimal, idempotent; targets graphviz's stable output) ----
def theme_node(block, category):
    p = PALETTE[category]
    block = block.replace('stroke="#357f9e"', f'stroke="{p["stroke"]}"')
    # fill the primary shape (one ellipse or one polygon per node); decorative
    # polylines (the Mdiamond/Msquare cross-strokes) keep fill="none".
    block, n = re.subn(r'(<ellipse )fill="none"', rf'\1fill="{p["fill"]}"', block, count=1)
    if n == 0:
        block = re.sub(r'(<polygon )fill="none"', rf'\1fill="{p["fill"]}"', block, count=1)
    block = block.replace('fill="#1a1a1a"', f'fill="{NODE_TEXT}"')
    return block


def theme_edge(block, golden):
    color = GOLDEN_EDGE if golden else OFFPATH_EDGE
    # edge label first (a <text ... fill="#666666">), so the stroke pass below
    # doesn't have to discriminate.
    block = re.sub(r'(<text[^>]*?)fill="#666666"', rf'\1fill="{EDGE_LABEL}"', block)
    block = block.replace('stroke="#666666"', f'stroke="{color}"')
    block = block.replace('fill="#666666"', f'fill="{color}"')  # arrowhead
    if not golden:
        block = re.sub(r'(<path fill="none"[^>]*?)/>', r'\1 stroke-dasharray="5,4"/>', block, count=1)
    return block


def main(play_dir, diagram_path=None):
    play = Path(play_dir)
    brief = (play / "brief.md").read_text()
    nodes, edges = parse_workflow((play / "workflow.fabro").read_text())
    order = golden_path(edges)

    golden_edges = set()
    if order:
        chain = ["start", *order, "exit"]
        golden_edges = {(chain[i], chain[i + 1]) for i in range(len(chain) - 1)}

    cats = {n: doer_of(n, a, brief) for n, a in nodes.items()}
    used = sorted({cats[n] for n in nodes}, key=["judgment", "mechanical", "terminal"].index)

    svg_path = Path(diagram_path) if diagram_path is not None else play / "diagram.svg"
    svg = svg_path.read_text()

    # 1) replace graphviz's prefers-color-scheme block with a themed marker;
    #    colors are baked into elements now, so no media query is needed.
    svg = re.sub(
        r"<style>.*?</style>",
        "<!-- themed by studio/tools/theme-diagram.py: colors keyed to move doer -->",
        svg, count=1, flags=re.S,
    )

    # 2) bake a dark background so the diagram reads on any surface (guarded:
    #    re-runs won't stack rects).
    if 'data-theme-bg' not in svg:
        vb = re.search(r'viewBox="([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"', svg)
        x, y, w, h = (vb.group(i) for i in range(1, 5)) if vb else ("0", "0", "100%", "100%")
        rect = f'<rect data-theme-bg="1" x="{x}" y="{y}" width="{w}" height="{h}" fill="{BG}"/>\n'
        svg = re.sub(r'(<g id="graph0"[^>]*>)', rect + r"\1", svg, count=1)

    # 3) recolor every node by its doer category
    def node_sub(m):
        title = re.search(r"<title>(.*?)</title>", m.group(0))
        cat = cats.get(title.group(1) if title else "", "judgment")
        return theme_node(m.group(0), cat)

    svg = re.sub(r'<g id="node\d+" class="node">.*?</g>', node_sub, svg, flags=re.S)

    # 4) recolor every edge by whether it rides the golden path
    def edge_sub(m):
        title = re.search(r"<title>(.*?)</title>", m.group(0))
        pair = None
        if title:
            t = title.group(1).replace("&#45;", "-").replace("&gt;", ">")
            if "->" in t:
                a, b = t.split("->", 1)
                pair = (a, b)
        return theme_edge(m.group(0), pair in golden_edges)

    svg = re.sub(r'<g id="edge\d+" class="edge">.*?</g>', edge_sub, svg, flags=re.S)

    svg_path.write_text(svg)
    print(f"themed: {svg_path}  ({len(order)} on the golden path; categories: {', '.join(used)})")


if __name__ == "__main__":
    if len(sys.argv) not in (2, 3):
        print("usage: theme-diagram.py <play-dir> [diagram-svg]", file=sys.stderr)
        sys.exit(2)
    main(sys.argv[1], sys.argv[2] if len(sys.argv) == 3 else None)
