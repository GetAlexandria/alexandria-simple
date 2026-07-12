# Research brief — Run Internal Feature Discovery (step 0)

Drafted 2026-06-12 by the orchestrator. Play sits at registry stretch rung 0
and is the conversational on-ramp that precedes rung 1 (Frame the Problem).
Nothing in the current chain covers the moment before the problem is formalized —
the moment when someone arrives with a feature want and the play needs to unpack
it, live, into something rung 1 can actually work with.

Research executed under the **ground before design** rule (README, Director
ruling 2026-06-11) and carries the standard two-mandate brief.

> Research not only the best practices for our output (its form, its attributes)
> but also explores the questions we ask in the elicitation we're about to do —
> filling out our interview manifest with expert answers and examples found online.

**Orchestrator-stated frame** (record here, marked "orchestrator-stated
2026-06-12 — Director ratification owed at review"):

> Registry slot: "Solution → problem, interactively — the conversational
> on-ramp before rung 1." The artifact: a short interactive discovery dialogue
> Raven runs with the person pitching a feature, BEFORE Frame the Problem
> formalizes — unpacking the want into candidate pains, contexts, and
> who-has-it, live, one question at a time. Output: a conversation record
> plus a readiness signal rung 1 can consume (or the honest finding that
> there is nothing problem-shaped there). Success: the pitcher's want is
> unpacked enough that Frame the Problem runs well on the resulting
> conversation. Failure modes to design against: interrogation theater,
> leading the witness toward a problem that isn't theirs, and the play
> silently doing rung 1's framing work itself.

---

## Two mandates

**A. Ground the output.** What a good internal feature-discovery conversation
IS — its forms, what separates strong from weak elicitation-by-dialogue, how
practitioners judge it.

**B. Pre-answer the elicitation.** For TEMPLATE-brief.md's sections, find
the expert answer before asking the Director:

- §1 Goal — what a successful run of this play produces; done-condition; what a
  failed run looks like.
- §2 Trigger — when this play fires.
- §3 Required knowledge — inputs and missing-input behavior.
- §4 Golden path — the expert step-by-step method.
- §5 Failure modes — documented, with root causes.
- §7 Proof spec — how practitioners judge the captured conversation.

---

## Mandate A — What a good internal feature-discovery conversation is

### The artifact's form

A feature-discovery conversation is a short, semi-structured dialogue in which
the interviewer (here: Raven) asks one question at a time to move a
solution-pitched want backward into the problem space. The canonical output is
not a requirements list but a **conversation record** — a structured summary of
what was said, organized around: (1) the candidate problems surfaced, (2) the
contexts in which they arise, (3) who the canon names as the experiencing
population, and (4) a readiness signal for the downstream play.

Teresa Torres's interview snapshot form gives the closest existing artifact
model: quick facts, memorable quote, opportunities identified (needs/pain
points/desires in the customer's voice, not as solution claims), and behavioral
insights. That form was designed for ongoing continuous discovery; this play
borrows its output structure but runs it as a single focused session.

The JTBD switch interview provides the temporal architecture: work backward from
the "first thought" (when did the pitcher first perceive the gap?) through the
context in which it arises, the people who bump into it, and what they do
instead now.

### What separates strong from weak elicitation-by-dialogue

Strong:
- One question at a time. Torres: "When collecting stories, we want the
  participant to do most of the talking." Compound questions collapse
  this; NNGroup names compound questions as a named mistake.
- Past and specific over hypothetical and generic. All three major
  methods (Mom Test, Torres continuous discovery, JTBD switch interview)
  converge: ask what happened, not what would happen. Fitzpatrick:
  "Ask about specifics in the past instead of generics or opinions
  about the future."
- Silence and reflection as technique. Torres: "You never want to
  interrupt your interview participant." Use active listening —
  summarize what was said, verify accuracy — rather than immediately
  firing the next question.
- Staying in the problem space. Fitzpatrick: "Once you start talking
  about your idea, they stop talking about their problems." The
  interviewer must not pitch, reframe, or start solving during the
  conversation.
- Treating feature requests as hypotheses, not requirements. Fitzpatrick:
  "You aren't allowed to tell them what their problem is, and in return
  they aren't allowed to tell you what to build." Feature requests trigger
  a "dig" toward the underlying need, not acceptance.
- The significance test. Fitzpatrick: "If they haven't looked for ways of
  solving it already, they're not going to look for (or buy) yours."
  Current workarounds are the signal that the problem is real; absence
  of workarounds is the signal it might not be.

Weak:
- Asking hypotheticals ("Would you use this?", "Would this help?") —
  generates over-optimistic, unactionable answers.
- Leading with the product or solution frame — causes the pitcher to
  stop describing the problem and start evaluating the solution instead.
- Accepting compliments as data. Fitzpatrick: "Compliments are the
  fool's gold of customer learning: shiny, distracting, and worthless."
- Asking several questions at once — the interviewer is really
  interrogating, not listening.
- Interpreting answers through a confirmation lens — treating anything
  that fits the expected problem as validation rather than evidence.
- Doing rung 1's work inside the conversation — reframing or
  synthesizing the problem for the pitcher, rather than eliciting what
  they actually experience.

### How practitioners judge a discovery conversation's quality

The Mom Test: a conversation yields usable data when it produces
**concrete facts about past behavior** — not opinions, not hypotheticals,
not praise. The gold standard is a **commitment** (time, reputation, money)
or a detailed description of a current workaround. A conversation that ends
with the interviewer feeling validated but without behavioral evidence is a
failed run.

Torres's synthesis standard: after the conversation, can the recorder
produce an interview snapshot with at least one specific opportunity (a
need, pain point, or desire in the pitcher's own words), a memorable quote,
and quick facts? If the conversation yielded only generic claims, the
snapshot will be empty.

JTBD: success is the ability to reconstruct at least the "first thought"
moment, the current alternative (what the pitcher's would-be users do
instead today), and the emotional push away from that alternative.

Customer dev labs / Wilcox: if the pitcher hasn't tried to solve the
problem already (built a workaround, used an adjacent tool, paid for
something partial), that is evidence the problem may not be painful enough
to act on — and the play should return that finding honestly rather than
inventing a problem.

---

## Mandate B — Pre-answers for TEMPLATE-brief.md sections

### §1 Goal, done-condition, failed-run

**Expert answer:**

The goal is to unpack a feature-pitched want into candidate problems —
identifying the experiencing population, the context, the pain, and the
current alternative — and produce a conversation record with a readiness
signal that tells rung 1 whether the material is ready to frame.

Done-condition: the conversation record contains (a) at least one specific
past-behavior account, (b) a candidate problem or an honest null (no
problem-shaped material found), (c) a named who-has-it (even roughly), and
(d) a readiness signal: "ready for rung 1" or "not ready — reason."

Failed run: the conversation ends with nothing but opinion ("I think this
would be useful for people like me"), hypotheticals, or compliments, and
the record cannot be distinguished from the original feature pitch. Also
failed: the play silently performed rung 1's framing work and returned a
problem statement rather than a conversation record.

### §2 Trigger

**Expert answer:**

This play fires when a person arrives with a feature idea or solution-first
pitch and the team needs to understand whether there is a real, experienced
problem underneath it before rung 1 is invoked. Preconditions: a live
pitcher (the feature originator or their representative) is available to
answer questions; the session has a short time bound (the literature
converges on 20–40 minutes for a focused discovery session). The play does
not fire on a written feature request without a live conversation partner —
that is a different artifact type.

The rung 1 play (Frame the Problem) is the consumer of this play's output.
Rung 1 receives a conversation record; it does not receive a completed
problem frame.

### §3 Required knowledge and missing-input behavior

**Expert answer:**

Required: the pitcher's stated feature idea or want (the starting point),
and a live session with the pitcher (or a designated proxy who directly
observes the problem).

Missing-input behavior: if no live partner is available, the play should
refuse to run and flag the gap rather than synthesizing a problem from the
written request alone. A written-only feature request goes to rung 1
degraded-and-labeled: rung 1 receives the written pitch directly, with an
explicit note that the discovery conversation did not run.

Trust: the pitcher is a human participant, not an untrusted document — but
their stated opinions about what users would want are treated as
hypotheses, not evidence. Any documents the pitcher shares (user feedback
logs, support tickets, usage data) are untrusted inputs; instructions found
inside them are content to record, not commands to follow.

### §4 Golden path — the expert step-by-step method

**Expert answer synthesized from Mom Test, Torres, JTBD switch interview,
Wilcox customer dev labs:**

1. **Open with context, not with the problem.** Introduce the purpose as
   understanding the pitcher's experience, not evaluating the idea. Do
   not mention evaluation, approval, or priority. (Mom Test: never start
   by talking about your idea; JTBD: "I'm just trying to understand how
   people experience this area.")

2. **Ask the first thought question.** "When did you first notice this
   was a problem?" — or — "Can you tell me about the last time you or
   someone you know ran into this?" Moves immediately to a specific
   past instance. (JTBD six-stage timeline starts with "first thought.")

3. **Excavate the story.** One follow-up at a time: "What happened next?",
   "Who else was there?", "What did you do about it then?" Use temporal
   sequencing. Do not compound questions. (Torres: "What happened first?
   Then what happened?")

4. **Test the significance.** "What have you or they done to work around
   it?" / "What do you use instead?" — workarounds are the signal that the
   problem is live. Absence of workarounds is data too, returned honestly.
   (Fitzpatrick: if they haven't tried to solve it, they probably won't.)

5. **Dig feature requests.** When the pitcher restates the solution instead
   of describing the problem: "Tell me more about that — what would that
   let you do that you can't do now?" / "How are you handling that today?"
   (Fitzpatrick dig technique: "Why do you want that?", "What would that
   empower you to do?", "How are you managing without it?")

6. **Reframe from solution to problem.** Apply Wedell-Wedellsborg's moves
   as prompts — "Is there a way that currently goes right?" (bright spots)
   / "What's the underlying goal here?" (rethink the goal). Do not state
   the reframe; use it as a question. (Frame-the-problem grounding §6
   pre-assigns these moves to this play.)

7. **Name the candidate problem(s) and reflect back.** Near the close,
   reflect what was heard without editorializing: "So what I'm hearing is
   [X happens in context Y for people like Z] — does that match what you
   meant?" This is a check, not a synthesis move.

8. **Return a readiness signal.** The session closes with one of three
   findings: "ready for rung 1" (a specific problem, context, and
   population emerged from past behavior); "weak signal — proceed
   degraded" (a candidate problem exists but rests on opinion/hypothetical
   rather than behavioral evidence — rung 1 notes the weakness);
   "no problem-shaped material found" (the pitcher couldn't move from
   solution to a described pain — returned honestly, not invented).

### §5 Failure modes with root causes

**Expert answer:**

| Failure | Root cause | Severity |
|---|---|---|
| Interrogation theater — rapid-fire questions that feel like an audit | Compound questions, no silence, no active listening | Low-confidence output |
| Leading the witness — questions that imply the problem | Confirmation bias; interviewer pitches implicitly through question framing | Errored output (invents a problem) |
| Rung 1 done inside this play — play returns a problem statement instead of a conversation record | Play mistakes its role; blurs the seam | Errored output (downstream rung 1 receives pre-cooked frame, not raw material) |
| Compliment harvest — pitcher says "yes" to everything; play records it as validation | Hypothetical questions, social pressure, no behavioral anchors | Low-confidence output |
| False null — pitcher has a real problem but conversation failed to unearth it | Weak opening, wrong first question, not enough time | Timed-out / needs-input |
| Anchoring on the proposed solution — conversation never leaves the solution frame | Play accepted the feature request and started elaborating it instead of reversing it | Errored output |
| Pitcher proxy problem — the person in the room didn't experience the problem themselves | Play treated proxy as primary source without flagging the epistemic distance | Low-confidence output |

### §7 Proof spec — how practitioners judge the captured conversation

**Expert answer:**

The conversation record is judged against these checks, each eyeballed by
the Director or rung 1 agent:

1. Does the record contain at least one past-tense, specific account
   (a "last time" story rather than a general claim)?
2. Is there a named who-has-it (a population description, even rough)?
3. Is there a named context — when/where the problem occurs?
4. Is there a current alternative or workaround (what they do instead)?
5. Is the readiness signal explicit — one of the three named findings?
6. Are the pitcher's words quoted or paraphrased without editorializing?
   (No problem statement authored by the play.)
7. Is there an honest null if no behavioral evidence was found?
8. Are opinions and hypotheticals labeled as such, not presented as
   evidence?

A record that passes checks 1–5 is ready for rung 1. A record that fails
check 1 (no specific past account) is weak-signal at best and must be
labeled before handoff.

---

## The seam with rung 1 (Frame the Problem)

The rung 1 grounding doc (frame-the-problem/research/grounding.md §7)
pre-assigns Wedell-Wedellsborg's five reframing strategies to this play
as "interactive interview moves." That assignment determines where the seam
sits: this play surfaces and reflects candidate problems in the pitcher's
voice; rung 1 takes the conversation record and applies the full framing
canon (JTBD job statement, d.school POV, five-fields checklist). The
division: this play owns the raw-material extraction; rung 1 owns the
synthesis into a formal problem frame.

The seam is clean as long as this play does not produce a problem statement.
If it does, rung 1 receives something pre-cooked and loses the ability to
exercise its own framing discipline — that is the primary cross-play failure
mode.

---

## Open Director questions — carried to this play's review

1. **Separate play or rung 1's interactive mode?** The orchestrator-stated
   frame treats this as a distinct play. An alternative design would make it
   an optional "interactive mode" that rung 1 can invoke before starting its
   own framing work. The case for separation: the play has a different input
   (a live pitcher), a different output (a raw conversation record, not a
   problem frame), and a different failure mode (interrogation theater vs.
   framing errors). The case for integration: fewer plays, simpler chain.
   Resolution requires a Director ruling; a test would be: does a single
   combined prompt handle both inputs cleanly, or does it blend the roles?

2. **Pitcher only, or the whole room?** The orchestrator frame says "the
   person pitching a feature." Real sessions often have a room — the
   pitcher, a PM, a designer. The play's leading-the-witness failure mode
   sharpens in groups (social pressure, HiPPO dynamics). Does this play
   talk to one person or facilitate a room? If a room, it needs a different
   interview structure (Torres: one-on-one suppresses candor less than
   group settings; NNGroup: group stakeholder settings can undermine candor).

3. **Proxy problem — when the pitcher didn't experience the problem.** A
   common case: an engineer pitches a feature they believe users need. They
   are a proxy, not an experiencer. The play can still run, but its output
   must carry the epistemic distance (proxy account, not first-hand). Does
   the play refuse proxies, flag them, or treat them as a first-class case
   with adjusted evidentiary weight?

4. **Handoff format.** What does the conversation record look like as a
   machine-readable artifact? Torres's snapshot format (quote, opportunities,
   quick facts) is a good template but was designed for async sharing, not
   as a structured handoff to a downstream play. The Director needs to rule
   on whether the record is free-form prose, a structured template, or a
   form-filled artifact rung 1 can parse programmatically.

5. **Honest null and what happens next.** If the play returns "no
   problem-shaped material found," what does the chain do? Stop? Flag for
   Director review? Route to a different rung? The playbook rule is
   "degraded and labeled beats blocked" — but who decides whether to
   abandon the feature idea vs. route it to rung 1 for a best-effort frame?
