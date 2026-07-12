---
slug: guard-good
spine: research/testing/
results: none-yet
---

# Play Testing - risk map

## Coverage - which risks apply

| risk | state | where it's tested / why |
|---|---|---|
| IN-1 Buried signal | gap | covered by fixture |
| OUT-2 Refusal calibration | covered | covered by fixture |

## Eval plan - tests per risk

| risk | test | scope | type | built | target | runs | result |
|---|---|---|---|---|---|---|---|
| IN-1 | parser parity scope | whole | metamorphic | no | 30 | 0 | pending |
| OUT-2 | deterministic refusal check | node | example | yes | 1 (det) | 1 | pass |
