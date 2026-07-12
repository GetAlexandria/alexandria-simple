"""Shared parser helpers for Studio Fabro workflow renderers."""

import re

GOLDEN_LABELS = {"Proceed", "Pass", "Release", "Done"}


def parse_workflow(text):
    nodes, edges = {}, []

    def record(name, attrs):
        nodes[name] = dict(re.findall(r'([\w.]+)\s*=\s*"((?:[^"\\]|\\.)*)"', attrs))
        shape = re.search(r"\bshape\s*=\s*(\w+)", attrs)
        if shape:
            nodes[name]["shape"] = shape.group(1)
        if re.search(r"\bscript\s*=", attrs) and "script" not in nodes[name]:
            nodes[name]["script"] = "1"

    # Multi-line node blocks. A script= value can itself contain `[ ]`, so match
    # to the dedented bracket, not the first closing bracket. Indent is `\s{2,}`
    # (not a fixed 4) so reverse-derived non-Raven builds (e.g. 2-space .fabro)
    # parse too.
    for match in re.finditer(r"^\s{2,}(\w+)\s*\[\s*\n(.*?)^\s{2,}\]", text, re.S | re.M):
        record(match.group(1), match.group(2))
    # Single-line node blocks, used by terminals such as start/exit.
    for match in re.finditer(r"^\s{2,}(\w+)\s*\[([^\n\[\]]*)\]\s*$", text, re.M):
        record(match.group(1), match.group(2))
    for match in re.finditer(r"^\s*(\w+)\s*->\s*(\w+)\s*(?:\[(.*?)\])?\s*$", text, re.M):
        src, dst, attrs = match.group(1), match.group(2), match.group(3) or ""
        edge_attrs = dict(re.findall(r'([\w.]+)\s*=\s*"((?:[^"\\]|\\.)*)"', attrs))
        edges.append((src, dst, edge_attrs))
    return nodes, edges


def golden_path(edges):
    order, cur, seen = [], "start", set()
    while cur != "exit" and cur not in seen:
        seen.add(cur)
        if cur != "start":
            order.append(cur)
        outs = [edge for edge in edges if edge[0] == cur]
        nxt = next(
            (
                dst
                for _, dst, attrs in outs
                if attrs.get("label") in GOLDEN_LABELS and dst not in seen
            ),
            None,
        )
        if not nxt:
            nxt = next((dst for _, dst, _ in outs if dst not in seen), None)
        if not nxt:
            break
        cur = nxt
    return order
