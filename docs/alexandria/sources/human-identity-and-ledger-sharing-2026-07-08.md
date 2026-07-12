# Source: Human Identity in the Ledger, and Ledger/Git Sharing (2026-07-08)

**Provenance:** Raised by Jess (cofounder, director) in conversation with
Raven, 2026-07-08, immediately after the Triggers model ruling session (see
`triggers-model-ruling-2026-07-08.md`). **Not yet framed or ruled** — Jess
did not have time to run `frame-the-problem`. This source documents where
the problem stands so it can be picked up later. Treat every claim below as
problem statement, not ruling.

**Updated 2026-07-09:** the ledger-sharing half of this problem was resolved
by a 2026-07-08 director ruling before this source landed — the ledger
gitignore was a bug, now reversed; `events.jsonl` is git-tracked shared
history. Sections below are corrected accordingly. The **identity half
remains open and unruled** and is now the substance of this source.

---

## The problem, in Jess's words

> "We really need Director to become INDIVIDUALS within the company. Today
> in this session you noted that Jess needed to resolve some things that
> Danvers had left as open questions or residuals — and I had to tell you
> that I'm Jess. Instead Raven should clarify who they're talking to, and
> all the ledger events, if possible, should have the human's name that they
> were associated with — so that Raven and other agents can reconstruct the
> current state of Alexandria and which humans did what, and can
> appropriately ask for the right things from the human that they're talking
> to at that time."

## The motivating instance (same day, first-hand)

During the 2026-07-08 Triggers session, Raven spent the first half of the
conversation reporting that "the cofounder (Jess)" needed to rule on the
Triggers residuals — while talking *to* Jess, unknowingly. The library and
ledger record rulings from the 2026-07-07 front-of-house walk (made by
Danvers) and from this session (made by Jess) identically: `actor.kind:
"user"`, no name. The two directors' work is indistinguishable in the
record.

## Current state of the machinery (verified 2026-07-08)

1. **The schema is half-ready.** The ledger event actor schema
   (`packages/ax/src/domain/state-events.ts`) already carries an optional
   `actor.name` field. Nothing populates it: all user-actor events in the
   current ledger have `kind: "user"` and no name.
2. **Connections carry no human identity.** The session connection is
   `host:claude-code:default` — it identifies a host and a machine, not a
   person. Raven has no protocol for establishing who she is talking to at
   session start; "the director" is treated as one person.
3. **The ledger IS git-tracked shared history** (corrected 2026-07-09).
   When this problem was raised, root `.gitignore` excluded
   `docs/alexandria/ledger/` as "append-only runtime state." A 2026-07-08
   director ruling reversed that as a bug: `events.jsonl` is append-only,
   immutable, git-tracked shared history, committed with the work that
   produced it. Events written on a branch merge to main with the branch
   (union merge driver in `.gitattributes`; idempotency keys make the union
   safe). Per-machine runtime state — cursors, connections — lives under
   `docs/alexandria/.ax-runtime/` and stays untracked. Evidence bundles
   (e.g. `docs/alexandria/sweeps/alexandria-product`) remain committed
   provenance alongside, not instead of, the ledger.

## What remains after the ledger ruling (Raven's read, unruled)

The sharing half is resolved: with the ledger in git, Danvers *can* see the
Triggers play run, the gate answers, and every ruling — once the branch
carrying those events lands on main.

What the ruling does **not** fix is anonymity. The shared history now says
*that* rulings happened, but still not *who* made them: every user event
reads `actor.kind: "user"` with no name. Shared-but-anonymous history means
agents can reconstruct what happened but still cannot route asks to the
right human — the exact failure from the motivating instance. The remaining
problem is purely the identity half: **who did what, and who am I talking
to now?**

## Candidate shape of a fix (unruled, for the framer to test)

- Populate `actor.name` on user events (schema already permits it).
- Give connections/sessions a human identity, not just a host identity.
- Make it Raven-protocol (and general agent protocol) to establish who the
  agent is talking to at session start — so asks are routed to the right
  human ("this residual is Danvers'; you're Jess — want me to flag it to
  him?").
- ~~Decide the committed projection of the ledger~~ — resolved by the
  2026-07-08 ruling: the raw ledger itself is git-tracked and merges across
  branches via union merge.

## Open questions

1. Who are the individuals? (Jess, Danvers today; the model should not
   assume two.)
2. Is identity per-event (`actor.name`), per-connection, per-session, or all
   three? How does an agent *verify* it rather than take it on faith?
3. ~~Does the raw ledger stay machine-local, and what are the merge
   semantics?~~ Answered 2026-07-08: shared/merged, union merge driver with
   idempotency keys.
4. How does identity interact with hosted product instances (one volume per
   project/channel) and with federation once it is real machinery?

## Suggested next step

Run `frame-the-problem` on the identity half with this source as the
material when a director has time. The motivating instance above should
satisfy the evidence bar. The ledger-sharing half no longer needs framing —
it was ruled 2026-07-08; what remains is verifying the identity mechanisms
(`actor.name`, identity-aware connections, a who-am-I-talking-to protocol
for agents) get designed and shipped.
