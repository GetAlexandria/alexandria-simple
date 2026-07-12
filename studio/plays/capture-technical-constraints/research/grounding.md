# Grounding — the constraint-capture canon

The cited source of truth for Capture Technical Constraints. Provenance: web
research by two Sonnet agents against `research-brief.md`, plus a verification
pass on the one search-snippet-only claim, 2026-06-11. Claims checked against
primary sources where fetchable; caveats flagged inline. Raw trail:
`extracted-claims.md`. This is the second play grounded under the ground-before-
design rule (README) and the second to carry the pre-answered elicitation mandate.

## 1. What this artifact is

A constraints log entry records every technical constraint or feasibility limit
surfaced in a discussion, each tied to its source. At its most basic — the level
of the worked example brief — it contains: speaker, verbatim quote, plain-language
restatement, and what the constraint bounds. This is the floor. The broader
literature adds fields the worked example brief deliberately defers: hard/soft
rigidity, evidence link, application conditions, lifecycle status, named owner.

The distinction that matters before anything else: a constraint is "a restriction
on the degree of freedom you have in providing a solution" [Ambler, Agile Modeling].
It eliminates options; it does not specify goals. A requirement specifies what we
want to achieve. The two are not the same, and recording preferences as constraints
is a named failure mode ("inadvertently imposed or excessively stringent constraints"
[Modern Analyst]) that hardens personal preferences into architectural limits
through repetition.

NFRs sit at the boundary. Formally they are requirements; operationally they
function as constraints for architects by restricting technology choices and
architectural patterns [bmf-san, DEV Community]. The four-question heuristic
sorts ambiguous cases: if a statement takes away design options and its source
is a physical law, legal mandate, or company regulation, it is a constraint;
if it reflects a user desire changeable with money or time, it is a requirement.

## 2. The method's one rule

Capture the constraint at the moment it is raised. The Southampton/Cambridge
academic research is the sharpest statement of this: constraints not captured
at the moment of voicing require "a domain expert and a knowledge engineer to
work together" to reconstruct them — a process found to be "error prone and
time consuming" [eprints.soton.ac.uk/271806]. Bridging the Gap confirms the
operational consequence: late-surfacing constraints "crop up on us in the 11th hour,
invalidating numerous decisions about the solution, throwing project schedules and
budgets out the window, and causing general distress" [bridging-the-gap.com;
verbatim CONFIRMED-PRIMARY]. Microsoft's framing is the policy version: "A decision
that's made but never recorded will likely be forgotten, leading to repeated debates
or later changes that unknowingly contradict the original intent" [Microsoft Azure WAF].

The corollary is that retroactive documentation produces unreliable rationale.
Tek42.io names this explicitly: when written long after, "you've forgotten the
context, alternatives, and trade-offs. The ADR becomes a justification instead of
genuine documentation." Ozimmer adds the urgency dimension: architecturally
significant decisions that are costly to undo "simply cannot wait until sprint n,
with n larger than 3" [ozimmer.ch].

The minimum viable capture artifact for in-meeting use is the Y-Statement: in
ninety seconds, it records context, concern, chosen option, rejected options,
benefits, and accepted downsides [Konishi]. The Y-Statement is not a substitute
for a full ADR; it is the first line of defense against information decay that
begins the moment a meeting ends.

## 3. The golden path

The research synthesizes a consistent eight-step sequence across Nygard, AWS,
Microsoft, Zimmermann, Spotify, and Konishi:

**Step 1 — Recognize and capture immediately.** When a constraint or decision
surfaces in discussion, capture it with a Y-Statement (90 seconds). Do not let
the meeting end without minimum capture. Spotify's trigger: a competing code
pattern found during peer review should automatically spawn an ADR [Spotify Engineering].

**Step 2 — Categorize before drafting.** Is it a constraint (eliminates options,
non-negotiable or fixed-authority source), a decision (chosen from options with
tradeoffs), or an NFR (measurable quality threshold)? Apply the four-question
heuristic or SMART check. The category determines the template and the rigidity
field. Challenge any "hard" classification that lacks an external source (regulation,
measured data, physical law) — this is the preference-laundering gate.

