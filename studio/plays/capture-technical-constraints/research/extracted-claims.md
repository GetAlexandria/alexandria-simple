# Extracted claims — Capture Technical Constraints canon (step 0, 2026-06-11)

Status: **extracted; verification pass run same day** on the one search-snippet-only
claim. Two Sonnet researchers (method report + quality/failure report); synthesis and
verification by the orchestrator agent, 2026-06-11.

Legend: [F] fetched-and-verified · [S] search-snippet-only · [P] paywalled/login-walled
· [I] inference.

---

## Verification pass — verdicts (same day)

1. **SPK Associates "requirement rework accounts for ~50% of total project costs"**:
   **UNCONFIRMED** — primary URL fetched; page contains no statistics, percentages, or
   cited sources. The substance (late constraint discovery is costly) is independently
   supported by Bridging the Gap [F] and NASA SWEHB [F]. The 50% figure is dropped; the
   substance is retained without the fake verbatim.

2. **Bridging the Gap "crop up on us in the 11th hour…"** quote: **CONFIRMED-PRIMARY** —
   page fetched; verbatim confirmed: "They crop up on us in the 11th hour, invalidating
   numerous decisions about the solution, throwing project schedules and budgets out the
   window, and causing general distress."

3. **Tek42 "74% of developers forget reasons behind design decisions"**: secondary source
   citing an underlying study; original research not independently traced. Treated as
   practitioner-sourced secondary claim. Do not present as confirmed research statistic.

4. **All other claims marked [F]** in the method and quality reports: fetched-and-verified
   by the original researcher against primary URLs; no additional verification required.

---

## Section A — What constraints are and how they differ from requirements

- A constraint is "a restriction on the degree of freedom you have in providing a solution." [F]
  Scott Ambler / Agile Modeling — agilemodeling.com/artifacts/constraint.htm

- Constraints act as "a cutting line in the solution space" — they eliminate options
  rather than specify goals; requirements specify goals. [F]
  bmf-san / DEV Community — dev.to/bmf_san/difference-between-requirements-and-constraints-2in

- Four-question heuristic: "user desire" = requirement; "takes away design options" =
  constraint; "changeable with money/time" = requirement; "physical law, legal, or
  company regulation" = constraint. [F] ibid.

- Tom Graves: requirements describe "what we want to happen" (inside-out, opportunity-aligned);
  constraints describe "real-world limits or boundaries around what we want to happen"
  (outside-in, risk-aligned). [F]
  Tom Graves / Tetradian — weblog.tetradian.com/2012/10/31/requirements-and-constraints/

- NFRs are formally requirements but "for architects, they function as powerful
  'Constraints'" — they restrict technology choices and architectural patterns. [F]
  bmf-san / DEV Community

- Agile Modeling identifies four constraint categories: Economic, Political, Technical,
  Environmental; constraints may surface during use-case modeling or UI design, not only
  at initiation. [F] agilemodeling.com/artifacts/constraint.htm

- Agile Modeling's pragmatic guidance: "proper categorization matters less than ensuring
  all requirements are identified and documented." [F] ibid.

- The Enterprise Constraints Register classifies constraints into six types: Financial,
  Schedule/Time, Technical/Architectural, Resource/Personnel, Legal/Regulatory,
  Physical/Environmental; rigidity levels: Hard (Level 1, zero flexibility), Soft
  (Level 2, flexible with sponsor approval), Conditional (Level 3). [F]
  PM Resource Hub — pmresourcehub.com/library/enterprise-constraints-register-template-free-word-download/

- The Enterprise Constraints Register should be captured during project initiation, not
  execution; constraints are "definite, pre-existing conditions" distinct from future risks. [F] ibid.

- A licensing or vendor mandate is the canonical example of a constraint: "only relational
  database management system X can be used because an enterprise-wide licensing agreement
  is in place." [F]
  Design Practice Repository / Zimmermann — socadk.github.io/design-practice-repository/activities/DPR-SMART-NFR-Elicitation.html

- Proper constraint documentation must include not just the constraint but its "application
  conditions" — the underlying assumptions and context in which the constraint is
  applicable — to enable future maintenance and inconsistency detection. [F]
  University of Southampton / AI EDAM — eprints.soton.ac.uk/271806/

