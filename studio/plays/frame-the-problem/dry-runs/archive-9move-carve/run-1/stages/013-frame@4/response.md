I’ll read the current draft, bounce note, and source evidence first, then only rewrite the frame items the note names while carrying passing material through.The sandbox runner is failing before commands start because `bubblewrap` is unavailable, so I’m re-running the same read-only inspections outside the sandbox.The frame bounce names one failed item: a quote that must preserve the transcript’s line break between `source` and `material`. The current draft already has that corrected in the evidence block, so I’m checking whether the failed single-line quote remains anywhere before I decide whether the rewrite is a no-op or needs a tiny patch.I found the failed single-line quote only in the upstream evidence list, not in `runtime/draft-brief.md`. Since `frame` emits only `runtime/draft-brief.md`, I’m leaving the evidence input untouched and verifying the draft’s quote against the transcript.`runtime/draft-brief.md` already has the frame bounce fixed: the quoted evidence now preserves the transcript line break:

```text
Half my best source
material dies in tabs.
```

I verified the failed single-line quote is not present in the frame draft, so no file edit was needed.