**Step 3 — Draft the full record same day.** Populate the Nygard five-section or
MADR template: Context (value-neutral forces description, no prejudging), at least
two considered options, Decision in active voice ("We will…"), Consequences (all
valences — positive, negative, neutral), Status = Proposed. For constraints:
populate the six-field register entry (Subject, Quality Attribute, Metric, Threshold,
Condition, Verification Method) with rigidity level and application conditions.

**Step 4 — Circulate for review (24-48 hrs before synchronous meeting).** Share
draft as PR or document; gather async comments.

**Step 5 — Readout meeting (30-45 min, fewer than 10 people).** Ten to fifteen
minutes silent reading, then discussion; capture all action points. "The meeting
does not replace the PR; it accelerates the discussion that would otherwise happen
in PR comments" [Konishi].

**Step 6 — Resolve all comments; set Status = Accepted.** Add timestamp, version,
stakeholder list, named owner, and change history [AWS Prescriptive Guidance].

**Step 7 — Enforce at PR boundary.** PR template check: "This change introduces or
modifies an architectural decision — ADR linked or N/A?" [Konishi]. Code reviewers
link any violating change to the governing record.

**Step 8 — Supersede, never mutate.** When a constraint lifts or a decision changes,
write a new record with Status = Superseded on the old one, linked bidirectionally
[Nygard; Microsoft Azure WAF; AWS].

## 4. Root causes of failure

**Root cause 1: No forcing function at the moment of capture.** Constraints surface
in meetings, Slack threads, or code reviews and are never transferred to a durable
artifact before the conversation ends. By the time documentation is attempted,
context, alternatives, and the evidence behind the constraint are forgotten — tek42.io
calls the result "retroactive justification" rather than genuine documentation.
Counter-practice: designate a constraint owner in every meeting where a feasibility
concern is raised; the owner is responsible for a written record before the next
working day [tek42.io; Spotify Engineering; Modern Analyst].

**Root cause 2: Constraints captured without provenance.** A constraint stripped of
its author, date, and evidence basis cannot be challenged, validated, or retired.
Personal preferences accumulate alongside genuine hard limits. Modern Analyst calls
these "inadvertently imposed or excessively stringent constraints" — over time, no
one can tell which constraints still apply. Counter-practice: every constraint record
must name the raiser, link the evidence artifact, and carry an explicit hard/soft
classification. AWS requires named owner + change history + stakeholder list on every
accepted record [AWS Prescriptive Guidance; Modern Analyst; adr.github.io].

**Root cause 3: No lifecycle management.** Accepted constraints accumulate without
a retirement mechanism. Technology changes, organizational decisions, and new
evidence render constraints obsolete, but without a status field and a review cadence
the collection fills with stale records. Konishi states the consequence directly:
"A stale decision log is worse than no log because it gives false confidence." Without
a quarterly review cadence, "the collection slowly fills with stale Accepted ADRs and
the team's trust in it erodes." Counter-practice: enforce a four-state lifecycle
(Proposed / Accepted / Superseded / Deprecated), append-only edits, a named quarterly
review cadence, and bidirectional links on supersession [Konishi; Microsoft Azure WAF;
AWS].

**Root cause 4: Consequence-hiding converts records into advocacy documents.** The
"Sales Pitch," "Free Lunch Coupon," and "Advocacy Document" anti-patterns (Zimmermann;
Konishi) share the same root: writers omit downsides to win approval or avoid difficult
conversations. Counter-practice: require at least one named negative consequence as a
review gate — "a reviewer should reject any ADR with no negative consequences listed"
[Konishi]. The MADR "Confirmation" section turns the record into a testable claim
about the system rather than an essay [Konishi].