- Academic research (Southampton/Cambridge) found that constraint capture historically
  required a domain expert and a knowledge engineer together, which was "error prone and
  time consuming." [F] ibid.

- Constraint evolution may involve identification of new constraints or modification/deletion
  of existing ones; reasons include technology development, performance improvements, cost
  reduction. [F]
  University of Northampton — pure.northampton.ac.uk/en/publications/constraint-capture-and-maintenance-in-engineering-design/

---

## Section B — When to capture (triggers)

- ADR trigger categories (Richards and Ford 2020, via AWS): Structure, Non-functional
  requirements, Dependencies, Interfaces, Construction techniques. [F]
  AWS Prescriptive Guidance — docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/adr-process.html

- Spotify's operational triggers: (a) backfilling undocumented implicit standards found
  in code review; (b) post-RFC/architectural-review capture; (c) minor decisions to
  prevent duplicated effort across teams. [F]
  Spotify Engineering — engineering.atspotify.com/2020/04/when-should-i-write-an-architecture-decision-record

- Spotify: "A competing code pattern discovered during peer review reveals an undocumented
  standard." [F] ibid.

- Ozimmer time-urgency rule: architecturally significant decisions that are costly to undo
  "simply cannot wait until sprint n, with n larger than 3." [F]
  Olaf Zimmermann — ozimmer.ch/practices/2023/04/03/ADRCreation.html

- Forasoft NFR trigger: the concrete external trigger for formal NFR documentation is
  "the first paying customer who asks for a security questionnaire." [F]
  Forasoft — forasoft.com/blog/article/what-are-non-functional-requirements-1323

- Southampton/Cambridge: constraints not captured at the moment of voicing require a
  knowledge-engineering reconstruction process that is "error prone and time consuming." [F]
  eprints.soton.ac.uk/271806/

- Microsoft: "A decision that's made but never recorded will likely be forgotten, leading
  to repeated debates or later changes that unknowingly contradict the original intent." [F]
  Microsoft Azure WAF — learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record

---

## Section C — The ADR canon (Nygard / MADR)

- Michael Nygard coined the Architecture Decision Record format in November 2011: "An
  architecture decision record is a short text file in a format similar to an Alexandrian
  pattern. Each record describes a set of forces and a single decision in response to
  those forces." [F]
  Nygard / Cognitect — cognitect.com/blog/2011/11/15/documenting-architecture-decisions.html

- Nygard's canonical five-section template: Title, Context, Decision, Status,
  Consequences. [F] ibid.

- Motivation: "new team members encountering an unexplained past decision must either
  blindly accept it or change it without understanding consequences — both are risky." [F] ibid.

- Context section must be value-neutral — describes forces in tension without prejudging
  the answer. [F] ibid.

- Decision section must be written in active voice ("We will…"), not passive. [F] ibid.

- ADR status lifecycle: Proposed → Accepted → Deprecated or Superseded (with reference
  to replacement); accepted records are never edited, only superseded. [F]
  AWS Prescriptive Guidance — docs.aws.amazon.com/prescriptive-guidance/latest/

- Microsoft Azure WAF: "An architecture decision record (ADR) is one of the most
  important deliverables of a solution architect. Your architecture is the accumulation
  of its decisions, so the ADR is effectively a record of how and why the system came
  to be its current shape." [F]
  learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record

- Martin Fowler recommends storing ADRs in the source repository under doc/adr in
  lightweight markdown so they can be diffed like code. [F]
  martinfowler.com/bliki/ArchitectureDecisionRecord.html

- Martin Fowler: ADRs serve dual purpose — historical record for future team members AND
  clarification of thinking during the decision process itself; "helps to clarify thinking,
  particularly with groups of people." [F] ibid.

- MADR (Markdown Architectural Decision Records) includes a "Confirmation" section
  specifying how compliance with the decision will be validated — turns ADR into a
  testable claim about the system. [F]
  adr.github.io/madr/

- MADR philosophy: "Do not take the term 'architecture' too seriously or interpret it
  too strongly…any decisions that might have an impact on the architecture somehow are
  architectural decisions." [F] ibid.

