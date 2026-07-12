# Problem Framing — late and botched expense submissions
status: draft (v1)

## The problem(s)

### Employees are losing money because they don't know the deadline is coming

- Who has it: employees submitting expenses, in the window where the thirty-day policy deadline is approaching and nothing in the product tells them.
- Evidence:
  - `first-hand: eleven support tickets last month from employees who missed the window and had to eat the expense` (Marcus, from his ticket queue)
  - `first-hand: employees are asking for exceptions that can't be granted — they absorb the cost` (Marcus)
  - `assumed / hand-wavey: "the policy's buried in the handbook, nowhere in the product"` — Marcus's characterization, not yet traced to a specific instance of someone looking for the policy and failing to find it
- Thin spot: We know eleven people missed it. We don't yet have a specific instance showing *how* an employee encountered (or failed to encounter) the deadline — did they not know the policy existed, or did they know and misjudge the timing? The difference matters for what a fix looks like.

### Finance is burning hours chasing bad receipt photos

- Who has it: Diane's finance team, every time a submitted receipt is blurry or incomplete and they have to request a correction.
- Evidence:
  - `first-hand: forty correction cycles per month, mostly receipt photo quality` (Marcus relaying Diane's numbers from last week)
  - `first-hand: some correction threads go three rounds of email` (Marcus)
- Thin spot: The "forty per month" figure and "three rounds" come from Marcus relaying Diane. We don't have Diane's direct account or a look at the actual data. Close enough to trust directionally, but worth confirming with Diane herself — especially whether forty is stable, growing, or seasonal.

## How they relate (a guess)

Sibling problems, held loosely. Both happen in the expense submission flow, but one is about *when* people submit (deadline awareness) and the other is about *what* they submit (receipt quality). They share a surface — the moment an employee goes to file an expense — but fixing one wouldn't necessarily fix the other. It's possible a deeper root connects them (the submission experience is generally poor and unsupported), but that's a hypothesis, not an established fact.

## What this means for the solution (so far)

Kelly proposed a mobile app with camera guidance and deadline reminders. On the evidence so far:

- **Deadline reminders** — the eleven-tickets-per-month number supports the idea that employees need earlier visibility into the deadline. Whether that requires a mobile app, an email nudge, or an in-product banner is still open. The evidence earns "employees need to know sooner," not "employees need a mobile app."
- **Camera guidance** — the forty correction cycles support the idea that receipt capture quality is a real cost. A guided camera experience could help, but so could other interventions (upload validation, clearer instructions). The evidence earns "bad photos are costly," not a specific solution shape.

The mobile app is a plausible vehicle for both, but the problems don't yet demand it specifically. The framing so far complicates the jump to "build a mobile app" without ruling it out.