**Root cause 5: Hard constraints and soft preferences not distinguished — preference
laundering.** Stakeholders often state preferences or solution ideas in constraint
language, and analysts record them uncritically as hard limits. When this check is
skipped, the soft constraint hardens through repetition and eventually shapes
architecture as though it were a regulatory or physical limit. Counter-practice: at
capture time, require each constraint to carry a type tag (hard / soft / assumption)
and a sentence of evidence justifying the hard classification; challenge any "hard"
constraint lacking an external source [Modern Analyst; Bridging the Gap; University
of Northampton].

## 5. Judging quality — eyeball rubric for the Director

Ten yes/no checks a non-developer Director can run on a constraint record. Each check
names a weak and a strong version.

**1. Measurable terms** — does the record use a number, threshold, or named system
rather than a vague adjective?
Weak: "The system must be highly available under load."
Strong: "Checkout service must return p95 < 200 ms under 500 concurrent users;
current p95 is 430 ms."
(NASA SWEHB; rockstardeveloperuniversity.com)

**2. Named raiser + evidence** — does the record say who raised it and on what basis?
Weak: "Performance is a constraint."
Strong: "Raised by J. Smith, Sprint 8 load-test results (linked); p95 degraded by
430 ms when email+SMS calls were synchronous."
(AWS Prescriptive Guidance; Modern Analyst; adr.github.io)

**3. Hard vs. soft classification** — is the rigidity explicit?
Weak: "We want to avoid vendor lock-in."
Strong: "Hard constraint: all PII must remain in EU data centers per GDPR Art. 44.
Soft preference: prefer open-source tooling if within 20% of build time."
(Modern Analyst; PM Resource Hub)

**4. At least one rejected alternative named** — with a sentence on why it was not chosen.
Weak: (no alternatives section).
Strong: "Considered MongoDB; rejected — DBA team has no document-store expertise and
migration risk in the current sprint was too high."
(Zimmermann; Microsoft Azure WAF; AWS)

**5. At least one named negative consequence** — not only benefits.
Weak: "This decision will improve throughput and simplify the architecture."
Strong: "This introduces eventual consistency, requires duplicate-delivery handling
in all consumers, and adds schema-versioning governance work for the platform team."
(rockstardeveloperuniversity.com; Konishi; Zimmermann "Free Lunch Coupon")

**6. Status is current and from a defined lifecycle** — Proposed / Accepted /
Superseded / Deprecated.
Weak: (no status; last edited two years ago with no retirement note).
Strong: "Status: Superseded by ADR-042 (2025-03-10) — original constraint based on
on-premise hosting assumption, no longer valid post-cloud migration."
(AWS; Konishi; Microsoft Azure WAF; adr.github.io)

**7. Timestamp and named owner.**
Weak: (anonymous, undated, shared folder).
Strong: "Date: 2025-01-15 | Owner: J. Smith | Stakeholders: Platform, Security,
Product | Last reviewed: 2025-10-01."
(AWS Prescriptive Guidance; tek42.io)

**8. Lives in version-controlled codebase, not a separate wiki.**
Weak: Confluence comment not linked to any code artifact.
Strong: docs/adr/0023-checkout-latency-constraint.md committed to main repo; grep-
able reference from the relevant service README.
(Konishi; Microsoft Azure WAF)

**9. Scoped to one decision or constraint** — not bundled with unrelated decisions.
Weak: ADR covering latency, security posture, library choice, and deployment strategy.
Strong: Separate records, each linked to the others.
(AWS; Zimmermann "Mega-ADR" anti-pattern)

