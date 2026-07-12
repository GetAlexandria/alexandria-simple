

I'll start by reading the transcript to understand what's being discussed and find the invocation moment.Good. I've read the transcript and identified the structure. Now let me analyze it and write the target spans document.

The transcript contains:
- **Thread**: Maya pitches a browser extension. The discussion reveals two tangled problems: (1) research material is lost in tabs before it gets captured into the library, and (2) directors don't know what's already in the library and re-add duplicates. Maya conflates them under one solution ("the extension"). There's also an unsubstantiated claim ("every director has this problem, literally all of them").
- **Invocation**: Line 39, `**DIRECTOR:** Raven, frame that.`
- **Boundary**: The entire conversation from Maya's opening pitch (line 11) through the invocation (line 39).

Let me create the runtime directory and write the target spans file.`runtime/target-spans.md` is written. The thread runs from Maya's opening pitch through the invocation. It contains a solution-shaped proposal (browser extension) wrapping two distinct problems — tab-death during research capture and duplicate additions from poor library visibility — with one unsupported universality claim. The spans are bounded and the invocation is quoted.

```json
{"preferred_next_label": "Proceed"}
```