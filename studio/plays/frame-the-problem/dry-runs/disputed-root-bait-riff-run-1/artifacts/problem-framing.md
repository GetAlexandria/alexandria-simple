# Problem Framing — Enterprise customers churning because they can't get to useful alerting
status: draft (v1)

## The problem(s)

### New enterprise customers leave before day ninety because they never reach a state where alerting works for them

- Who has it: enterprise accounts onboarded through the Voltera and Kazan deals (Q1 cohort). Ops teams responsible for monitoring streaming workloads (Kafka, Kinesis) inside those accounts.
- Circumstance: They arrive, try to configure alerting for their actual production architecture, fail to get anything useful running, and leave before day 90.
- Evidence:
  - `first-hand: specific past instance` — 14 of 26 Q1 enterprise accounts churned before day 90 (Marcus pulled the 90-day cohort numbers for the Voltera and Kazan deal classes).
  - `first-hand: specific past instance` — Kazan's ops lead said on an exit call: "We spent two weeks trying to set up alerts for our Kafka consumers and gave up." Marcus was on that call.
  - `first-hand: specific past instance` — Marcus was on three exit calls total; "almost every one" of the churned accounts cited alerting as the reason in exit interviews or support tickets.
  - `first-hand: specific past instance` — Priya reviewed custom-builder sessions in Loupe (session recordings) and found the drop-off happens at field two (the metric selector), not deeper in the form.
- Thin spots:
  - **Why they fail at configuration is disputed and untested.** Marcus reads the exit interviews as pointing at a template-content gap (shipped templates assume batch processing; the churning customers are streaming-first). Priya reads the same interviews plus the session data as pointing at a UI-knowledge gap (the metric selector requires a mental model of how Streamwatch represents their pipeline, which nobody has taught them). Neither reading has been tested with an intervention. The exit interviews say "alerting wasn't useful" — the causal diagnosis is interpretation, not evidence.
  - **Support volume doesn't corroborate the scale.** Dev notes that support ticket volume hasn't spiked the way you'd expect if this were a widespread product problem. Marcus's ticket set hasn't been shared yet — the team hasn't verified the same corpus.

### Customers who do configure alerts get flooded, lose trust, and stop using them

- Who has it: a subset of the same enterprise cohort — the ones who got past configuration but then experienced alert noise.
- Circumstance: They set a threshold, it fires constantly, they silence everything, and then real incidents also go unnoticed. They leave because alerting actively hurt rather than helped.
- Evidence:
  - `first-hand: specific past instance` — Dev has seen this failure mode in support tickets (default threshold values are very aggressive).
  - `first-hand: specific past instance` — Marcus's exit interviews split: some customers left because they couldn't configure; others left because configured alerts were too noisy. (No specific customer named for the noise path.)
- Thin spot:
  - **No specific named customer or incident for the alert-fatigue exit path.** We know it exists from exit interviews and Dev's support experience, but no one in the meeting cited a concrete case the way Marcus cited Kazan for the configuration problem. This matters because the two problems may need different-sized investments and the noise problem could be anywhere from "tweak defaults" to "rethink thresholds entirely."

## How they relate (a guess)

These look like two stages of the same funnel failure — held loosely. Problem 1 (can't configure) kills customers early. Problem 2 (noise after configuration) kills the ones who survive Problem 1. They share a surface (alerting) but may have different root causes and different fixes. It's possible that fixing Problem 1 well (giving customers a working alert out of the box) also mitigates Problem 2 (because the starting thresholds would be sane for their workload). But that's a hypothesis, not established.

## What this means for the solution (so far)

The meeting surfaced two competing solution directions for Problem 1:

1. **Ship streaming-aware templates** (Marcus's position) — so customers have working starting points that also teach the Streamwatch model.
2. **Redesign the metric selector to be self-describing** (Priya's position) — show the pipeline topology, let people click a node, see what's measurable. No templates needed.

The evidence so far **does not pick a winner**. It supports the existence and severity of the churn problem (14/26 is hard to argue with). It supports that alerting is the pain surface. It does not yet support one causal diagnosis over the other, and the team agreed they'd need to run a test to close that gap. Layla called this out explicitly: "We don't have the data to pick one."

For Problem 2, the direction is less contested — Dev acknowledged the defaults are too aggressive — but the scope of fix is unclear without a specific case to study.