**10. Revisit trigger stated** — the condition under which this constraint should be
reconsidered or retired.
Weak: (no revisit criteria; Accepted for three years without review).
Strong: "Revisit if write volume exceeds 10,000 events/second or if dedicated
streaming infrastructure is acquired by Q4 2026."
(rockstardeveloperuniversity.com; Konishi quarterly cadence; Zimmermann "realization/
review plan" criterion)

## 6. Worked examples

**Strong constraint statement (rockstardeveloperuniversity.com):** Names specific
consumers, replay requirements, operational ownership; identifies consequences:
"eventual consistency, duplicate delivery handling, schema versioning."

**Weak vs. strong ADR context (rockstardeveloperuniversity.com):**
Weak: "We decided to use Kafka because event-driven architecture is scalable."
Strong: "The current checkout path waits on email, SMS, and webhook calls...p95
response time [degraded] by 430 ms."

**Weak vs. strong NFR (NASA SWEHB):**
Weak: "The system must be reliable under all operational conditions." (vague,
unmeasurable)
Strong: Requirements accompanied by specific thresholds, defined parameters, and
named conditions.

**Preference-laundering case (Modern Analyst):** A stated constraint recorded
without challenge turns out to be a solution idea: "The BA should determine whether
such statements are true restrictions or just a solution idea someone had. If it's
not a real constraint, generalize the requirement language so as not to preclude
other creative design approaches."

**Healthcare NFR failure (Forasoft):** Missing audit-log NFRs discovered post-launch
required a full data-layer rewrite. "The cost of writing the NFRs properly was about
1% of the cost of fixing them under a deadline."

## 7. Pre-answered elicitation manifest

Expert answers staged against the brief template's sections. The Director still rules;
these are the researched defaults to rule on.

**§1 Goal** — a successful run of Capture Technical Constraints produces a durable
log entry that records: what was constrained, who raised it, the verbatim source
(quote from transcript or document), a plain-language restatement, and what design
options the constraint forecloses. The done-condition from the worked example brief
is correct: "nothing raised was missed and nothing was invented." An empty log from a
segment with no constraints is a valid success. A failed run reports which part could
not be processed; it never emits a partial log that looks complete. The research adds
one refinement to the failure definition: a log that records a preference as a hard
constraint is a quality failure, not a success — the play should flag ambiguous cases
for Director resolution rather than resolve them silently.

**§2 Trigger** — the worked example brief says: manual to start, the Director or PM
invokes on a transcript segment after a discussion; later, automatic when a meeting
ends. The research confirms this trigger is correct at the coordinator tier. The
research also surfaces a secondary trigger not in the worked example brief: a competing
code pattern found during peer review that reveals an undocumented standard [Spotify].
Worth adding as a variant trigger, Director to rule.

**§3 Required knowledge** — the transcript segment is the only content source
(worked example brief: correct). Speaker names are required; missing → proceed
degraded with "unattributed" and say so (worked example brief: correct). The research
adds that no interpretation of architectural significance is done here — the play files
raw observations; Feasibility Check interprets them against the architecture. This
boundary is consistent with the chain topology described in the worked example brief.

**§4 Golden path** — the worked example brief's four-move sequence maps to the
research's golden path steps 1-3 (capture / categorize / draft). The research adds
the enforcement moves (steps 7-8: PR check, supersede-never-mutate) as future
compound-era plays or upgrade candidates, not current scope.

**§5 What could go wrong** — the worked example brief's four hypotheses are correct
and sufficient for the coordinator-tier scope. The research adds a fifth failure mode
not in the brief: preference laundering (a stated restriction recorded uncritically as
a hard constraint). Recommended addition: a fifth row — "Constraint stated without
evidence basis, may be a preference | medium-confidence | Move 2 flags as
'hard-unverified'; Director rules before filing."

**§6 Draft prompt language** — the worked example brief's prompt is well-grounded:
"You are filing, not interpreting." The research adds one strengthening phrase from
Zimmermann: require the play to declare its confidence level when in doubt, not resolve
it. Concretely: "If you are not sure this is a real constraint vs. a preference, file
it under 'unclear — Director to resolve.'" The brief already says exactly this.

**§7 Proof spec** — the worked example brief's fixture (3 planted constraints, 1
ambiguous statement, ordinary chatter) is the right test surface. The research's
weak/strong pairs (§5 above) seed additional fixtures: one fixture where a stated
constraint is actually a preference (correct behavior: flagged as unclear, not filed
as hard); one fixture where a constraint has no evidence basis (correct behavior:
filed with evidence_basis = none, not invented). The ten-check rubric in §5 above
is the eyeball-ready quality gate.

