# small-el2

Minimal prior-bearing EL2 bundle fixture for the Front-of-House walk.

- A keystone `_index` card names the expected product containers.
- Stub cards cover multiple Product contexts and deliberately create headline
  drift in both directions: one named-empty container and one present-unnamed
  context.
- `bundle/thread-events.jsonl` carries four `library.thread_opened` Ledger
  events: frame, source gap, prior-inference gap, and a held-back hot spot.
- `reactions.json` has one scripted answer per agenda gate, in order.
