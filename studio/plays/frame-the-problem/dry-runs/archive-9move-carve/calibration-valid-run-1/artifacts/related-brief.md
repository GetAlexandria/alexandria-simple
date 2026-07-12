# Draft Problem Brief

framed with: surface map [provided] · users [provided] · prior brief [not provided]

Source transcript: `studio/plays/frame-the-problem-next/fixtures/calibration-valid/transcript.md`

---

## 1. "I set up the account and I'm staring at an empty screen — now what?"

**Progress sought:** A new customer wants to start getting value from the product right after creating their account — see data, understand what the tool does for them, take a clear step forward.

**Who:** Customer (new account) — the buyer or technical admin setting up Meridian from a new account. (Resolved from users file: "Has the account credentials but typically does not have the database URL or technical details for the connector step at hand during initial setup. Expects to be productive quickly.")

**Circumstance:** Initial login. The customer has just finished account creation and lands on the dashboard. The dashboard is empty because no data source is connected yet. There is no prompt, no nudge, no visible path forward on this screen. The onboarding checklist exists but lives in the sidebar behind a scroll — the customer has to already know it's there to find it. By the time they encounter the checklist (if they do), they have already formed the impression that the product is complicated.

**Evidence:**

- "Every single one, the customer is like, okay we set up the account, now what? They don't know what to do with the empty dashboard." — LEO · `specific-past` (observed pattern across four implementation calls in the last month)
- "The checklist isn't helping because they don't see it until after they've already decided the product is complicated." — LEO · clause 1 "they don't see it" `specific-past` (observed on calls); clause 2 "they've already decided the product is complicated" `opinion` (Leo's interpretation of the customer's mental state; conviction high — he's seen the pattern repeatedly)
- "It's in the sidebar. You have to scroll." — SAM · `specific-past` (factual description of the product's current state)

**What it's not:** A request for a better checklist, or for moving the checklist somewhere more visible. The problem is that a new customer's initial experience of the product is a blank screen with no direction — the gap between finishing account setup and understanding what to do from there.

**Where it lands:** Dashboard (empty state), Onboarding checklist (surface map: "The onboarding checklist is hidden in the sidebar and requires scrolling; it is not surfaced on the empty dashboard state." / "No activation nudge or prompt exists on the empty-dashboard screen.")

---

## 2. "I'm trying to connect my data but I don't have the database URL right now, and there's nowhere to go from here"

**Progress sought:** The customer is trying to complete the data-source connection step — the gate to seeing anything useful in the product — during an initial setup session (often with a CSM on the call).

**Who:** Customer (new account) — in the middle of a setup session, often on a call with their CSM. (Resolved from users file: "typically does not have the database URL or technical details for the connector step at hand during initial setup.")

**Circumstance:** Mid-setup, often during an implementation call. The customer reaches the data-source connector step and is asked for a database URL and credentials. They don't have this information at hand — it lives with their DBA or infrastructure team. The connector step has four sub-steps that assume you already have the URL. There is no way to save progress and come back, no pointer to documentation from inside the flow, and the help article that explains the step is not discoverable. The customer stalls, and the session ends without a connected data source.

**Evidence:**

- "But even when I screen-share and walk them through it, they get stuck at connecting the data source." — LEO · `specific-past` (observed on implementation calls, even with hands-on CSM guidance)
- "That step has four sub-steps and none of them make sense if you don't know your database URL." — LEO · `specific-past` (the step structure is factual; the observed customer experience of the steps not making sense without the URL is Leo's direct observation from calls)
- "Which nobody has handy." — LEO · `specific-past` (observed pattern — customers on calls don't have the database URL ready)
- "So they drop off right there." — SAM · `specific-past` (confirming the drop-off pattern)
- "Three of my accounts just... went dark after that call." — LEO · `commitment` (Leo invested time running those implementation calls; three accounts ceased engagement afterward — pipeline progress and relationship effort actually spent)
- "There's a help article nobody finds." — LEO · `specific-past` (a help article exists; Leo's observation that customers don't discover it)

**What it's not:** A request for better documentation or for simplifying the connector. The problem is that setup requires information the customer doesn't have in the moment, and when they stall, there is no path to resume — no save state, no fallback, no way to come back later and pick up where they left off.

**Where it lands:** Data source connector (surface map: "The data source connector requires credentials customers rarely have on hand during an initial setup; there is no 'save and return' option." / "Help documentation for the connector exists but is not linked from the connector flow." / "No in-product path from a stuck connector attempt to human support or documentation.")

---

## 3. "I spend half the follow-up call re-teaching the same setup because nothing carried over"

**Progress sought:** The CSM wants each implementation call to build on the last one — move the customer forward, not cover the same ground again. The customer wants to resume where they left off, not restart.

**Who:** Customer Success Manager (CSM) — internal, runs implementation calls, owns the customer relationship during the opening 90 days. (Resolved from users file: Leo is fielded as a CSM.) Also affects the customer (new account), who is the one re-learning.

**Circumstance:** A follow-up implementation call after a previous session stalled (typically at the data-source connector). The customer has lost context from the prior call — nothing in the product records where they stopped or what was explained. The CSM has to re-explain the same setup steps from scratch. This repeats across accounts: the same conversation, the same ground, every time.

**Evidence:**

- "Then I have to spend half the next call re-explaining the same setup." — LEO · `commitment` (Leo is actually spending that time — half of each follow-up call consumed by repeated work)
- "It's the same conversation every time." — LEO · `specific-past` (observed recurring pattern across accounts)
- "Three of my accounts just... went dark after that call." — LEO · `commitment` (also supports this entry: accounts that go dark after stalling are accounts where the CSM's invested time yielded no forward progress — the re-explanation problem is part of why engagement is fragile)

**What it's not:** A request for call scripts or CSM tooling. The problem is that setup progress doesn't persist between sessions — neither in the product nor for the customer — so every re-engagement starts from zero.

**Where it lands:** Data source connector, Onboarding checklist (the setup steps that don't carry forward are within these surfaces)

---

## 4. "We shipped the checklist and activation hasn't moved — we don't know what's actually blocking people"

**Progress sought:** The product team wants to understand why new-account activation is stuck at 31% — whether the checklist they shipped is failing, whether the problem is elsewhere, and what to do about it.

**Who:** Product team — Sam (product) and Priya (PM/project). (Resolved from users file.)

**Circumstance:** After shipping the onboarding checklist. Sam pulled activation numbers and found them unchanged from before the checklist shipped. The team expected the checklist to improve the rate but has no instrumentation or signal explaining why it didn't — no data on whether customers see the checklist, where they drop off, or whether the problem is the checklist itself or something else entirely.

**Evidence:**

- "We shipped it two months ago and I'm not sure it's actually working." — SAM · clause 1 "We shipped it two months ago" `specific-past` (it happened); clause 2 "I'm not sure it's actually working" `opinion` (Sam's judgment on the checklist's effectiveness; conviction moderate — he's uncertain, not declarative)
- "I pulled the activation numbers last week. We're still sitting at 31% of new accounts completing the first three steps before day seven." — SAM · `specific-past` (measured data, actually pulled)
- "That's unchanged from before the checklist, right?" — PRIYA · `specific-past` (confirming the comparison — the number hasn't moved)

**What it's not:** A request for better metrics tooling or for more analytics. The problem is that the team shipped an intervention aimed at activation and has no understanding of why it didn't work — they can't distinguish between a bad solution, a misidentified problem, and an execution issue (the checklist being hidden).

**Where it lands:** Onboarding checklist

---

## Unclear

These highlights from the evidence list did not earn a problem entry. They are recorded here so nothing is silently dropped.

- "Yeah. Which is weird because the PM said this would fix it." — SAM · `opinion` (Sam finds the result surprising based on a PM's unverified prediction). This is hearsay about an unnamed PM's claim. It suggests the team had expectations for the checklist, but the claim itself ("the PM said this would fix it") cannot be traced to a direct statement in this transcript. The reaction ("which is weird") is Sam's, but it adds color to Problem 4 rather than constituting a distinct problem. Not dropped — it reinforces that the product team expected the checklist to work, but it carries no independent problem signal.

- "Anyway, I don't know if it's a product thing or like a timing thing." — SAM · `unclear` (Sam expressing genuine uncertainty about the root cause). This is Sam admitting he doesn't know where the problem sits. It does not describe a problem, a need, or a circumstance — it's an admission of not knowing. Relevant as context to Problem 4 (the team lacks signal), but not a problem in its own right.

---

## Relationships

- Entry 1 → Entry 2: **sibling** — the empty-dashboard problem and the connector stall sit along the same customer journey but are independently attackable. Fixing the empty dashboard (giving the customer direction on initial login) does not touch the connector; fixing the connector (letting the customer complete or resume the data-source step) does not change what the customer sees on the empty dashboard.
- Entry 2 → Entry 3: **Entry 3 is subset-of Entry 2** — the re-teaching problem is a downstream consequence of the connector stall and its missing save/resume path. Entry 3's own framing confirms this: its core is "setup progress doesn't persist between sessions," and that persistence gap is the same absence of save state described in Entry 2. If the connector stall resolves — whether because customers complete the step or because progress persists across sessions — the re-teaching problem dissolves with it. Entry 3 cannot be attacked independently of Entry 2.
- Entry 1 → Entry 4: **sibling** — Entry 1 is a customer problem (no direction on the empty dashboard); Entry 4 is a team problem (no signal on why activation is stuck). They share the onboarding checklist as a surface, but the problems are distinct in kind and audience. Solving the customer's empty-dashboard experience does not give the product team observability into the funnel; instrumenting the funnel does not change what the customer encounters at initial login.
- Entry 2 → Entry 4: **sibling** — the connector stall is one of the factors suppressing activation, and Entry 4 is the team's inability to see what is suppressing activation. Resolving the connector stall would move the activation number but would not give the team the diagnostic signal they lack; giving the team signal would not unblock the connector for any individual customer.

## Hunch

None earned. Entries 1, 2, and 4 are siblings — distinct problems, distinct audiences, independently attackable, none causing the others. Entry 3 is a subset of Entry 2, which makes Entry 2 a parent of Entry 3 but not a root of the whole set. No single entry sits beneath the rest.
