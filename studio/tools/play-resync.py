#!/usr/bin/env python3
"""Re-sync a Studio play after an edit.

The command detects changes against the last Re-sync checkpoint, computes the
stale downstream cone over the Studio E1-E16 artifact graph, runs mechanical
derivations and invariant gates where safe, and emits authoring work orders for
everything it must not invent.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import asdict, dataclass
from datetime import date
from pathlib import Path
from typing import Any


STATE_FILE = "play-re-sync-state.json"
RUNTIME_VERIFIER_FILE = "play-re-sync-verdict.json"
RUNTIME_CAMPAIGN_BUDGET = 1
STAGES = ["backlog", "sourced", "designed", "built", "proven", "live"]


@dataclass(frozen=True)
class Edge:
    id: str
    source: str
    target: str
    disposition: str
    title: str
    executor: str | None = None
    work_order_reason: str | None = None
    catch_title: str | None = None


EDGES: list[Edge] = [
    Edge(
        "E1",
        "brief.section4",
        "workflow.fabro",
        "needs-authoring",
        "Project the brief move graph into workflow.fabro",
        work_order_reason=(
            "The move graph changed; Re-sync cannot design or project the "
            "workflow shape on its own."
        ),
    ),
    Edge(
        "E2",
        "workflow.fabro",
        "diagram.svg",
        "auto-derivable",
        "Re-derive the play diagram",
        executor="derive-views.sh",
    ),
    Edge(
        "E3",
        "story.md or diagram.svg",
        "brief.section4 / prompts",
        "needs-authoring",
        "Land rendering edits upstream",
        work_order_reason=(
            "Derived renderings were edited or confirmed as changed; the fix "
            "must land in the source artifacts first."
        ),
    ),
    Edge(
        "E4",
        "brief.section4 / prompts",
        "story.md",
        "auto-derivable",
        "Re-derive the story view",
        executor="derive-views.sh or generate-story.py",
    ),
    Edge(
        "E5",
        "input contract",
        "fixtures/",
        "needs-authoring",
        "Re-tune fixtures to the input contract",
        work_order_reason=(
            "Fixture material is graded authoring; Re-sync can identify the "
            "stale edge but must not invent new fixture content."
        ),
    ),
    Edge(
        "E6",
        "moves / outputs",
        "answer keys",
        "needs-authoring",
        "Re-key expected answers to the new outputs",
        work_order_reason=(
            "Answer keys grade content and outputs; Re-sync must not rewrite "
            "them mechanically."
        ),
    ),
    Edge(
        "E7",
        "moves / outputs",
        "risk-map.md / known-fps.md",
        "needs-authoring",
        "Re-map risk and false-positive terminology",
        work_order_reason=(
            "Risk ids and known false positives must be dispositioned against "
            "the new play shape."
        ),
    ),
    Edge(
        "E8",
        "workflow.fabro / prompts",
        "placeholder spelling invariant",
        "auto-detectable",
        "Check placeholder spelling",
        executor="check-placeholder-spelling.sh",
        catch_title="dead placeholder spelling",
    ),
    Edge(
        "E9",
        "workflow.fabro",
        "ACP failure-fallback invariant",
        "auto-detectable",
        "Check ACP failure fallbacks",
        executor="check-workflow-edges.py",
        catch_title="missing ACP failure fallback",
    ),
    Edge(
        "E10",
        "brief.section4 / workflow.fabro / prompt frontmatter",
        "Protocol E parity",
        "auto-detectable",
        "Check brief, workflow, and prompt parity",
        work_order_reason=(
            "Protocol E parity still needs a fresh lint pass and any fix is "
            "authoring, not generated content."
        ),
    ),
    Edge(
        "E11",
        "brief.section4",
        "moves.md",
        "auto-detectable",
        "Check the authored moves overlay",
        executor="check-moves.ts",
    ),
    Edge(
        "E12",
        "brief.section4 / workflow.fabro / prompts",
        "hardening.md / lint.md",
        "needs-authoring",
        "Refresh hardening and lint",
        work_order_reason=(
            "The old hardening interview and lint verdict measured the prior "
            "artifact set."
        ),
    ),
    Edge(
        "E13",
        "brief.section4",
        "dry-runs/ and risk-map results",
        "needs-runtime",
        "Re-earn proof on the new play",
        work_order_reason=(
            "Recorded runs measured the retired play shape; the proving "
            "campaign remains a runtime follow-up in this slice."
        ),
    ),
    Edge(
        "E14",
        "studio workflow.fabro / prompts",
        "packages/alexandria-plugin workflow copy",
        "auto-derivable",
        "Bank the deployable package",
        executor="bank.sh",
    ),
    Edge(
        "E15",
        "workflow.fabro node set",
        "legs.json",
        "auto-detectable",
        "Check plugin tracker metadata",
        executor="bank.sh advisory",
    ),
    Edge(
        "E16",
        "whole edit",
        "registry.js / board stage",
        "needs-authoring",
        "Update production bookkeeping honestly",
        work_order_reason=(
            "Registry and Board state must reflect only what the edited play "
            "has actually earned."
        ),
    ),
]
EDGE_BY_ID = {edge.id: edge for edge in EDGES}
EDGE_INDEX = {edge.id: index for index, edge in enumerate(EDGES)}
AUTHORING_WORK_ORDER_EDGES = {"E1", "E3", "E5", "E6", "E7", "E10", "E12", "E13", "E16"}


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def sha256_dir(path: Path) -> str:
    digest = hashlib.sha256()
    for item in sorted(path.rglob("*")):
        if not item.is_file():
            continue
        if item.name == STATE_FILE or any(part.startswith(".derive-views.") for part in item.parts):
            continue
        rel = item.relative_to(path).as_posix()
        digest.update(rel.encode("utf-8"))
        digest.update(b"\0")
        digest.update(sha256_file(item).encode("ascii"))
        digest.update(b"\0")
    return digest.hexdigest()


def display_path(path: Path, root: Path) -> str:
    try:
        return path.resolve().relative_to(root.resolve()).as_posix()
    except ValueError:
        return str(path)


def extract_brief_section4(text: str) -> str:
    match = re.search(r"(?ms)^##\s+4(?:[.\s].*?)$(.*?)(?=^##\s+|\Z)", text)
    if not match:
        return ""
    return match.group(0).strip() + "\n"


def extract_frontmatter(text: str) -> str:
    if not text.startswith("---\n"):
        return ""
    match = re.match(r"(?s)^---\n(.*?)\n---(?:\n|\Z)", text)
    return (match.group(1).strip() + "\n") if match else ""


def prompt_contract_text(prompts_dir: Path) -> str:
    chunks: list[str] = []
    if not prompts_dir.is_dir():
        return ""
    for prompt in sorted(prompts_dir.rglob("*.md")):
        rel = prompt.relative_to(prompts_dir).as_posix()
        frontmatter = extract_frontmatter(prompt.read_text(encoding="utf-8"))
        if frontmatter:
            chunks.append(f"--- {rel}\n{frontmatter}")
    return "\n".join(chunks)


def source_fingerprints(play_dir: Path) -> dict[str, str]:
    fingerprints: dict[str, str] = {}

    brief = play_dir / "brief.md"
    if brief.is_file():
        fingerprints["brief.section4"] = sha256_text(
            extract_brief_section4(brief.read_text(encoding="utf-8"))
        )

    workflow = play_dir / "workflow.fabro"
    if workflow.is_file():
        fingerprints["workflow.fabro"] = sha256_file(workflow)

    prompts = play_dir / "prompts"
    if prompts.is_dir():
        for prompt in sorted(prompts.rglob("*")):
            if prompt.is_file():
                rel = prompt.relative_to(play_dir).as_posix()
                fingerprints[rel] = sha256_file(prompt)
        fingerprints["prompt.contract"] = sha256_text(prompt_contract_text(prompts))

    for file_name in [
        "story.md",
        "diagram.svg",
        "risk-map.md",
        "known-fps.md",
        "hardening.md",
        "lint.md",
        "moves.md",
    ]:
        path = play_dir / file_name
        if path.is_file():
            fingerprints[file_name] = sha256_file(path)

    for dir_name in ["fixtures", "dry-runs"]:
        path = play_dir / dir_name
        if path.is_dir():
            fingerprints[f"{dir_name}/"] = sha256_dir(path)

    return fingerprints


def read_json(path: Path) -> dict[str, Any] | None:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return None
    if not isinstance(data, dict):
        return None
    return data


def atomic_write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), prefix=f".{path.name}.", text=True)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2)
            handle.write("\n")
        os.replace(tmp, path)
    except Exception:
        try:
            os.unlink(tmp)
        except FileNotFoundError:
            pass
        raise


def atomic_write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), prefix=f".{path.name}.", text=True)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            handle.write(text)
        os.replace(tmp, path)
    except Exception:
        try:
            os.unlink(tmp)
        except FileNotFoundError:
            pass
        raise


def repo_root_from_script() -> Path:
    return Path(__file__).resolve().parents[2]


def git_diff_artifacts(repo_root: Path, play_dir: Path) -> set[str]:
    try:
        rel = play_dir.resolve().relative_to(repo_root.resolve())
    except ValueError:
        return set()

    try:
        proc = subprocess.run(
            ["git", "diff", "--name-only", "HEAD", "--", rel.as_posix()],
            cwd=repo_root,
            capture_output=True,
            text=True,
            check=False,
        )
    except OSError:
        return set()
    if proc.returncode != 0:
        return set()

    artifacts: set[str] = set()
    for line in proc.stdout.splitlines():
        if not line:
            continue
        try:
            path_rel = Path(line).relative_to(rel).as_posix()
        except ValueError:
            continue
        artifacts.update(artifacts_for_path(path_rel))
    return artifacts


def artifacts_for_path(path: str) -> set[str]:
    if path == "brief.md":
        return {"brief.section4"}
    if path == "workflow.fabro":
        return {"workflow.fabro"}
    if path.startswith("prompts/"):
        return {path, "prompt.contract"}
    if path in {"story.md", "diagram.svg", "risk-map.md", "known-fps.md", "hardening.md", "lint.md", "moves.md"}:
        return {path}
    if path.startswith("fixtures/"):
        return {"fixtures/"}
    if path.startswith("dry-runs/"):
        return {"dry-runs/"}
    return set()


def changed_from_state(
    previous: dict[str, str] | None,
    current: dict[str, str],
    repo_root: Path,
    play_dir: Path,
) -> list[dict[str, Any]]:
    if previous is None:
        changed = git_diff_artifacts(repo_root, play_dir)
        return [
            {
                "artifact": artifact,
                "reason": "git-diff-bootstrap",
                "currentHash": current.get(artifact),
            }
            for artifact in sorted(changed)
            if artifact in current or artifact in {"brief.section4", "prompt.contract"}
        ]

    changed: list[dict[str, Any]] = []
    for artifact in sorted(set(previous) | set(current)):
        old_hash = previous.get(artifact)
        new_hash = current.get(artifact)
        if old_hash == new_hash:
            continue
        changed.append(
            {
                "artifact": artifact,
                "reason": "fingerprint-changed",
                "previousHash": old_hash,
                "currentHash": new_hash,
            }
        )
    return changed


def classify_edges(changed_artifacts: list[dict[str, Any]]) -> tuple[set[str], dict[str, bool]]:
    selected: set[str] = set()
    flags = {
        "brief": False,
        "workflow": False,
        "prompt": False,
        "prompt_contract": False,
        "rendering": False,
        "inline_prompt": False,
    }

    for changed in changed_artifacts:
        artifact = changed["artifact"]
        if artifact == "brief.section4":
            flags["brief"] = True
            selected.update(
                {
                    "E1",
                    "E2",
                    "E4",
                    "E5",
                    "E6",
                    "E7",
                    "E8",
                    "E9",
                    "E10",
                    "E11",
                    "E12",
                    "E13",
                    "E14",
                    "E15",
                    "E16",
                }
            )
        elif artifact == "workflow.fabro":
            flags["workflow"] = True
            selected.update({"E2", "E4", "E8", "E9", "E10", "E12", "E14", "E15"})
        elif artifact.startswith("prompts/"):
            flags["prompt"] = True
            selected.update({"E4", "E8", "E10", "E12", "E14"})
        elif artifact == "prompt.contract":
            flags["prompt_contract"] = True
            selected.update({"E5", "E6", "E10"})
        elif artifact in {"story.md", "diagram.svg"}:
            flags["rendering"] = True
            selected.update({"E2", "E3", "E4"})
        elif artifact == "fixtures/":
            selected.update({"E5", "E6"})
        elif artifact in {"risk-map.md", "known-fps.md"}:
            selected.update({"E7", "E13"})
        elif artifact in {"hardening.md", "lint.md"}:
            selected.add("E12")
        elif artifact == "moves.md":
            selected.add("E11")
        elif artifact == "dry-runs/":
            selected.add("E13")

    return selected, flags


def ordered_edge_ids(edge_ids: set[str]) -> list[str]:
    return sorted(edge_ids, key=lambda edge_id: EDGE_INDEX[edge_id])


def stale_set(edge_ids: set[str], blocked_by_edge: dict[str, list[str]]) -> list[dict[str, Any]]:
    items: list[dict[str, Any]] = []
    for edge_id in ordered_edge_ids(edge_ids):
        edge = EDGE_BY_ID[edge_id]
        item = asdict(edge)
        item["status"] = "blocked" if edge_id in blocked_by_edge else "stale"
        if edge_id in blocked_by_edge:
            item["blockedBy"] = blocked_by_edge[edge_id]
        items.append({key: value for key, value in item.items() if value is not None})
    return items


def build_work_order(
    edge_ids: set[str],
    blocked_by_edge: dict[str, list[str]],
    satisfied_projection: bool,
) -> list[dict[str, Any]]:
    work: list[dict[str, Any]] = []
    for edge_id in ordered_edge_ids(edge_ids):
        if edge_id == "E1" and satisfied_projection:
            continue
        if edge_id not in AUTHORING_WORK_ORDER_EDGES:
            continue
        edge = EDGE_BY_ID[edge_id]
        work.append(
            {
                "id": f"work-{edge_id.lower()}",
                "edge": edge.id,
                "title": edge.title,
                "target": edge.target,
                "reason": edge.work_order_reason or "Stale edge requires authoring.",
                "blockedBy": blocked_by_edge.get(edge_id, []),
                "requiredAction": "needs-authoring"
                if edge.disposition != "needs-runtime"
                else "needs-runtime",
            }
        )
    return work


def command_result(command: list[str], proc: subprocess.CompletedProcess[str]) -> dict[str, Any]:
    return {
        "command": command,
        "exitCode": proc.returncode,
        "status": "passed" if proc.returncode == 0 else "failed",
    }


def run_command(command: list[str], cwd: Path) -> tuple[dict[str, Any], str]:
    proc = subprocess.run(command, cwd=cwd, capture_output=True, text=True, check=False)
    diagnostics = ""
    if proc.stdout:
        diagnostics += proc.stdout
    if proc.stderr:
        diagnostics += proc.stderr
    if diagnostics:
        sys.stderr.write(diagnostics)
        if not diagnostics.endswith("\n"):
            sys.stderr.write("\n")
    return command_result(command, proc), diagnostics.strip()


def find_fabro() -> str | None:
    found = shutil.which("fabro")
    if found:
        return found
    home_fabro = Path.home() / ".fabro" / "bin" / "fabro"
    if home_fabro.is_file() and os.access(home_fabro, os.X_OK):
        return str(home_fabro)
    return None


def catalog_filing(repo_root: Path, play: str) -> dict[str, str] | None:
    registry_path = repo_root / "studio" / "plays" / "registry.js"
    try:
        text = registry_path.read_text()
    except OSError:
        return None
    for line in text.splitlines():
        if f"slug:'{play}'" not in line and f'slug:"{play}"' not in line:
            continue
        division = re.search(r"division:\s*['\"]([^'\"]+)['\"]", line)
        function = re.search(r"function:\s*['\"]([^'\"]+)['\"]", line)
        if division and function:
            return {"division": division.group(1), "function": function.group(1)}
    return None


def build_bug_card(
    repo_root: Path,
    play: str,
    card_id: str,
    title: str,
    detail: str,
    context: str,
) -> dict[str, Any]:
    """Assemble a Play Re-sync Bug card with the shared filing convention.

    ``play`` and the registry division/function are attached only when the play
    resolves in the Studio catalog. The Board only accepts a ``play`` field that
    names a known board slug (``board-model.js``), so an unresolved play instead
    falls back to the Studio Operations function and folds the play ``context``
    into ``detail`` rather than emitting an unlinkable ``play``. Both the
    invariant-gate (E8/E9) and runtime (E13) catches build through here so their
    card shape cannot drift apart.
    """
    filing = catalog_filing(repo_root, play)
    card: dict[str, Any] = {
        "id": card_id,
        "type": "bug",
        "status": "open",
        "division": filing["division"] if filing else "PlaymakerStudio",
        "function": filing["function"] if filing else "Operations",
        "priority": 10,
        "source": "play-re-sync",
        "created": date.today().isoformat(),
        "title": f"Play Re-sync catch: {title}",
        "detail": detail if filing else f"{context}\n\n{detail}",
    }
    if filing:
        card["play"] = play
    return card


def make_bug_card(repo_root: Path, play: str, edge_id: str, title: str, detail: str) -> dict[str, Any]:
    digest = hashlib.sha256(f"{play}:{edge_id}:{detail}".encode("utf-8")).hexdigest()[:10]
    return build_bug_card(
        repo_root,
        play,
        f"bug-{play}-play-re-sync-{edge_id.lower()}-{digest}",
        title,
        detail,
        context=f"Play: {play}\nEdge: {edge_id}",
    )


def load_board_state(board_path: Path) -> dict[str, Any]:
    data = read_json(board_path)
    if data is not None:
        return data
    return {
        "comment": "Board card state.",
        "updated": date.today().isoformat(),
        "ready": [],
        "stages": {stage: [] for stage in STAGES},
        "cards": [],
    }


def upsert_bug_cards(board_path: Path, bug_cards: list[dict[str, Any]]) -> None:
    if not bug_cards:
        return
    data = load_board_state(board_path)
    cards = data.get("cards", [])
    if not isinstance(cards, list):
        cards = []

    by_id: dict[str, dict[str, Any]] = {
        card.get("id"): dict(card)
        for card in cards
        if isinstance(card, dict) and isinstance(card.get("id"), str)
    }
    order = [
        card.get("id")
        for card in cards
        if isinstance(card, dict) and isinstance(card.get("id"), str)
    ]

    for bug in bug_cards:
        existing = by_id.get(bug["id"], {})
        merged = {**existing, **bug}
        if "created" in existing:
            merged["created"] = existing["created"]
        by_id[bug["id"]] = merged
        if bug["id"] not in order:
            order.append(bug["id"])

    data["cards"] = [by_id[card_id] for card_id in order if card_id in by_id]
    data["updated"] = date.today().isoformat()
    atomic_write_json(board_path, data)


def slugify(value: str, fallback: str = "entry") -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or fallback


def short_hash(payload: Any, length: int = 12) -> str:
    encoded = json.dumps(payload, sort_keys=True, ensure_ascii=True)
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()[:length]


@dataclass(frozen=True)
class RiskMapEntry:
    line_index: int
    row_index: int
    entry_id: str
    risk: str
    test: str
    scope: str
    kind: str
    built: str
    target: str
    runs: str
    result: str
    cells: list[str]


@dataclass(frozen=True)
class RiskMapTable:
    lines: list[str]
    had_trailing_newline: bool
    columns: dict[str, int]
    entries: list[RiskMapEntry]


def normalize_table_header(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.lower())


def split_markdown_table_row(line: str) -> list[str] | None:
    stripped = line.strip()
    if not stripped.startswith("|") or not stripped.endswith("|"):
        return None
    return [cell.strip() for cell in stripped.strip("|").split("|")]


def is_markdown_separator_row(cells: list[str]) -> bool:
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell.strip()) for cell in cells)


def make_entry_id(row_index: int, risk: str, test: str) -> str:
    return f"risk-row-{row_index:03d}-{slugify(risk, 'risk')}-{slugify(test, 'test')[:48]}"


def parse_risk_map(text: str) -> RiskMapTable:
    lines = text.splitlines()
    required = {"risk", "test", "scope", "type", "built", "target", "runs", "result"}
    for index, line in enumerate(lines):
        header_cells = split_markdown_table_row(line)
        if header_cells is None:
            continue
        normalized = [normalize_table_header(cell) for cell in header_cells]
        if not required.issubset(set(normalized)):
            continue
        if index + 1 >= len(lines):
            continue
        separator_cells = split_markdown_table_row(lines[index + 1])
        if separator_cells is None or not is_markdown_separator_row(separator_cells):
            continue

        columns = {name: normalized.index(name) for name in required}
        entries: list[RiskMapEntry] = []
        row_index = 0
        for line_index in range(index + 2, len(lines)):
            row_cells = split_markdown_table_row(lines[line_index])
            if row_cells is None:
                break
            if len(row_cells) < len(header_cells):
                row_cells = row_cells + [""] * (len(header_cells) - len(row_cells))
            row_index += 1
            risk = row_cells[columns["risk"]]
            test = row_cells[columns["test"]]
            entries.append(
                RiskMapEntry(
                    line_index=line_index,
                    row_index=row_index,
                    entry_id=make_entry_id(row_index, risk, test),
                    risk=risk,
                    test=test,
                    scope=row_cells[columns["scope"]],
                    kind=row_cells[columns["type"]],
                    built=row_cells[columns["built"]],
                    target=row_cells[columns["target"]],
                    runs=row_cells[columns["runs"]],
                    result=row_cells[columns["result"]],
                    cells=row_cells[: len(header_cells)],
                )
            )
        return RiskMapTable(
            lines=lines,
            had_trailing_newline=text.endswith("\n"),
            columns=columns,
            entries=entries,
        )
    return RiskMapTable(lines=lines, had_trailing_newline=text.endswith("\n"), columns={}, entries=[])


def entry_state(entry: RiskMapEntry) -> dict[str, Any]:
    return {
        "entryId": entry.entry_id,
        "risk": entry.risk,
        "test": entry.test,
        "rowIndex": entry.row_index,
    }


def entry_snapshot(entry: RiskMapEntry) -> dict[str, Any]:
    snapshot = entry_state(entry)
    snapshot.update({"runs": entry.runs, "result": entry.result})
    return snapshot


def risk_map_snapshot(play_dir: Path) -> dict[str, Any] | None:
    risk_map_path = play_dir / "risk-map.md"
    try:
        risk_map_text = risk_map_path.read_text(encoding="utf-8")
    except OSError:
        return None

    risk_table = parse_risk_map(risk_map_text)
    if not risk_table.entries:
        return None
    return {
        "hash": sha256_text(risk_map_text),
        "entries": [entry_snapshot(entry) for entry in risk_table.entries],
    }


def find_reset_entry(raw: dict[str, Any], entries: list[RiskMapEntry]) -> RiskMapEntry | None:
    entry_id = raw.get("entryId")
    if isinstance(entry_id, str):
        for entry in entries:
            if entry.entry_id == entry_id:
                return entry

    row_index = raw.get("rowIndex")
    if isinstance(row_index, int):
        for entry in entries:
            if entry.row_index == row_index:
                if raw.get("risk") in (None, entry.risk) and raw.get("test") in (None, entry.test):
                    return entry

    risk = raw.get("risk")
    test = raw.get("test")
    if isinstance(risk, str) and isinstance(test, str):
        for entry in entries:
            if entry.risk == risk and entry.test == test:
                return entry
    return None


def resolve_reset_entries(
    runtime_state: dict[str, Any],
    risk_table: RiskMapTable,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    raw_entries = runtime_state.get("resetEntries", [])
    if not isinstance(raw_entries, list):
        raw_entries = []

    resolved: list[dict[str, Any]] = []
    missing: list[dict[str, Any]] = []
    seen: set[str] = set()
    for raw in raw_entries:
        if not isinstance(raw, dict):
            continue
        entry = find_reset_entry(raw, risk_table.entries)
        if entry is None:
            fallback_id = str(raw.get("entryId") or short_hash(raw, 10))
            missing.append(
                {
                    "entryId": fallback_id,
                    "risk": str(raw.get("risk") or "unknown"),
                    "test": str(raw.get("test") or "unknown"),
                    "reason": "reset entry no longer matches the current risk-map",
                }
            )
            continue
        if entry.entry_id in seen:
            continue
        seen.add(entry.entry_id)
        resolved.append({"entry": entry, "state": entry_state(entry)})
    return resolved, missing


def plain_unproven(value: str) -> bool:
    """Whether a risk-map ``result`` cell reads as a Phase-1 reset-to-unproven.

    The reset cone is *inferred* by diffing the current ``result`` cells against
    the previous checkpoint snapshot rather than consumed from an explicit
    Phase-1 record, so this match is the cross-phase contract. Match the
    ``unproven`` token at a word boundary so a richer Phase-1 reset note such as
    ``unproven — needs rerun`` still counts, while the runtime's own
    ``still-unproven (...)`` / ``re-earned (...)`` verdicts (which do not start
    with the token) do not.

    Known limitation: because detection is purely diff-based, an ``owed-runtime``
    row that stays ``unproven`` across a *second* reset cannot be re-detected,
    and the first run on a pre-snapshot (schema-v1) state sees no baseline. Both
    resolve once Phase 1 persists the cone explicitly.
    """
    return bool(re.match(r"unproven\b", value.strip().lower()))


def previous_snapshot_for_entry(
    entry: RiskMapEntry,
    previous_entries: list[dict[str, Any]],
) -> dict[str, Any] | None:
    for previous in previous_entries:
        if previous.get("entryId") == entry.entry_id:
            return previous

    matches = [
        previous
        for previous in previous_entries
        if previous.get("risk") == entry.risk and previous.get("test") == entry.test
    ]
    if len(matches) == 1:
        return matches[0]
    return None


def risk_map_reset_entries(
    risk_table: RiskMapTable,
    previous_risk_map: dict[str, Any] | None,
) -> list[dict[str, Any]]:
    previous_entries = []
    if isinstance(previous_risk_map, dict) and isinstance(previous_risk_map.get("entries"), list):
        previous_entries = [
            item for item in previous_risk_map["entries"] if isinstance(item, dict)
        ]

    if not previous_entries:
        return []

    entries: list[dict[str, Any]] = []
    for entry in risk_table.entries:
        if not plain_unproven(entry.result):
            continue
        previous = previous_snapshot_for_entry(entry, previous_entries)
        if previous is None:
            continue
        if plain_unproven(str(previous.get("result") or "")):
            continue
        entries.append(entry_state(entry))
    return entries


def latest_archive_generation(play_dir: Path) -> str | None:
    dry_runs = play_dir / "dry-runs"
    if not dry_runs.is_dir():
        return None
    archives = [
        child.name
        for child in dry_runs.iterdir()
        if child.is_dir() and child.name.startswith("archive-")
    ]
    return sorted(archives)[-1] if archives else None


def build_e13_runtime_handoff(
    play_dir: Path,
    fingerprints: dict[str, str],
    previous_risk_map: dict[str, Any] | None,
) -> dict[str, Any] | None:
    risk_map_path = play_dir / "risk-map.md"
    try:
        risk_map_text = risk_map_path.read_text(encoding="utf-8")
    except OSError:
        return None

    risk_table = parse_risk_map(risk_map_text)
    if not risk_table.entries:
        return None

    reset_entries = risk_map_reset_entries(risk_table, previous_risk_map)
    if not reset_entries:
        return None

    shape_id = play_shape_id(fingerprints)
    cone_hash = reset_cone_hash([{"state": entry} for entry in reset_entries], [])
    return {
        "status": "needs-runtime",
        "shapeId": shape_id,
        "resetConeHash": cone_hash,
        "riskMapHashAtReset": sha256_text(risk_map_text),
        "archiveGeneration": latest_archive_generation(play_dir),
        "runGeneration": generation_for(shape_id, cone_hash),
        "resetEntries": reset_entries,
        "updated": date.today().isoformat(),
    }


def should_build_e13_runtime_handoff(
    edge_ids: set[str],
    changed_artifacts: list[dict[str, Any]],
) -> bool:
    if "E13" not in edge_ids:
        return False
    changed = {str(item.get("artifact")) for item in changed_artifacts}
    return bool(changed & {"risk-map.md", "dry-runs/"})


def reset_cone_hash(reset_entries: list[dict[str, Any]], missing: list[dict[str, Any]]) -> str:
    payload = [
        item["state"] if "state" in item else item
        for item in [*reset_entries, *missing]
    ]
    return short_hash(payload)


def play_shape_id(fingerprints: dict[str, str]) -> str:
    shape: dict[str, str] = {}
    for key, value in fingerprints.items():
        if key in {"brief.section4", "workflow.fabro", "prompt.contract", "fixtures/"}:
            shape[key] = value
        elif key.startswith("prompts/"):
            shape[key] = value
    return f"resync-{short_hash(shape)}"


def generation_for(shape_id: str, cone_hash: str) -> str:
    return f"{shape_id}-{cone_hash}"


def risk_item(entry: RiskMapEntry | dict[str, Any], **extra: Any) -> dict[str, Any]:
    if isinstance(entry, RiskMapEntry):
        item = entry_state(entry)
    else:
        item = {
            "entryId": str(entry.get("entryId") or "unknown"),
            "risk": str(entry.get("risk") or "unknown"),
            "test": str(entry.get("test") or "unknown"),
        }
        if isinstance(entry.get("rowIndex"), int):
            item["rowIndex"] = entry["rowIndex"]
    item.update({key: value for key, value in extra.items() if value is not None})
    return item


def discover_fixture_cases(play_dir: Path) -> dict[str, Path]:
    fixtures_dir = play_dir / "fixtures"
    if not fixtures_dir.is_dir():
        return {}
    return {
        child.name: child
        for child in sorted(fixtures_dir.iterdir())
        if child.is_dir() and child.name != "expected"
    }


def fixture_cases_for_test(test: str, fixture_cases: dict[str, Path]) -> list[str]:
    lowered = test.lower()
    matches: list[str] = []
    for name in sorted(fixture_cases, key=len, reverse=True):
        pattern = rf"(?<![a-z0-9-]){re.escape(name.lower())}(?![a-z0-9-])"
        if re.search(pattern, lowered):
            matches.append(name)
    return sorted(matches)


def target_sample_size(target: str) -> int | None:
    match = re.search(r"\d+", target)
    return int(match.group(0)) if match else None


def entry_needs_scripted_reactions(entry: RiskMapEntry) -> bool:
    text = f"{entry.test} {entry.scope} {entry.kind}".lower()
    return any(term in text for term in ["review", "revise", "interactive"])


def load_runtime_verifier(case_dir: Path) -> tuple[dict[str, Any] | None, str | None]:
    verifier_path = case_dir / "expected" / RUNTIME_VERIFIER_FILE
    if not verifier_path.is_file():
        return None, f"no unattended verifier at {verifier_path.relative_to(case_dir.parent.parent).as_posix()}"
    try:
        data = json.loads(verifier_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as error:
        return None, f"{RUNTIME_VERIFIER_FILE} is not valid JSON: {error.msg}"
    if not isinstance(data, dict):
        return None, f"{RUNTIME_VERIFIER_FILE} must be a JSON object"

    kind = str(data.get("kind") or data.get("verifier") or "ax-json-status")
    if kind != "ax-json-status":
        return None, f"unsupported verifier kind: {kind}"

    expected = data.get("passStatuses", data.get("expectedStatus", ["succeeded", "completed"]))
    if isinstance(expected, str):
        pass_statuses = [expected]
    elif isinstance(expected, list) and all(isinstance(item, str) for item in expected):
        pass_statuses = expected
    else:
        return None, "ax-json-status verifier needs string/list passStatuses"

    return {
        "kind": kind,
        "path": verifier_path,
        "passStatuses": pass_statuses,
    }, None


def manifest_mentions_play(repo_root: Path, play: str) -> bool | None:
    manifest_path = repo_root / "packages" / "ax" / "src" / "domain" / "plays.ts"
    if not manifest_path.is_file():
        return None
    text = manifest_path.read_text(encoding="utf-8")
    return f'"{play}"' in text or f"'{play}'" in text


def plan_runtime_entry(
    repo_root: Path,
    play_dir: Path,
    entry: RiskMapEntry,
    fixture_cases: dict[str, Path],
) -> dict[str, Any]:
    if entry.built.strip().lower() != "yes":
        return {"status": "owed-runtime", "entry": entry, "reason": f"built is {entry.built or 'blank'}, not yes"}

    if "statistical" in entry.kind.lower():
        return {"status": "owed-runtime", "entry": entry, "reason": "statistical rows need a campaign scheduler"}

    sample_size = target_sample_size(entry.target)
    if sample_size is None:
        return {"status": "owed-runtime", "entry": entry, "reason": f"target {entry.target or 'blank'} is not an unattended sample size"}
    if sample_size > RUNTIME_CAMPAIGN_BUDGET:
        return {
            "status": "owed-runtime",
            "entry": entry,
            "reason": f"target sample size {sample_size} exceeds unattended budget {RUNTIME_CAMPAIGN_BUDGET}",
        }

    manifest_status = manifest_mentions_play(repo_root, play_dir.name)
    if manifest_status is False:
        return {"status": "owed-runtime", "entry": entry, "reason": "no registered PLAY_MANIFEST entry for this play"}

    cases = fixture_cases_for_test(entry.test, fixture_cases)
    if not cases:
        return {"status": "owed-runtime", "entry": entry, "reason": "no fixture case can be mapped from the risk-map test cell"}

    runs: list[dict[str, Any]] = []
    needs_reactions = entry_needs_scripted_reactions(entry)
    for case in cases:
        case_dir = fixture_cases[case]
        reactions_path = case_dir / "reactions.json"
        if needs_reactions and not reactions_path.is_file():
            return {
                "status": "owed-runtime",
                "entry": entry,
                "reason": f"interactive review/revise loop for {case} lacks reactions.json",
            }
        verifier, reason = load_runtime_verifier(case_dir)
        if verifier is None:
            return {"status": "owed-runtime", "entry": entry, "reason": reason or "no unattended verifier"}
        runs.append(
            {
                "case": case,
                "mode": "reactions" if needs_reactions else "auto-approve",
                "reactionsPath": str(reactions_path) if needs_reactions else None,
                "verifier": verifier,
            }
        )

    return {"status": "runnable", "entry": entry, "runs": runs}


def ax_command_for_run(ax_bin: str, play: str, run: dict[str, Any]) -> list[str]:
    command = [ax_bin, "run", play, "--fixture", run["case"]]
    if run["mode"] == "reactions":
        command.extend(["--reactions", str(run["reactionsPath"]), "--json"])
    else:
        command.extend(["--auto-approve", "--wait", "--json"])
    return command


def parse_run_summary(stdout: str) -> dict[str, Any]:
    try:
        parsed = json.loads(stdout) if stdout.strip() else {}
    except json.JSONDecodeError as error:
        return {"parseError": f"stdout was not valid JSON: {error.msg}"}
    return parsed if isinstance(parsed, dict) else {"parseError": "stdout JSON was not an object"}


def verify_run(
    proc: subprocess.CompletedProcess[str],
    summary: dict[str, Any],
    verifier: dict[str, Any],
) -> tuple[bool, str]:
    if proc.returncode != 0:
        detail = summary.get("message") if isinstance(summary.get("message"), str) else ""
        return False, detail or f"ax run exited {proc.returncode}"
    parse_error = summary.get("parseError")
    if isinstance(parse_error, str):
        return False, parse_error
    status = summary.get("status")
    pass_statuses = verifier.get("passStatuses", [])
    if isinstance(status, str) and status in pass_statuses:
        return True, f"status {status}"
    return False, f"status {status or 'missing'} did not match {', '.join(pass_statuses)}"


def run_runtime_entry(
    repo_root: Path,
    generation_dir: Path,
    play: str,
    plan: dict[str, Any],
    ax_bin: str,
) -> dict[str, Any]:
    entry: RiskMapEntry = plan["entry"]
    entry_dir = generation_dir / entry.entry_id
    entry_dir.mkdir(parents=True, exist_ok=True)

    attempts: list[dict[str, Any]] = []
    all_passed = True
    failure_summary = ""
    for index, run in enumerate(plan["runs"], start=1):
        run_dir = entry_dir / f"run-{index}"
        run_dir.mkdir(parents=True, exist_ok=True)
        command = ax_command_for_run(ax_bin, play, run)
        atomic_write_json(
            run_dir / "command.json",
            {
                "command": command,
                "case": run["case"],
                "mode": run["mode"],
                "verifier": {
                    "kind": run["verifier"]["kind"],
                    "path": display_path(Path(run["verifier"]["path"]), repo_root),
                    "passStatuses": run["verifier"]["passStatuses"],
                },
            },
        )
        proc = subprocess.run(command, cwd=repo_root, capture_output=True, text=True, check=False)
        atomic_write_text(run_dir / "run.stdout.txt", proc.stdout)
        atomic_write_text(run_dir / "run.stderr.txt", proc.stderr)
        summary = parse_run_summary(proc.stdout)
        summary["exitCode"] = proc.returncode
        atomic_write_json(run_dir / "run-summary.json", summary)
        passed, detail = verify_run(proc, summary, run["verifier"])
        verdict = {
            "case": run["case"],
            "mode": run["mode"],
            "status": "passed" if passed else "failed",
            "detail": detail,
        }
        atomic_write_json(run_dir / "verdict.json", verdict)
        attempts.append(
            {
                "case": run["case"],
                "mode": run["mode"],
                "command": command,
                "exitCode": proc.returncode,
                "status": verdict["status"],
                "detail": detail,
                "runDir": display_path(run_dir, repo_root),
            }
        )
        if not passed:
            all_passed = False
            failure_summary = detail

    if all_passed:
        return {
            "entry": entry,
            "verdict": "re-earned",
            "attempts": attempts,
            "summary": f"{len(attempts)}/{len(attempts)} verifier runs passed",
        }
    return {
        "entry": entry,
        "verdict": "still-unproven",
        "attempts": attempts,
        "summary": failure_summary or "runtime verifier failed",
    }


def update_risk_map_results(
    text: str,
    risk_table: RiskMapTable,
    runtime_results: list[dict[str, Any]],
    generation: str,
    has_open_runtime: bool,
) -> str:
    lines = list(risk_table.lines)
    by_entry = {
        result["entry"].entry_id: result
        for result in runtime_results
        if result.get("verdict") in {"re-earned", "still-unproven"}
    }
    for entry in risk_table.entries:
        result = by_entry.get(entry.entry_id)
        if result is None:
            continue
        cells = list(entry.cells)
        cells[risk_table.columns["runs"]] = str(len(result.get("attempts", [])))
        if result["verdict"] == "re-earned":
            cells[risk_table.columns["result"]] = f"re-earned ({generation}; {result['summary']})"
        else:
            cells[risk_table.columns["result"]] = f"still-unproven ({generation}; {result['summary']})"
        lines[entry.line_index] = "| " + " | ".join(cells) + " |"

    verdicts = [result.get("verdict") for result in runtime_results]
    rollup = (
        f"re-earned:{generation}"
        if verdicts and all(verdict == "re-earned" for verdict in verdicts) and not has_open_runtime
        else "unproven"
    )
    for index, line in enumerate(lines):
        if re.match(r"^\s*results\s*:", line):
            # Replace the value (and any prior trailing comment) with the rollup.
            # Use a callable replacement so a generation/rollup token is never
            # reinterpreted as a backreference (e.g. a stray ``\g`` or ``\1``).
            replacement = f"{rollup} # Play Re-sync runtime {generation}"
            lines[index] = re.sub(
                r"^(\s*results\s*:\s*)[^#\n]*.*$",
                lambda match: match.group(1) + replacement,
                line,
            )
            break

    output = "\n".join(lines)
    if risk_table.had_trailing_newline:
        output += "\n"
    return output


def readout_text(
    play: str,
    generation: str,
    shape_id: str,
    cone_hash: str,
    partitions: dict[str, list[dict[str, Any]]],
) -> str:
    lines = [
        "# Play Re-sync Runtime Read-out",
        "",
        f"- Play: `{play}`",
        f"- Generation: `{generation}`",
        f"- Shape: `{shape_id}`",
        f"- Reset cone: `{cone_hash}`",
        "",
    ]
    sections = [
        ("re-earned", partitions["reEarned"]),
        ("still-unproven", partitions["stillUnproven"]),
        ("owed-runtime", partitions["owedRuntime"]),
    ]
    for title, items in sections:
        lines.append(f"## {title}")
        if not items:
            lines.append("")
            lines.append("- none")
            lines.append("")
            continue
        lines.append("")
        for item in items:
            detail = item.get("summary") or item.get("reason") or item.get("detail") or ""
            lines.append(f"- `{item['entryId']}` ({item['risk']}) {item['test']} — {detail}")
        lines.append("")
    return "\n".join(lines)


def make_runtime_bug_card(
    repo_root: Path,
    play: str,
    entry: RiskMapEntry,
    generation: str,
    summary: str,
) -> dict[str, Any]:
    digest = hashlib.sha256(entry.entry_id.encode("utf-8")).hexdigest()[:10]
    detail = (
        f"Risk entry: {entry.entry_id}\n"
        f"Risk: {entry.risk}\n"
        f"Test: {entry.test}\n"
        f"Generation: dry-runs/{generation}\n\n"
        f"{summary}"
    )
    return build_bug_card(
        repo_root,
        play,
        f"bug-{play}-play-re-sync-e13-{digest}",
        f"proof not re-earned for {entry.risk}",
        detail,
        context=f"Play: {play}",
    )


def runtime_output_from_manifest(repo_root: Path, manifest: dict[str, Any]) -> dict[str, Any]:
    generation = str(manifest.get("generation") or "")
    partitions = manifest.get("partitions") if isinstance(manifest.get("partitions"), dict) else {}
    return {
        "status": str(manifest.get("status") or "completed"),
        "generation": generation,
        "readOutPath": str(manifest.get("readOutPath") or ""),
        "reEarned": partitions.get("reEarned", []) if isinstance(partitions.get("reEarned"), list) else [],
        "stillUnproven": partitions.get("stillUnproven", []) if isinstance(partitions.get("stillUnproven"), list) else [],
        "owedRuntime": partitions.get("owedRuntime", []) if isinstance(partitions.get("owedRuntime"), list) else [],
        "bugCards": manifest.get("bugCards", []) if isinstance(manifest.get("bugCards"), list) else [],
        "reused": True,
        "wrote": False,
        "readOutExists": bool(generation and (repo_root / str(manifest.get("readOutPath", ""))).is_file()),
    }


def runtime_state_from_manifest(manifest: dict[str, Any]) -> dict[str, Any]:
    return {
        "status": str(manifest.get("status") or "completed"),
        "shapeId": str(manifest.get("shapeId") or ""),
        "resetConeHash": str(manifest.get("resetConeHash") or ""),
        "riskMapHashAtReset": str(manifest.get("riskMapHashBefore") or ""),
        "archiveGeneration": manifest.get("archiveGeneration"),
        "runGeneration": str(manifest.get("generation") or ""),
        "resetEntries": manifest.get("resetEntries", []),
        "readOutPath": manifest.get("readOutPath"),
        "partitions": manifest.get("partitions"),
        "updated": date.today().isoformat(),
    }


def run_e13_runtime(
    repo_root: Path,
    play_dir: Path,
    runtime_state: dict[str, Any],
    fingerprints: dict[str, str],
    check_only: bool,
) -> tuple[dict[str, Any] | None, dict[str, Any] | None, list[dict[str, Any]], list[str]]:
    if runtime_state.get("status") not in {"needs-runtime", "completed"}:
        return None, None, [], []

    risk_map_path = play_dir / "risk-map.md"
    try:
        risk_map_text = risk_map_path.read_text(encoding="utf-8")
    except OSError as error:
        return None, None, [], [f"E13 runtime could not read risk-map.md: {error}"]

    risk_table = parse_risk_map(risk_map_text)
    if not risk_table.entries:
        return None, None, [], ["E13 runtime could not find the risk-map eval-plan table"]

    resolved, missing = resolve_reset_entries(runtime_state, risk_table)
    if not resolved and not missing:
        return None, None, [], []

    shape_id = str(runtime_state.get("shapeId") or play_shape_id(fingerprints))
    cone_hash = str(runtime_state.get("resetConeHash") or reset_cone_hash(resolved, missing))
    generation = str(runtime_state.get("runGeneration") or generation_for(shape_id, cone_hash))
    generation_dir = play_dir / "dry-runs" / generation
    manifest_path = generation_dir / "manifest.json"
    existing_manifest = read_json(manifest_path)
    if existing_manifest and existing_manifest.get("shapeId") == shape_id and existing_manifest.get("resetConeHash") == cone_hash:
        return runtime_output_from_manifest(repo_root, existing_manifest), runtime_state_from_manifest(existing_manifest), [], []

    fixture_cases = discover_fixture_cases(play_dir)
    plans: list[dict[str, Any]] = []
    partitions: dict[str, list[dict[str, Any]]] = {
        "reEarned": [],
        "stillUnproven": [],
        "owedRuntime": [],
    }
    for item in missing:
        partitions["owedRuntime"].append(risk_item(item, reason=item["reason"]))
    for item in resolved:
        plan = plan_runtime_entry(repo_root, play_dir, item["entry"], fixture_cases)
        plans.append(plan)
        if plan["status"] == "owed-runtime":
            partitions["owedRuntime"].append(risk_item(item["entry"], reason=plan["reason"]))

    runnable = [plan for plan in plans if plan["status"] == "runnable"]
    if check_only:
        return (
            {
                "status": "planned",
                "generation": generation,
                "readOutPath": display_path(generation_dir / "read-out.md", repo_root),
                "reEarned": [],
                "stillUnproven": [],
                "owedRuntime": partitions["owedRuntime"],
                "bugCards": [],
                "planned": [
                    risk_item(plan["entry"], cases=[run["case"] for run in plan["runs"]])
                    for plan in runnable
                ],
                "wrote": False,
            },
            None,
            [],
            [],
        )

    if not runnable:
        # Nothing can be honestly re-run this pass: every reset entry is owed.
        # Report the owed-runtime partition without materializing a generation
        # directory, rewriting risk-map.md, or minting cards — an all-owed pass
        # is pending work, not recorded proof. Return no fresh state so the
        # carry-forward in main() keeps the needs-runtime handoff alive and these
        # entries are retried once they become runnable.
        return (
            {
                "status": "owed-runtime",
                "generation": generation,
                "readOutPath": display_path(generation_dir / "read-out.md", repo_root),
                "reEarned": [],
                "stillUnproven": [],
                "owedRuntime": partitions["owedRuntime"],
                "bugCards": [],
                "reused": False,
                "wrote": False,
            },
            None,
            [],
            [],
        )

    ax_bin = shutil.which("ax")
    if ax_bin is None:
        return (
            {
                "status": "operational-error",
                "generation": generation,
                "readOutPath": display_path(generation_dir / "read-out.md", repo_root),
                "reEarned": [],
                "stillUnproven": [],
                "owedRuntime": partitions["owedRuntime"],
                "bugCards": [],
                "wrote": False,
            },
            None,
            [],
            ["E13 runtime cannot run unattended entries because ax is not on PATH"],
        )

    generation_dir.mkdir(parents=True, exist_ok=True)
    runtime_results: list[dict[str, Any]] = []
    bug_cards: list[dict[str, Any]] = []
    for plan in runnable:
        result = run_runtime_entry(repo_root, generation_dir, play_dir.name, plan, ax_bin or "ax")
        runtime_results.append(result)
        entry: RiskMapEntry = result["entry"]
        if result["verdict"] == "re-earned":
            partitions["reEarned"].append(risk_item(entry, summary=result["summary"]))
        else:
            partitions["stillUnproven"].append(risk_item(entry, summary=result["summary"]))
            bug_cards.append(make_runtime_bug_card(repo_root, play_dir.name, entry, generation, result["summary"]))

    risk_map_hash_before = sha256_text(risk_map_text)
    updated_risk_map = update_risk_map_results(
        risk_map_text,
        risk_table,
        runtime_results,
        generation,
        bool(partitions["stillUnproven"] or partitions["owedRuntime"]),
    )
    atomic_write_text(risk_map_path, updated_risk_map)
    risk_map_hash_after = sha256_file(risk_map_path)

    read_out_path = generation_dir / "read-out.md"
    atomic_write_text(read_out_path, readout_text(play_dir.name, generation, shape_id, cone_hash, partitions))

    manifest = {
        "status": "completed",
        "play": play_dir.name,
        "shapeId": shape_id,
        "resetConeHash": cone_hash,
        "archiveGeneration": runtime_state.get("archiveGeneration"),
        "generation": generation,
        "readOutPath": display_path(read_out_path, repo_root),
        "resetEntries": [item["state"] for item in resolved] + missing,
        "commands": [
            attempt
            for result in runtime_results
            for attempt in result.get("attempts", [])
        ],
        "partitions": partitions,
        "bugCards": [card["id"] for card in bug_cards],
        "riskMapHashBefore": risk_map_hash_before,
        "riskMapHashAfter": risk_map_hash_after,
        "updated": date.today().isoformat(),
    }
    atomic_write_json(manifest_path, manifest)

    output = runtime_output_from_manifest(repo_root, manifest)
    output["reused"] = False
    output["wrote"] = True
    return output, runtime_state_from_manifest(manifest), bug_cards, []


def check_placeholder(repo_root: Path, tools_dir: Path, play_dir: Path, play: str) -> tuple[dict[str, Any], dict[str, Any] | None]:
    result, diagnostics = run_command([str(tools_dir / "check-placeholder-spelling.sh"), str(play_dir)], repo_root)
    if result["exitCode"] == 0:
        result.update({"edge": "E8", "name": "placeholder spelling"})
        return result, None
    detail = diagnostics or "check-placeholder-spelling.sh failed without diagnostics"
    result.update({"edge": "E8", "name": "placeholder spelling"})
    return result, make_bug_card(repo_root, play, "E8", EDGE_BY_ID["E8"].catch_title or "invariant failed", detail)


def check_workflow(repo_root: Path, tools_dir: Path, play_dir: Path, play: str) -> tuple[dict[str, Any], dict[str, Any] | None]:
    workflow = play_dir / "workflow.fabro"
    if not workflow.is_file():
        result = {
            "edge": "E9",
            "name": "ACP failure fallbacks",
            "status": "skipped",
            "reason": "workflow.fabro is absent",
        }
        return result, None
    result, diagnostics = run_command(["python3", str(tools_dir / "check-workflow-edges.py"), str(workflow)], repo_root)
    if result["exitCode"] == 0:
        result.update({"edge": "E9", "name": "ACP failure fallbacks"})
        return result, None
    detail = diagnostics or "check-workflow-edges.py failed without diagnostics"
    result.update({"edge": "E9", "name": "ACP failure fallbacks"})
    return result, make_bug_card(repo_root, play, "E9", EDGE_BY_ID["E9"].catch_title or "invariant failed", detail)


def run_moves_check(repo_root: Path, tools_dir: Path, play_dir: Path) -> tuple[dict[str, Any], str]:
    if not (play_dir / "moves.md").is_file():
        return (
            {
                "edge": "E11",
                "name": "moves overlay",
                "status": "skipped",
                "reason": "moves.md is absent",
            },
            "",
        )
    if shutil.which("bun") is None:
        return (
            {
                "edge": "E11",
                "name": "moves overlay",
                "status": "skipped",
                "reason": "bun is not available",
            },
            "",
        )
    result, diagnostics = run_command(["bun", str(tools_dir / "check-moves.ts"), str(play_dir)], repo_root)
    result.update({"edge": "E11", "name": "moves overlay"})
    return result, diagnostics


def moves_work_item(diagnostics: str) -> dict[str, Any]:
    return {
        "id": "work-e11",
        "edge": "E11",
        "title": "Refresh moves.md overlay",
        "target": "moves.md",
        "reason": diagnostics or "moves.md no longer covers the derived story spine.",
        "blockedBy": [],
        "requiredAction": "needs-authoring",
    }


def blocked_check(edge_id: str, name: str, reason: str) -> dict[str, Any]:
    return {
        "edge": edge_id,
        "name": name,
        "status": "blocked",
        "reason": reason,
    }


def legs_advisory_text(diagnostics: str) -> str:
    lines = diagnostics.splitlines()
    for index, line in enumerate(lines):
        if "legs.json references nodes not in the banked workflow" not in line:
            continue
        detail = [line.strip()]
        if index + 1 < len(lines) and "update " in lines[index + 1] and "legs.json" in lines[index + 1]:
            detail.append(lines[index + 1].strip())
        return "\n".join(detail)
    return ""


def legs_check_from_bank(
    repo_root: Path,
    play_dir: Path,
    diagnostics: str,
) -> tuple[dict[str, Any], dict[str, Any] | None]:
    play = play_dir.name
    legs_path = repo_root / "packages" / "alexandria-plugin" / "workflows" / play / "legs.json"
    result = {
        "edge": "E15",
        "name": "plugin tracker metadata",
        "executor": "bank.sh advisory",
    }
    if not legs_path.is_file():
        result.update({"status": "skipped", "reason": "legs.json is absent"})
        return result, None

    advisory = legs_advisory_text(diagnostics)
    if not advisory:
        result.update({"status": "passed"})
        return result, None

    result.update({"status": "failed", "reason": advisory})
    return result, {
        "id": "work-e15",
        "edge": "E15",
        "title": "Update plugin tracker metadata",
        "target": display_path(legs_path, repo_root),
        "reason": advisory,
        "blockedBy": [],
        "requiredAction": "needs-authoring",
    }


def plan_blocked_edges(edge_ids: set[str], flags: dict[str, bool]) -> tuple[dict[str, list[str]], bool]:
    projection_changed = flags["workflow"] or flags["prompt"]
    brief_projection_is_unresolved = flags["brief"] and not projection_changed
    blocked: dict[str, list[str]] = {}
    if brief_projection_is_unresolved:
        for edge_id in ["E2", "E4", "E11", "E14", "E15"]:
            if edge_id in edge_ids:
                blocked[edge_id] = ["E1"]
    return blocked, projection_changed


def execute_plan(
    repo_root: Path,
    tools_dir: Path,
    play_dir: Path,
    edge_ids: set[str],
    blocked_by_edge: dict[str, list[str]],
    check_only: bool,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    play = play_dir.name
    checks: list[dict[str, Any]] = []
    auto_derived: list[dict[str, Any]] = []
    bug_cards: list[dict[str, Any]] = []
    extra_work: list[dict[str, Any]] = []
    has_prompts = (play_dir / "prompts").is_dir()
    needs_renderings = any(edge_id in edge_ids and edge_id not in blocked_by_edge for edge_id in ["E2", "E4"])
    needs_bank = "E14" in edge_ids and "E14" not in blocked_by_edge
    needs_moves_check = "E11" in edge_ids
    needs_legs_check = "E15" in edge_ids

    if "E8" in edge_ids:
        result, bug = check_placeholder(repo_root, tools_dir, play_dir, play)
        checks.append(result)
        if bug is not None:
            bug_cards.append(bug)

    if "E9" in edge_ids:
        result, bug = check_workflow(repo_root, tools_dir, play_dir, play)
        checks.append(result)
        if bug is not None:
            bug_cards.append(bug)

    invariant_failed = bool(bug_cards)

    if needs_moves_check and "E11" in blocked_by_edge:
        checks.append(
            blocked_check(
                "E11",
                "moves overlay",
                "The E1 projection is unresolved; checking moves.md now would read stale story.md.",
            )
        )
        needs_moves_check = False
    if needs_legs_check and "E15" in blocked_by_edge:
        checks.append(
            blocked_check(
                "E15",
                "plugin tracker metadata",
                "The E1 projection is unresolved; legs.json can be checked after E14 banking.",
            )
        )
        needs_legs_check = False

    if check_only:
        for edge_id in ["E2", "E4", "E14"]:
            if edge_id in edge_ids and edge_id not in blocked_by_edge:
                auto_derived.append(
                    {
                        "edge": edge_id,
                        "executor": EDGE_BY_ID[edge_id].executor,
                        "status": "would-run",
                    }
                )
        if needs_moves_check:
            checks.append(
                {
                    "edge": "E11",
                    "name": "moves overlay",
                    "status": "would-run",
                    "reason": "check-only mode does not re-derive story.md before the overlay check",
                }
            )
        if needs_legs_check:
            checks.append(
                {
                    "edge": "E15",
                    "name": "plugin tracker metadata",
                    "executor": "bank.sh advisory",
                    "status": "would-run",
                    "reason": "check-only mode does not bank before the legs.json advisory",
                }
            )
        return checks, auto_derived, bug_cards, extra_work

    if invariant_failed:
        if needs_moves_check:
            checks.append(
                blocked_check(
                    "E11",
                    "moves overlay",
                    "An invariant gate failed before Re-sync could re-derive story.md.",
                )
            )
        if needs_legs_check:
            checks.append(
                blocked_check(
                    "E15",
                    "plugin tracker metadata",
                    "An invariant gate failed before Re-sync could bank and inspect legs.json.",
                )
            )
        return checks, auto_derived, bug_cards, extra_work

    if (needs_renderings or needs_bank) and has_prompts and find_fabro() is None:
        auto_derived.append(
            {
                "edge": "E2/E4/E14",
                "executor": "fabro",
                "status": "failed",
                "reason": "fabro CLI not found on PATH or at ~/.fabro/bin/fabro",
            }
        )
        if needs_moves_check and needs_renderings:
            checks.append(
                blocked_check(
                    "E11",
                    "moves overlay",
                    "fabro is unavailable, so story.md could not be re-derived before checking moves.md.",
                )
            )
        if needs_legs_check and needs_bank:
            checks.append(
                blocked_check(
                    "E15",
                    "plugin tracker metadata",
                    "fabro is unavailable, so banking could not reach the legs.json advisory.",
                )
            )
        return checks, auto_derived, bug_cards, extra_work

    if needs_renderings:
        if has_prompts:
            result, _ = run_command([str(tools_dir / "derive-views.sh"), str(play_dir)], repo_root)
            result.update({"edge": "E2/E4", "executor": "derive-views.sh"})
            auto_derived.append(result)
            if result["status"] != "passed":
                if needs_moves_check:
                    checks.append(
                        blocked_check(
                            "E11",
                            "moves overlay",
                            "derive-views.sh failed before story.md was current.",
                        )
                    )
                return checks, auto_derived, bug_cards, extra_work
        elif "E4" in edge_ids:
            result, _ = run_command(
                ["python3", str(tools_dir / "generate-story.py"), str(play_dir), str(play_dir / "story.md")],
                repo_root,
            )
            result.update({"edge": "E4", "executor": "generate-story.py"})
            auto_derived.append(result)
            if result["status"] != "passed":
                if needs_moves_check:
                    checks.append(
                        blocked_check(
                            "E11",
                            "moves overlay",
                            "generate-story.py failed before story.md was current.",
                        )
                    )
                return checks, auto_derived, bug_cards, extra_work
            if "E2" in edge_ids:
                extra_work.append(
                    {
                        "id": "work-e2-inline",
                        "edge": "E2",
                        "title": "Refresh inline-prompt diagram",
                        "target": "diagram.svg",
                        "reason": "derive-views.sh requires prompts/; v1 only re-derives story.md for inline-prompt plays.",
                        "blockedBy": [],
                        "requiredAction": "needs-authoring",
                    }
                )

    if needs_bank:
        if not has_prompts:
            auto_derived.append(
                {
                    "edge": "E14",
                    "executor": "bank.sh",
                    "status": "skipped",
                    "reason": "Only prompt-file plays are bankable in v1.",
                }
            )
            if needs_legs_check:
                checks.append(
                    {
                        "edge": "E15",
                        "name": "plugin tracker metadata",
                        "executor": "bank.sh advisory",
                        "status": "skipped",
                        "reason": "Only prompt-file plays are bankable in v1.",
                    }
                )
        else:
            result, bank_diagnostics = run_command([str(tools_dir / "bank.sh"), str(play_dir)], repo_root)
            result.update({"edge": "E14", "executor": "bank.sh"})
            auto_derived.append(result)
            if needs_legs_check:
                if result["status"] == "passed":
                    legs_result, legs_work = legs_check_from_bank(repo_root, play_dir, bank_diagnostics)
                    checks.append(legs_result)
                    if legs_work is not None:
                        extra_work.append(legs_work)
                else:
                    checks.append(
                        blocked_check(
                            "E15",
                            "plugin tracker metadata",
                            "bank.sh failed before the legs.json advisory could complete.",
                        )
                    )

    if needs_moves_check:
        result, diagnostics = run_moves_check(repo_root, tools_dir, play_dir)
        checks.append(result)
        if result.get("status") == "failed":
            extra_work.append(moves_work_item(diagnostics))

    return checks, auto_derived, bug_cards, extra_work


def result_exit_code(result: dict[str, Any]) -> int:
    if result.get("errors"):
        return 1
    if result.get("bugCards"):
        return 1
    e13_runtime = result.get("e13Runtime")
    if isinstance(e13_runtime, dict) and e13_runtime.get("stillUnproven"):
        return 1
    for item in result.get("autoDerived", []):
        if item.get("status") == "failed":
            return 1
    # Only the E8/E9 invariant gates are blocking. E11 (moves overlay) and E15
    # (legs.json) failures are advisory: they emit a work-order row and exit 0 so
    # an authoring drift does not block the mechanical derive/bank pass. Their
    # reminder is fire-once in v1 — it re-surfaces whenever the relevant source
    # changes again — whereas the blocking E1 projection persists across reruns
    # (see checkpoint_fingerprints).
    for item in result.get("checks", []):
        if item.get("status") == "failed" and item.get("edge") in {"E8", "E9"}:
            return 1
    return 0


def checkpoint_fingerprints(
    fresh: dict[str, str],
    previous: dict[str, str] | None,
    blocked_by_edge: dict[str, list[str]],
) -> dict[str, str]:
    """Return the source fingerprints to persist after an exit-0 run.

    A blocking source — brief.section4 while its E1 projection is unresolved —
    must not be checkpointed at its post-edit value. Doing so would let the next
    run see "no change" and silently drop the still-open E1 work order and the
    blocked downstream cone (E2/E4/E14...), even though the play is genuinely
    inconsistent until the workflow/prompt projection is authored.

    Hold each such source at its last fully-synced value (or drop it when there
    is no prior value) so the block and its work order re-surface on every rerun.
    When the projection is finally authored, that edit clears the block, this
    function returns the fresh fingerprints unchanged, and the source advances
    normally — making the next run a no-op.
    """
    if not blocked_by_edge:
        return fresh
    unresolved_sources = {
        EDGE_BY_ID[blocker].source
        for blockers in blocked_by_edge.values()
        for blocker in blockers
        if blocker in EDGE_BY_ID
    }
    held = dict(fresh)
    for source in unresolved_sources:
        if previous is not None and source in previous:
            held[source] = previous[source]
        else:
            held.pop(source, None)
    return held


def write_checkpoint(
    state_path: Path,
    play: str,
    fingerprints: dict[str, str],
    result: dict[str, Any],
    e13_runtime_state: dict[str, Any] | None = None,
) -> None:
    risk_map_state = risk_map_snapshot(state_path.parent)
    payload = {
        "schemaVersion": 2 if e13_runtime_state is not None or risk_map_state is not None else 1,
        "play": play,
        "updated": date.today().isoformat(),
        "sourceFingerprints": fingerprints,
        "lastRun": {
            "changedArtifacts": result["changedArtifacts"],
            "staleSet": result["staleSet"],
            "workOrder": result["workOrder"],
            "bugCards": [card["id"] for card in result["bugCards"]],
            "noOp": result["noOp"],
        },
    }
    if risk_map_state is not None:
        payload["riskMap"] = risk_map_state
    if e13_runtime_state is not None:
        payload["e13Runtime"] = e13_runtime_state
    atomic_write_json(state_path, payload)


def print_human(result: dict[str, Any]) -> None:
    print(f"Play Re-sync: {result['play']}")
    if result["noOp"]:
        print("No changed artifacts; stale cone is empty.")
        return
    print(f"Changed artifacts: {len(result['changedArtifacts'])}")
    for artifact in result["changedArtifacts"]:
        print(f"- {artifact['artifact']}")
    print(f"Stale edges: {', '.join(item['id'] for item in result['staleSet']) or 'none'}")
    if result["blocked"]:
        print("Blocked:")
        for item in result["blocked"]:
            print(f"- {item['edge']} blocked by {', '.join(item['blockedBy'])}")
    if result["autoDerived"]:
        print("Auto-derived:")
        for item in result["autoDerived"]:
            print(f"- {item.get('edge')}: {item.get('status')}")
    if result["workOrder"]:
        print("Work order:")
        for item in result["workOrder"]:
            print(f"- {item['edge']}: {item['title']}")
    if result["bugCards"]:
        print("Bug cards:")
        for card in result["bugCards"]:
            print(f"- {card['id']}: {card['title']}")
    e13_runtime = result.get("e13Runtime")
    if isinstance(e13_runtime, dict):
        print("E13 runtime:")
        print(f"- generation: {e13_runtime.get('generation')}")
        print(f"- re-earned: {len(e13_runtime.get('reEarned', []))}")
        print(f"- still-unproven: {len(e13_runtime.get('stillUnproven', []))}")
        print(f"- owed-runtime: {len(e13_runtime.get('owedRuntime', []))}")


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Compute and propagate the stale cone for a Studio play.",
    )
    parser.add_argument("play_dir", help="Path to studio/plays/<slug>")
    parser.add_argument("--json", action="store_true", help="Print stable JSON to stdout")
    parser.add_argument("--check", action="store_true", help="Compute only; do not derive, bank, checkpoint, or write cards")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_arg_parser()
    args = parser.parse_args(argv)

    repo_root = repo_root_from_script()
    tools_dir = Path(__file__).resolve().parent
    play_dir = Path(args.play_dir).expanduser()
    if not play_dir.is_absolute():
        play_dir = (Path.cwd() / play_dir).resolve()
    else:
        play_dir = play_dir.resolve()

    if not play_dir.is_dir():
        error = {
            "play": play_dir.name,
            "changedArtifacts": [],
            "staleSet": [],
            "autoDerived": [],
            "blocked": [],
            "workOrder": [],
            "bugCards": [],
            "checks": [],
            "errors": [f"play dir not found: {play_dir}"],
            "noOp": False,
            "statePath": str(play_dir / STATE_FILE),
        }
        if args.json:
            print(json.dumps(error, indent=2))
        else:
            print(f"error: play dir not found: {play_dir}", file=sys.stderr)
        return 2

    state_path = play_dir / STATE_FILE
    state = read_json(state_path)
    previous = None
    previous_risk_map = None
    e13_state = None
    if state and isinstance(state.get("sourceFingerprints"), dict):
        previous = {str(key): str(value) for key, value in state["sourceFingerprints"].items()}
    if state and isinstance(state.get("riskMap"), dict):
        previous_risk_map = state["riskMap"]
    if state and isinstance(state.get("e13Runtime"), dict):
        e13_state = state["e13Runtime"]

    fingerprints = source_fingerprints(play_dir)
    changed = changed_from_state(previous, fingerprints, repo_root, play_dir)
    edge_ids, flags = classify_edges(changed)
    blocked_by_edge, projection_changed = plan_blocked_edges(edge_ids, flags)

    checks: list[dict[str, Any]] = []
    auto_derived: list[dict[str, Any]] = []
    bug_cards: list[dict[str, Any]] = []
    extra_work: list[dict[str, Any]] = []
    errors: list[str] = []
    e13_runtime: dict[str, Any] | None = None
    e13_runtime_state: dict[str, Any] | None = None

    if edge_ids:
        checks, auto_derived, bug_cards, extra_work = execute_plan(
            repo_root,
            tools_dir,
            play_dir,
            edge_ids,
            blocked_by_edge,
            args.check,
        )
    elif previous is None:
        # First-ever run with no checkpoint and no detectable git delta: snapshot
        # the play but still run the cheap invariant gates so a never-checkpointed
        # play cannot bootstrap straight past a placeholder/ACP-fallback defect.
        # The full stale cone is only computed once a real source delta is seen.
        result, bug = check_placeholder(repo_root, tools_dir, play_dir, play_dir.name)
        checks.append(result)
        if bug is not None:
            bug_cards.append(bug)
        result, bug = check_workflow(repo_root, tools_dir, play_dir, play_dir.name)
        checks.append(result)
        if bug is not None:
            bug_cards.append(bug)

    if should_build_e13_runtime_handoff(edge_ids, changed):
        current_e13_state = build_e13_runtime_handoff(
            play_dir,
            source_fingerprints(play_dir),
            previous_risk_map,
        )
        if current_e13_state is not None:
            e13_state = current_e13_state

    should_run_e13 = isinstance(e13_state, dict) and (
        e13_state.get("status") == "needs-runtime" or not edge_ids
    )
    if should_run_e13:
        runtime_output, runtime_state, runtime_bug_cards, runtime_errors = run_e13_runtime(
            repo_root,
            play_dir,
            e13_state,
            source_fingerprints(play_dir),
            args.check,
        )
        if runtime_output is not None:
            e13_runtime = runtime_output
        if runtime_state is not None:
            e13_runtime_state = runtime_state
        bug_cards.extend(runtime_bug_cards)
        errors.extend(runtime_errors)

    # Carry the prior E13 runtime record forward when this pass produced no fresh
    # state of its own. write_checkpoint rebuilds the state file wholesale and
    # only persists e13Runtime when it is non-None, so without this a rerun where
    # should_run_e13 is False — e.g. an exit-0 checkpoint while an unresolved E1
    # projection block keeps edge_ids non-empty — would rewrite state without the
    # e13Runtime block and silently drop the recorded runtime generation. The
    # on-disk manifest survives regardless; this preserves the state's
    # idempotency/reporting handle so it re-surfaces once the block clears.
    if e13_runtime_state is None and isinstance(e13_state, dict):
        e13_runtime_state = e13_state

    work_order = build_work_order(edge_ids, blocked_by_edge, projection_changed) + extra_work
    blocked = [
        {
            "edge": edge_id,
            "target": EDGE_BY_ID[edge_id].target,
            "blockedBy": blocked_by_edge[edge_id],
            "reason": "Upstream needs-authoring projection is unresolved.",
        }
        for edge_id in ordered_edge_ids(set(blocked_by_edge))
    ]

    result = {
        "play": play_dir.name,
        "changedArtifacts": changed,
        "staleSet": stale_set(edge_ids, blocked_by_edge),
        "autoDerived": auto_derived,
        "blocked": blocked,
        "workOrder": work_order,
        "bugCards": bug_cards,
        "checks": checks,
        "errors": errors,
        "noOp": (
            len(changed) == 0
            and len(edge_ids) == 0
            and not bug_cards
            and not errors
            and not (isinstance(e13_runtime, dict) and e13_runtime.get("wrote"))
        ),
        "statePath": display_path(state_path, repo_root),
    }
    if e13_runtime is not None:
        result["e13Runtime"] = e13_runtime

    exit_code = result_exit_code(result)
    runtime_wrote = isinstance(e13_runtime, dict) and bool(e13_runtime.get("wrote"))
    if not args.check and (exit_code == 0 or runtime_wrote):
        write_checkpoint(
            state_path,
            play_dir.name,
            checkpoint_fingerprints(source_fingerprints(play_dir), previous, blocked_by_edge),
            result,
            e13_runtime_state,
        )
    if not args.check and bug_cards:
        upsert_bug_cards(repo_root / "studio" / "plays" / "board-state.json", bug_cards)

    if args.json:
        print(json.dumps(result, indent=2))
    else:
        print_human(result)
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