**§8 Upgrade notes** — candidates for compound-era plays or richer implementations:
the full ADR review loop (silent read + meeting + resolution); the NFR six-field
elicitation with ISO 25010 taxonomy; constraint lifecycle management (quarterly review
cadence, Proposed/Accepted/Superseded/Deprecated); the PR-boundary enforcement gate.
None of these belong in the coordinator-tier play; all are valid future extensions.

## 8. Where this play meets rung 2

The worked example brief classifies this play as a coordinator-tier, standalone
(meeting-support) play. The research confirms the coordinator classification is
correct: this play files observations without architectural interpretation.

The "standalone" classification is the open question. The research shows that
constraints captured here are named inputs to both Write the One-Pager and
Feasibility Check — they are not standalone observations in the broader chain.
In the Raven demo the play's artifact is declared TBD; the research grounds what
that artifact must contain when declared. Whether the chain field should change
from "standalone" to "compound input of Write the One-Pager / Feasibility Check"
is a Director ruling.

The play's relationship to Write the One-Pager (rung 2) specifically: the PRD's
§3 Required knowledge includes "constraints" as a named input [grounding.md §8,
Write the One-Pager]; the constraint log produced here is the artifact that fulfills
that input. The chain is real; the classification question is whether to make it
explicit in the registry.

---

## § Source reweighting — source-canon audit (2026-06-12)

*Appended per Director ruling, 2026-06-12, source-canon audit
(`../../AUDIT-2026-06-12-source-canon.md`). The sections above stand as the
record of what was found; nothing was rewritten. This section reweights the
sources for the startup audience.*

Audit verdict on this play: **fit as-is; rebalance the §8 upgrade path.** The
shipped scope — capture, categorize, draft (steps 1–3 of the eight-step path)
— already sits at the startup floor. The enterprise weight was contained in
§8, where it could quietly re-inflate the play through the growth plan. This
section closes that door.

**Confirmed load-bearing.** Ambler's constraint definition (a restriction on
the degree of freedom — eliminates options, never specifies goals), Modern
Analyst's preference-laundering gate, and the lightweight ADR-in-repo line
(Nygard's five sections, Fowler's framing, MADR) remain the spine. These are
practitioner sources quoted for working mechanisms; no change.

**Demoted to enterprise-tagged.** Three clusters above are enterprise-scale
apparatus and must not re-inflate the play via §8: the AWS Prescriptive
Guidance / Azure Well-Architected review-meeting cadence (steps 4–6 —
circulate 24–48 hrs, readout meeting under ten people, resolve-and-accept
with stakeholder lists and change history); the ISO/IEC 25010 six-field NFR
register (Subject / Quality Attribute / Metric / Threshold / Condition /
Verification Method); and the quarterly lifecycle review. A five-person team
does not run a review-meeting cadence on a constraints log — the brief's §8
entries carrying these items are tagged enterprise-scale, with the org size
that would earn them named explicitly.

**Added — The Mom Test (Fitzpatrick).** The audit found The Mom Test absent
from thirteen of fifteen groundings, including this one — where it is the
natural authority for the constraint-vs-opinion challenge. The bar:
commitment and specific-past evidence outrank stated opinion. A "hard"
classification is earned when the raiser can point to what actually happened
or actually binds — the measured incident, the regulation, the bill — not to
what someone says they would never accept. This is the evidence grammar
behind the existing hard-unverified flag, now named to its source (and the
standing playbook-wide bar under ruling R4).

**Added — Shape Up rabbit holes and no-gos (Basecamp / Singer).** The
startup-native frame for constraint capture inside a pitch: a shaped pitch
carries its rabbit holes (the patches of the work known to be risky) and its
no-gos (what is explicitly out of bounds) inside the one artifact the team
bets on — not in a separate register with its own lifecycle and review
cadence. That is the shape this play's log feeds at startup scale: the
constraints travel with the pitch, and the log is the raw material they are
lifted from.
