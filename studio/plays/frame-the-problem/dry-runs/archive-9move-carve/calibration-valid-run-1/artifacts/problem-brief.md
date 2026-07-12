# Problem Brief — Meridian's new-account onboarding is stalling customers and the team can't see why
framed with: surface map [provided] · users [provided] · prior brief [not provided]
run: complete

## The picture
New customers land on an empty dashboard after creating their account and have no idea what to do next. When they try to connect a data source, they stall because they don't have the database credentials at hand, and there's no way to save progress and come back — so follow-up calls restart from scratch and accounts go dark. The product team shipped a checklist to fix activation but it's buried in the sidebar, the activation rate hasn't moved, and they have no signal explaining why.

## P1 — "I set up the account and I'm staring at an empty screen — now what?"
- progress sought: A new customer wants to start getting value right after creating their account — see data, understand what the tool does, take a clear step forward.
- who: Customer (new account) — the buyer or technical admin setting up Meridian.
- circumstance: Initial login. The customer finishes account creation and lands on the dashboard. The dashboard is empty — no data source connected yet, no prompt, no nudge, no visible path forward. The onboarding checklist exists but lives in the sidebar behind a scroll. By the time the customer encounters it (if they do), they've already concluded the product is complicated.
- evidence:
  - "Every single one, the customer is like, okay we set up the account, now what? They don't know what to do with the empty dashboard." — Leo — specific-past (observed pattern across four implementation calls)
  - "The checklist isn't helping because they don't see it until after they've already decided the product is complicated." — Leo — clause 1 "they don't see it" specific-past (observed on calls); clause 2 "they've already decided the product is complicated" opinion (conviction high — repeated pattern)
  - "It's in the sidebar. You have to scroll." — Sam — specific-past (factual description of the product's current state)
- what it's not: A request for a better checklist or for moving the checklist. The problem is that a new customer's initial experience is a blank screen with no direction — the gap between finishing account setup and knowing what to do from there.
- where it lands: Dashboard (empty state), Onboarding checklist
- checks: pass

## P2 — "I'm trying to connect my data but I don't have the database URL right now, and there's nowhere to go from here"
- progress sought: The customer is trying to complete the data-source connection step — the gate to seeing anything useful — during an initial setup session, often with a CSM on the call.
- who: Customer (new account) — mid-setup, often on a call with their CSM.
- circumstance: The customer reaches the data-source connector and is asked for a database URL and credentials. They don't have this information at hand — it lives with their DBA or infrastructure team. The connector step has four sub-steps that assume you already have the URL. There's no way to save progress and come back, no pointer to documentation from inside the flow. The customer stalls, and the session ends without a connected data source.
- evidence:
  - "But even when I screen-share and walk them through it, they get stuck at connecting the data source." — Leo — specific-past (observed on implementation calls, even with hands-on CSM guidance)
  - "That step has four sub-steps and none of them make sense if you don't know your database URL." — Leo — specific-past (step structure is factual; customer experience observed on calls)
  - "Which nobody has handy." — Leo — specific-past (observed pattern — customers don't have the URL ready)
  - "So they drop off right there." — Sam — specific-past (confirming the drop-off pattern)
  - "Three of my accounts just... went dark after that call." — Leo — commitment (Leo invested time running those calls; three accounts ceased engagement afterward)
  - "There's a help article nobody finds." — Leo — specific-past (help article exists; customers don't discover it)
- what it's not: A request for better documentation or for simplifying the connector. The problem is that setup requires information the customer doesn't have in the moment, and when they stall, there's no path to resume.
- where it lands: Data source connector
- checks: pass

## P3 — "I spend half the follow-up call re-teaching the same setup because nothing carried over"
- progress sought: The CSM wants each implementation call to build on the last one. The customer wants to resume where they left off, not restart.
- who: Customer Success Manager (CSM) — runs implementation calls, owns the customer relationship during the opening 90 days. Also affects the customer, who is the one re-learning.
- circumstance: A follow-up call after a previous session stalled at the connector. The customer has lost context — nothing in the product records where they stopped or what was explained. The CSM re-explains the same steps from scratch. This repeats across accounts.
- evidence:
  - "Then I have to spend half the next call re-explaining the same setup." — Leo — commitment (Leo is actually spending that time — half of each follow-up call consumed by repeated work)
  - "It's the same conversation every time." — Leo — specific-past (observed recurring pattern across accounts)
  - "Three of my accounts just... went dark after that call." — Leo — commitment (accounts that go dark after stalling are accounts where re-engagement failed)
- what it's not: A request for call scripts or CSM tooling. The problem is that setup progress doesn't persist between sessions — neither in the product nor for the customer — so every re-engagement starts from zero.
- where it lands: Data source connector, Onboarding checklist
- checks: pass

## P4 — "We shipped the checklist and activation hasn't moved — we don't know what's actually blocking people"
- progress sought: The product team wants to understand why new-account activation is stuck at 31% — whether the checklist they shipped is failing, whether the problem is elsewhere, and what to do about it.
- who: Product team — Sam (product) and Priya (PM/project).
- circumstance: After shipping the onboarding checklist. Sam pulled activation numbers and found them unchanged. The team expected the checklist to improve the rate but has no instrumentation or signal explaining why it didn't — no data on whether customers see the checklist, where they drop off, or whether the problem is the checklist itself or something else entirely.
- evidence:
  - "We shipped it two months ago and I'm not sure it's actually working." — Sam — clause 1 "We shipped it two months ago" specific-past; clause 2 "I'm not sure it's actually working" opinion (conviction moderate — uncertain, not declarative)
  - "I pulled the activation numbers last week. We're still sitting at 31% of new accounts completing the first three steps before day seven." — Sam — specific-past (measured data, actually pulled)
  - "That's unchanged from before the checklist, right?" — Priya — specific-past (confirming the comparison — the number hasn't moved)
- what it's not: A request for better metrics tooling. The problem is that the team shipped an intervention aimed at activation and has no understanding of why it didn't work — they can't tell a bad solution from a misidentified problem from an execution issue (the checklist being hidden).
- where it lands: Onboarding checklist
- checks: pass

## Unclear — kept, not promoted
- "Yeah. Which is weird because the PM said this would fix it." — Sam — opinion (Sam finds the result surprising based on an unnamed PM's unverified prediction). Hearsay about an unnamed PM's claim. Reinforces that the team expected the checklist to work, but carries no independent problem signal.
- "Anyway, I don't know if it's a product thing or like a timing thing." — Sam — unclear (genuine uncertainty about root cause). An admission of not knowing, not a problem statement. Relevant as context to P4 but not a problem in its own right.

## Relationships
- P1 ↔ P2: sibling — the empty-dashboard problem and the connector stall sit along the same customer journey but are independently attackable. Fixing the empty dashboard does not touch the connector; fixing the connector does not change the empty dashboard.
- P2 ↔ P3: P3 is subset-of P2 — the re-teaching problem is a downstream consequence of the connector stall and its missing save/resume path. If the connector stall resolves, the re-teaching problem dissolves with it. P3 cannot be attacked independently of P2.
- P1 ↔ P4: sibling — P1 is a customer problem (no direction on the empty dashboard); P4 is a team problem (no signal on why activation is stuck). They share the onboarding checklist as a surface but differ in kind and audience.
- P2 ↔ P4: sibling — the connector stall suppresses activation; P4 is the team's inability to see what suppresses activation. Resolving the connector stall would move the number but would not give the team diagnostic signal; giving the team signal would not unblock the connector.

## Hunch
None earned. P1, P2, and P4 are siblings — distinct problems, distinct audiences, independently attackable, none causing the others. P3 is a subset of P2, which makes P2 a parent of P3 but not a root of the whole set. No single problem sits beneath the rest.

## Spoken (75 words is the ceiling, not a target)
"The room surfaced three problems, not one — customers hitting a blank dashboard with no direction, stalling at the connector because they don't have credentials handy, and the product team flying blind on why activation hasn't moved. The connector stall has a downstream piece — re-teaching on every follow-up — that dissolves if the stall resolves. Leo's three accounts going dark is the thinnest spot. Is that pattern holding across the book?"
