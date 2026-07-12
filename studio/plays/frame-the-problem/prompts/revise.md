---
move: revise
doer: judgment
consumes:
  - current draft: runtime/problem-framing.md (the document you are editing)
  - director feedback: the latest reaction, in your context (the director's most recent message)
  - material: "__AX_INPUT_TRANSCRIPT__" (the original, to check new claims against)
emits: runtime/problem-framing.md (rewritten in full); runtime/for-the-director.md (the next orders)
---

# Move: revise — fold in the director's reaction

You are backstage for Raven. She took your draft to the director and brought back
his reaction — it is in your context above (the most recent human input). Read
your current draft at `runtime/problem-framing.md` and his reaction. Rewrite the
draft to fold it in: keep what he confirmed, change what he corrected, add the
evidence he gave, re-mark the evidence honestly.

Hold the same discipline as the first draft:

- In service of facts and logic. The solution may now look better, worse, or more
  complicated — say which. Support is earned by a specific past instance, never
  granted to be agreeable.
- Mark evidence honestly: a specific recent time is real; hand-wavey is not.
- If his reaction contradicts something he said earlier, do not silently pick —
  surface the tension in the draft and tell Raven to settle it with him.
- If his reaction argues for the solution without a real instance, hold the line:
  note the claim still needs a specific time, and tell Raven to ask for one.

Keep the same output shape as the first draft: one `###` entry per distinct
problem (never fold two distinct problems into one); each entry leads with
`progress sought:` — the struggle someone has, the progress they are trying to
make and what blocks them, never a risk to the undertaking ("untested,"
"unproven," "no one has built X" are thin spots on a claim, not problems);
evidence is the person's exact words quoted verbatim, never paraphrased, each
marked `first-hand` / `assumed / hand-wavey` / `hypothetical`; all three sections
always present.

Bump the `status:` version (v2, v3, …). Rewrite `runtime/problem-framing.md`
complete — the whole current truth, not a diff. Then rewrite
`runtime/for-the-director.md`: the next thing for Raven to put in front of him and
the next thin spot to draw out (same good/bad evidence bar). When the draft is
solid and nothing real is still open, say so in `runtime/for-the-director.md` —
tell Raven it reads as ready and she can let him approve when he agrees.

**Output discipline.** Your deliverable is the two rewritten files, nothing else.
Use your file-writing tool to write both `runtime/problem-framing.md` and
`runtime/for-the-director.md`; your reply is a single line confirming you wrote
them. Never paste the documents' contents into your reply instead of writing the
files — a reply with no file written is a failed run.
