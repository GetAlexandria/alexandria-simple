#!/usr/bin/env python3
"""Check Studio Fabro workflows for failure-blind ACP transitions.

Fabro evaluates matching conditions before falling back to preferred labels and
unconditional edges. For an ACP agent node, a failed outcome needs an explicit
conditional edge to a nonzero command node; otherwise failure can fall through
to the normal next move.

A node may ALSO route a *designed* decision into the same loud-failure sink — a
survey refusal, a check FREEZE, a three-strikes escalation. That is not a
failure-blind fall-through: it is safe because the node still fails closed via
its own outcome!=succeeded edge, so a genuine ACP failure is always caught
regardless. Such a designed sink edge is permitted when it is explicitly labeled
and does not fire on success; a bare or success-conditioned sink edge remains a
bug.

Usage:
  studio/tools/check-workflow-edges.py <workflow.fabro>
"""

from __future__ import annotations

import re
import sys
from dataclasses import dataclass
from pathlib import Path


ATTR_RE = re.compile(
    r'([\w.]+)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|([^,\]\s]+))',
)
NODE_MULTI_RE = re.compile(
    r"^\s{2,}([A-Za-z_]\w*)\s*\[\s*\n(.*?)^\s{2,}\]",
    re.M | re.S,
)
NODE_SINGLE_RE = re.compile(r"^\s{2,}([A-Za-z_]\w*)\s*\[([^\n\[\]]*)\]\s*$", re.M)
EDGE_RE = re.compile(r"^\s*([A-Za-z_]\w*)\s*->\s*([A-Za-z_]\w*)\s*(?:\[(.*?)\])?\s*$")


@dataclass(frozen=True)
class Node:
    name: str
    attrs: dict[str, str]
    line: int


@dataclass(frozen=True)
class Edge:
    src: str
    dst: str
    attrs: dict[str, str]
    line: int


@dataclass(frozen=True)
class Problem:
    line: int
    message: str


def parse_attrs(raw: str) -> dict[str, str]:
    attrs: dict[str, str] = {}
    for match in ATTR_RE.finditer(raw):
        value = match.group(2) if match.group(2) is not None else match.group(3)
        attrs[match.group(1)] = (value or "").replace('\\"', '"')
    shape = re.search(r"\bshape\s*=\s*(\w+)", raw)
    if shape and "shape" not in attrs:
        attrs["shape"] = shape.group(1)
    return attrs


def line_number(text: str, index: int) -> int:
    return text.count("\n", 0, index) + 1


def parse_workflow(text: str) -> tuple[dict[str, Node], list[Edge]]:
    nodes: dict[str, Node] = {}
    for match in NODE_MULTI_RE.finditer(text):
        nodes[match.group(1)] = Node(
            name=match.group(1),
            attrs=parse_attrs(match.group(2)),
            line=line_number(text, match.start()),
        )
    for match in NODE_SINGLE_RE.finditer(text):
        nodes[match.group(1)] = Node(
            name=match.group(1),
            attrs=parse_attrs(match.group(2)),
            line=line_number(text, match.start()),
        )

    edges: list[Edge] = []
    for line_no, line in enumerate(text.splitlines(), start=1):
        match = EDGE_RE.match(line)
        if not match:
            continue
        edges.append(
            Edge(
                src=match.group(1),
                dst=match.group(2),
                attrs=parse_attrs(match.group(3) or ""),
                line=line_no,
            )
        )
    return nodes, edges


def is_acp_node(node: Node | None) -> bool:
    if node is None:
        return False
    return (
        node.attrs.get("backend") == "acp"
        or "acp.command" in node.attrs
        or "acp.config" in node.attrs
    )


def is_failure_sink(node: Node | None, edges: list[Edge]) -> bool:
    if node is None:
        return False
    script = node.attrs.get("script", "")
    is_command = (
        node.attrs.get("type") == "command"
        or node.attrs.get("shape") == "parallelogram"
        or "script" in node.attrs
    )
    has_outgoing = any(edge.src == node.name for edge in edges)
    return is_command and "exit 1" in script and not has_outgoing


def asserts_success(condition: str) -> bool:
    return "outcome=succeeded" in condition.replace(" ", "")


def is_failure_condition(condition: str) -> bool:
    return "outcome" in condition and not asserts_success(condition)


def unsafe_edges(nodes: dict[str, Node], edges: list[Edge]) -> list[Problem]:
    problems: list[Problem] = []
    acp_nodes = [node for node in nodes.values() if is_acp_node(node)]
    for node in acp_nodes:
        outgoing = [edge for edge in edges if edge.src == node.name]
        has_failure_fallback = any(
            is_failure_sink(nodes.get(edge.dst), edges)
            and is_failure_condition(edge.attrs.get("condition", ""))
            for edge in outgoing
        )
        if outgoing and not has_failure_fallback:
            problems.append(
                Problem(
                    line=node.line,
                    message=(
                        f"{node.name} needs a conditional fallback to a command node "
                        'that exits 1, e.g. condition="outcome!=succeeded"'
                    ),
                )
            )
        for edge in outgoing:
            if is_failure_sink(nodes.get(edge.dst), edges):
                condition = edge.attrs.get("condition", "")
                if is_failure_condition(condition):
                    continue
                # A designed route to the shared loud-failure sink — a survey
                # refusal, a check FREEZE, a three-strikes escalation — is an
                # intentional decision, not a failure-blind fall-through. It is
                # safe precisely because the node still fails closed via its own
                # outcome!=succeeded edge (has_failure_fallback, asserted above),
                # so a genuine ACP failure is always caught regardless of this
                # edge. Permit it when it is explicitly labeled and does not fire
                # on success; a bare or success-conditioned sink edge is still a
                # bug and is flagged.
                label = edge.attrs.get("label", "")
                if has_failure_fallback and label and not asserts_success(condition):
                    continue
                problems.append(
                    Problem(
                        line=edge.line,
                        message=(
                            f"{edge.src} -> {edge.dst} failure sink edge needs a "
                            "non-success outcome condition (or, for a designed "
                            "route to the shared sink, an explicit label while the "
                            "node keeps its outcome!=succeeded fallback)"
                        ),
                    )
                )
                continue

            condition = edge.attrs.get("condition", "")
            if condition:
                if not asserts_success(condition):
                    problems.append(
                        Problem(
                            line=edge.line,
                            message=(
                                f"{edge.src} -> {edge.dst} non-failure condition must be "
                                "guarded by outcome=succeeded"
                            ),
                        )
                    )
                continue
    return problems


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: check-workflow-edges.py <workflow.fabro>", file=sys.stderr)
        return 2

    workflow = Path(sys.argv[1])
    text = workflow.read_text()
    nodes, edges = parse_workflow(text)
    problems = unsafe_edges(nodes, edges)
    if not problems:
        print(f"OK: {workflow} ACP edges are outcome-guarded")
        return 0

    print(f"error: {workflow} has ACP edges that can advance after node failure:", file=sys.stderr)
    for problem in problems:
        print(f"  line {problem.line}: {problem.message}", file=sys.stderr)
    print(
        'Use a conditional failure fallback, e.g. condition="outcome!=succeeded", '
        "to a command node that exits 1. Leave normal labeled routes unconditioned "
        "so preferred_label can select them.",
        file=sys.stderr,
    )
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
