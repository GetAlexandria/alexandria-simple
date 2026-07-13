import { afterEach, describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { journalDirForWorkspacePath } from "../domain/paths.js";
import { NodeFileSystem } from "./filesystem.js";
import { parseJournalEntries, readColleagueJournal } from "./colleague-journal.js";

describe("parseJournalEntries", () => {
  test("splits on ## headings, drops the preamble, keeps file order", () => {
    const markdown = [
      "# Raven's journal",
      "",
      "An intro line that is not an entry.",
      "",
      "---",
      "",
      "## 2026-07-12 — seed entry",
      "",
      "Did the newest thing.",
      "",
      "## 2026-07-11 — earlier beat",
      "",
      "Did the older thing.",
      "Second body line.",
      "",
    ].join("\n");

    expect(parseJournalEntries(markdown)).toEqual([
      { date: "2026-07-12", title: "seed entry", body: "Did the newest thing." },
      {
        date: "2026-07-11",
        title: "earlier beat",
        body: "Did the older thing.\nSecond body line.",
      },
    ]);
  });

  test("accepts a plain hyphen separator and a heading with no date", () => {
    const markdown = ["## 2026-07-10 - hyphen entry", "body", "", "## no date here", "loose"].join(
      "\n",
    );

    expect(parseJournalEntries(markdown)).toEqual([
      { date: "2026-07-10", title: "hyphen entry", body: "body" },
      { date: "", title: "no date here", body: "loose" },
    ]);
  });

  test("does not treat deeper headings as entry boundaries", () => {
    const markdown = ["## 2026-07-09 — with subsection", "intro", "", "### sub", "detail"].join(
      "\n",
    );

    const entries = parseJournalEntries(markdown);
    expect(entries).toHaveLength(1);
    expect(entries[0]!.title).toBe("with subsection");
    expect(entries[0]!.body).toBe("intro\n\n### sub\ndetail");
  });

  test("returns no entries for a preamble-only file", () => {
    expect(parseJournalEntries("# Title\n\nJust an intro, no dated entries.\n")).toEqual([]);
  });
});

const tempDirs = new Set<string>();

function makeWorkspacePath(): string {
  const dir = realpathSync(mkdtempSync(join(tmpdir(), "ax-journal-")));
  tempDirs.add(dir);
  return join(dir, "docs/alexandria");
}

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.clear();
});

function runRead(workspacePath: string, name: string) {
  return Effect.runPromise(
    readColleagueJournal({ name, workspacePath }).pipe(Effect.provide(NodeFileSystem)),
  );
}

describe("readColleagueJournal", () => {
  test("reads and parses a colleague's journal file", async () => {
    const workspacePath = makeWorkspacePath();
    const journalDir = journalDirForWorkspacePath(workspacePath);
    mkdirSync(journalDir, { recursive: true });
    writeFileSync(
      join(journalDir, "raven.md"),
      "# Raven\n\nintro\n\n## 2026-07-12 — a beat\n\nthe body\n",
    );

    const journal = await runRead(workspacePath, "raven");
    expect(journal.name).toBe("raven");
    expect(journal.entries).toEqual([{ date: "2026-07-12", title: "a beat", body: "the body" }]);
  });

  test("a missing journal is empty entries, not an error", async () => {
    const journal = await runRead(makeWorkspacePath(), "damien");
    expect(journal).toEqual({ name: "damien", entries: [] });
  });

  test("rejects a traversing name before touching the filesystem", async () => {
    await expect(runRead(makeWorkspacePath(), "../secrets")).rejects.toThrow(
      /Invalid colleague journal name/,
    );
  });
});