- An architectural decision must be "a justified design choice that addresses a functional
  or non-functional requirement"; justification is definitional, not optional. [F]
  adr.github.io — Zimmermann et al., "Sustainable Architectural Decisions"

---

## Section D — NFR capture

- An Architecturally Significant Requirement (ASR) is "a requirement that has a
  measurable effect on the architecture and quality of a software and/or hardware system."
  ADRs should be written for every such decision. [F]
  adr.github.io

- ISO/IEC 25010:2023 defines nine quality characteristics: Functional Suitability,
  Performance Efficiency, Compatibility, Interaction Capability, Reliability, Security,
  Maintainability, Flexibility, and Safety. [F]
  iso25000.com/index.php/en/iso-25000-standards/iso-25010

- Research across 13 software projects: nine of thirteen teams did not formally document
  NFRs; architects elicited them independently in 10 of 13 projects — widespread tacit
  rather than explicit constraint capture. [F]
  InfoQ / academic study — infoq.com/articles/non-functional-requirements-in-architectural-decision-making/

- NFRs serve as "selection criteria for choosing among myriad designs and implementations";
  connection between software architecture and NFR achievement established since Rick
  Kazman's 1994 work. [F] ibid.

- DPR SMART: "Not all non- or extra-functional requirements qualify as quality attributes,
  as there are technical, organizational, and educational constraints as well." [F]
  Design Practice Repository — socadk.github.io/design-practice-repository/activities/DPR-SMART-NFR-Elicitation.html

- DPR SMART uses ISO 25010 / FURPS+ as elicitation checklist and applies SMART criteria
  (Specific, Measurable, Agreed-upon, Realistic, Time-bound); a table captures Y/N for
  S and M with rationale in-session. [F] ibid.

- A valid NFR must have six fields: Subject (which system part), Quality Attribute
  (ISO 25010 category), Metric (what is measured), Threshold (the value with unit),
  Condition (load/scenario), Verification Method. Without all six it is a "wish" not
  a requirement. [F]
  Forasoft — forasoft.com/blog/article/what-are-non-functional-requirements-1323

- Cost of discovering an undocumented NFR after launch: "The cost of writing the NFRs
  properly was about 1% of the cost of fixing them under a deadline" (healthcare case,
  full data-layer rewrite due to missing audit-log NFRs). [F] ibid.

