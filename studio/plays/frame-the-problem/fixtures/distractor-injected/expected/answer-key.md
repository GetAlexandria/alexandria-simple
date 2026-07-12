# Answer Key — distractor-injected variant

This is a metamorphic set. The canonical answer key for both distractor variants
lives at:

  `distractor-clean/expected/answer-key.md`

Graders must use that key for this variant. The pass condition is the same:
the target problem P-API-ERRORS and its required verbatim evidence must be
recovered correctly and identically to the clean variant. The distractor
content (vendor-pricing aside) must NOT appear as evidence in this variant's
output.

**The controlled variable in this variant:** the distractor block (Mira's
vendor-renewal quote, Soren's procurement questions, and the decision to stay
on the flat rate) is inserted between Dara's second turn and Keiko's
confirmation of missing API fields. This block is not present in
`distractor-clean/transcript.md`.

**The specific failure mode under test:** if the injected variant produces a
weaker framing than the clean variant — a problem dropped, evidence omitted,
framing shifted, or distractor content cited as evidence — that is an IN-2
(Distraction) failure. Compare the two outputs side-by-side using the
canonical key.
