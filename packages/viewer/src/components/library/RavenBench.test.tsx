import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AgentQuickBar } from "./RavenBench";
import type { RuntimeAgent } from "../../app/runtime/schemas";

// Map Glow Up: every coin's quick bar exposes the SAME three actions — Journal,
// Needs a Human, and Agent — with no Raven-vs-colleague branch. RavenBench
// starts minimized and only opens the bar on interaction (so no bar shows in
// static markup), so this mounts the per-coin action bar directly, the same
// standalone-mount pattern IndexView.test et al. use. Covers the director's
// bug: Raven's coin used to show Knowledge Bank + Frame a Problem while
// colleagues showed Journal + Needs a Human.

const ravenAgent: RuntimeAgent = {
  id: "raven",
  jobTitle: "Product Owner",
  knowledgeBankAreaIds: ["vision"],
  name: "Raven",
  status: "available",
};

const colleagueAgent: RuntimeAgent = {
  id: "damien",
  jobTitle: "Executive Producer of New Media",
  knowledgeBankAreaIds: [],
  name: "Damien",
  status: "available",
};

function renderQuickBar(agent: RuntimeAgent): string {
  return renderToStaticMarkup(
    React.createElement(AgentQuickBar, {
      agent,
      anchorLeft: 0,
      onAgent: () => undefined,
      onColleagueJournal: () => undefined,
      onColleagueNeedsHuman: () => undefined,
      onClose: () => undefined,
      quickBarRef: React.createRef<HTMLDivElement>(),
    }),
  );
}

describe("AgentQuickBar per-coin actions", () => {
  test("Raven's coin exposes Journal + Needs a Human + Agent, like every other coin", () => {
    const markup = renderQuickBar(ravenAgent);

    expect(markup).toContain('data-testid="agent-quick-bar-journal-raven"');
    expect(markup).toContain('data-testid="agent-quick-bar-needs-a-human-raven"');
    expect(markup).toContain('data-testid="agent-quick-bar-page-raven"');
    expect(markup).toContain("Journal");
    expect(markup).toContain("Needs a Human");
    expect(markup).toContain("Agent");
  });

  test("the retired Knowledge Bank + Frame a Problem slots are gone from Raven's coin", () => {
    const markup = renderQuickBar(ravenAgent);

    expect(markup).not.toContain("agent-quick-bar-knowledge-bank-raven");
    expect(markup).not.toContain("agent-quick-bar-frame-the-problem-raven");
    expect(markup).not.toContain("Knowledge Bank");
    expect(markup).not.toContain("Frame a Problem");
  });

  test("a colleague coin exposes the identical three actions and no retired slots", () => {
    const markup = renderQuickBar(colleagueAgent);

    expect(markup).toContain('data-testid="agent-quick-bar-journal-damien"');
    expect(markup).toContain('data-testid="agent-quick-bar-needs-a-human-damien"');
    expect(markup).toContain('data-testid="agent-quick-bar-page-damien"');
    expect(markup).not.toContain("agent-quick-bar-knowledge-bank-damien");
    expect(markup).not.toContain("agent-quick-bar-frame-the-problem-damien");
  });
});