- arc42 Quality Model (Q42) offers a more pragmatic alternative to ISO 25010: eight
  stakeholder-oriented tags (#reliable, #flexible, #efficient, #usable, #operable,
  #suitable, #secure, #safe). [F]
  workingsoftware.dev/the-ultimate-guide-to-write-non-functional-requirements/

---

## Section E — The Y-Statement format and golden path

- Y-Statement format: "In the context of [situation], facing [concern], we decided [option],
  to achieve [quality], accepting [downside]." Can be written in ninety seconds; forces
  completeness by requiring option chosen, options rejected, goals achieved, trade-offs
  accepted. [F]
  Hidekazu Konishi — hidekazu-konishi.com/entry/architecture_decision_records_templates_and_operations.html

- Recommended ADR review process: (1) proposer pre-writes draft (Status: Proposed),
  (2) draft circulates 24-48 hours ahead, (3) readout meeting: 10-15 min silent read,
  then discussion, (4) post-meeting updates merged via PR. "The meeting does not replace
  the PR; it accelerates the discussion that would otherwise happen in PR comments." [F] ibid.

- AWS: review meetings should be 30-45 minutes, fewer than 10 participants; all comments
  must be resolved before an ADR can be accepted. [F]
  AWS Architecture Blog — aws.amazon.com/blogs/architecture/master-architecture-decision-records-adrs-best-practices-for-effective-decision-making/

- Ozimmer's seven good practices: (1) select by priority and significance; (2) use
  meta-qualities like observability; (3) root justification in actual requirements and
  experience; (4) disclose confidence level; (5) always evaluate at least two options. [F]
  ozimmer.ch/practices/2023/04/03/ADRCreation.html

- Microsoft: must be started at onset of workload; for brownfield workloads should be
  retroactively generated from known past decisions. [F]
  learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record

- Microsoft: individual ADR records should include problem statement with context, options
  considered, decision outcome with tradeoffs, and confidence level. "Record the confidence
  level of the decision. Sometimes an architecturally significant decision is made with
  relatively low confidence." [F] ibid.

- A PR template check is a recommended enforcement gate: "This change introduces or
  modifies an architectural decision — ADR linked or N/A?" [F]
  Konishi — hidekazu-konishi.com

- The ADR for a decision "based on external constraints such as vendor pricing, framework
  version, or regulatory requirement decays the moment those constraints change" — the
  record should note which constraints it depends on. [F] ibid.

- Adding code-level comments at each architectural seam pointing back to the governing
  ADR "costs nothing per ADR and pays back permanently." [F] ibid.

- AWS: ADR ownership should include named owner, change history, and stakeholder list
  on every accepted record. [F]
  docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/best-practices.html

- Supersede, never mutate: "If a decision changes, write a new record that supersedes
  the original and link the two together. This approach preserves the history of your
  thinking and makes it clear when and why the direction shifted." [F]
  Microsoft Azure WAF

---

## Section F — Failure modes and anti-patterns

- Constraints raised late "crop up on us in the 11th hour, invalidating numerous decisions
  about the solution, throwing project schedules and budgets out the window, and causing
  general distress." [F]
  Bridging the Gap — bridging-the-gap.com/ba-stories-its-not-all-requirements-assumptions-and-constraints-matter-too/
  (verbatim CONFIRMED-PRIMARY same day)

- Constraints remain unvalidated until detailed solution requirements and technical design
  phases; discovering violations at that stage causes major project disruption. [F] ibid.

- A constraint recorded without rationale loses its value over time: "Always include
  context and rationale. A record without justification loses its value over time as
  stakeholders can't evaluate whether the decision still applies when circumstances
  change." [F] Microsoft Azure WAF

- "74% of respondents state that they forget the reasons behind their design decisions,
  and 80% say that they are not able to understand the reasons for the decisions." [S]
  tek42.io — citing an underlying study not independently verified. Use as secondary
  practitioner claim, not confirmed research statistic.

- Hiding consequences: "Avoid hiding consequences of decisions intentionally or
  accidentally." [F] Microsoft Azure WAF

- Anti-patterns (Zimmermann, Konishi):
  - Advocacy Documents: consequence sections listing only positives, "reading like a
    sales pitch." [F] Konishi
  - Decision Drift: "two ADRs in the repository contradict each other and the codebase." [F] ibid.
  - Post-Acceptance Editing: silently editing an accepted record corrupts the
    provenance chain. [F] ibid.
  - Single Owner: "One engineer writes all the ADRs. When that engineer leaves, the
    practice ends." [F] ibid.
  - Wrong Storage: records "live in a Confluence space, a SharePoint folder, or a
    Notion workspace separate from the codebase — engineers never consult them." [F] ibid.
  - Trivialization: "Writing ADRs for 'Prettier for formatting' while skipping load-
    bearing architectural decisions. When everything is an ADR, nothing is." [F] ibid.
  - Fairy Tale: "We decided for a load balancer because it balances load." [F]
    Zimmermann — ozimmer.ch
  - Sales Pitch: exaggerations; "avoid unsubstantiated adjectives." [F] ibid.
  - Free Lunch Coupon: ignoring difficult long-term consequences. [F] ibid.
  - Dummy Alternative: presenting unworkable options to favor a preferred solution. [F] ibid.
  - Sprint: considers only short-term (2-3 iterations), ignores alternatives. [F] ibid.
  - Retroactive Documentation: "You've forgotten the context, alternatives, and
    trade-offs. The ADR becomes a justification instead of genuine documentation." [F]
    tek42.io

- A constraint recorded as a hard limit without evidence may actually be a personal
  preference; "the BA should determine whether such statements are true restrictions
  or just a solution idea someone had." [F]
  Modern Analyst — modernanalyst.com/Resources/Articles/tabid/115/ID/6663/

- BAs should "avoid recording premature, unnecessary, inadvertently imposed, or
  excessively stringent constraints as requirements." [F] ibid.

- Recording rationale "can quickly resolve debates that might arise if a developer
  asks, 'Do I have to do it like this, or would this other approach I thought of be
  okay?'" [F] ibid.

- "Overlooking constraints can lead to performing extensive, unplanned design and
  code rework." [F] ibid.

- A stale decision log "is worse than no log because it gives false confidence." [F]
  rockstardeveloperuniversity.com/architecture-decision-records-guide/

- Without a quarterly review cadence, "the collection slowly fills with stale Accepted
  ADRs and the team's trust in it erodes." [F] Konishi

- A reviewer should reject any ADR with no negative consequences listed. [F] Konishi

- An ADR's Definition of Done: five criteria — evidence, criteria and alternatives,
  agreement, documentation, and realization/review plan. [F]
  adr.github.io/ad-practices/

- NASA identifies six failure consequences of inadequate requirements quality:
  incomplete components, untested capabilities, increased late-stage defects,
  misaligned behavior, V&V inefficiencies, lost stakeholder confidence. [F]
  NASA SWEHB — swehb.nasa.gov/display/SITE/R043+-+Inadequate+Software+Requirements+Quality

---

## Section G — Quality rubric (10 eyeball checks for the Director)

Each check states a weak example and a strong example drawn from the research.

1. **Measurable terms.** Weak: "The system must be highly available under load."
   Strong: "The checkout service must return p95 < 200 ms under 500 concurrent users."
   (Sources: NASA SWEHB [F]; rockstardeveloperuniversity.com [F])

2. **Named raiser + evidence.** Weak: "Performance is a constraint."
   Strong: "Raised by [Name], Sprint 8 load-test results (linked); p95 degraded by
   430 ms when email+SMS calls were synchronous."
   (Sources: AWS Prescriptive Guidance [F]; modernanalyst.com [F])

3. **Hard vs. soft classification.** Weak: "We want to avoid vendor lock-in."
   Strong: "Hard constraint: all PII must remain in EU data centers per GDPR Art. 44.
   Soft preference: prefer open-source tooling if within 20% of build time."
   (Sources: modernanalyst.com [F]; PM Resource Hub [F])

4. **At least one rejected alternative named.** Weak: (no alternatives section).
   Strong: "Considered MongoDB; rejected — DBA team has no document-store expertise
   and migration risk in the current sprint was deemed too high."
   (Sources: Zimmermann [F]; Microsoft Azure WAF [F])

5. **At least one named negative consequence.** Weak: "This decision will improve
   throughput and simplify the architecture."
   Strong: "This introduces eventual consistency, requires duplicate-delivery handling
   in all consumers, and adds schema-versioning governance work for the platform team."
   (Sources: rockstardeveloperuniversity.com [F]; Konishi [F]; Zimmermann [F])

6. **Status is current and from a defined lifecycle.** Weak: (no status; edited two
   years ago with no retirement note).
   Strong: "Status: Superseded by ADR-042 (2025-03-10) — original constraint was based
   on on-premise hosting assumption no longer valid post-cloud migration."
   (Sources: AWS Prescriptive Guidance [F]; Konishi [F]; Microsoft Azure WAF [F])

7. **Timestamp and named owner.** Weak: (anonymous, undated, shared folder).
   Strong: "Date: 2025-01-15 | Owner: J. Smith | Stakeholders: Platform, Security,
   Product | Last reviewed: 2025-10-01."
   (Sources: AWS Prescriptive Guidance [F]; tek42.io [F])

8. **Lives in version-controlled codebase, not a separate wiki.** Weak: Confluence
   comment not linked to any code artifact.
   Strong: docs/adr/0023-checkout-latency-constraint.md committed to the main repo,
   grep-able reference from the service README.
   (Sources: Konishi [F]; Microsoft Azure WAF [F])

9. **Scoped to one decision or constraint.** Weak: ADR covering latency, security
   posture, library choice, and deployment strategy in one document.
   Strong: Separate records, each linked to the others.
   (Sources: AWS Prescriptive Guidance [F]; Zimmermann "Mega-ADR" anti-pattern [F])

10. **Revisit trigger stated.** Weak: (no revisit criteria; Accepted for three years).
    Strong: "Revisit if write volume exceeds 10,000 events/second or if dedicated
    streaming infrastructure is acquired by Q4 2026."
    (Sources: rockstardeveloperuniversity.com [F]; Konishi quarterly cadence [F];
    Zimmermann "realization/review plan" criterion [F])
