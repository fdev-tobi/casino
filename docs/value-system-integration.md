# Value system integration

## Current mode: display only

Adopt Luck shows guide values in the lobby UI. Those figures are **not** used to settle deposits, withdrawals, buys, sells, or wagers.

| Concern | Status |
| --- | --- |
| Show gem amounts next to items / pots | Uses display catalog |
| Attribute source in the UI | `ValueAttribution` banner |
| Credit balances on deposit / withdraw | Not connected |
| Price buys / sells / gambles | Not connected (mock game logic only) |

## Code map

| Piece | Path |
| --- | --- |
| Provider interface | `src/lib/integrations/value-provider.ts` |
| Raw AMVerse export | `src/data/elvebreddvalues.json` |
| Display snapshot | `src/data/display-values.snapshot.json` (`id`, `name`, `amount`, `rarity`, `imageUrl`) |
| Refresh script | `scripts/fetch_amverse_values.py` |
| Read API | `GET /api/display-values` |
| Client cache | `DisplayValuesProvider` |
| Browse UI | `/values` (`ValuesPanel`) |
| UI gem | `ValueGem` (`itemId` prefers catalog amount) |
| Pet image chip | `ItemChip` (uses catalog `imageUrl`) |

Default provider id: `elvebredd-display` (snapshot or optional feed).

Set `VALUE_PROVIDER=mock` to force the empty mock adapter.

## How values are produced

1. `scripts/fetch_amverse_values.py` calls AMVerse’s public pets API (challenge token + `X-AMV-Token`).
2. It keeps **Elvebredd** columns (`rvalue` / `nvalue` / `mvalue`) and applies platform **`MULTIPLIER = 2`**.
3. Writes:
   - `src/data/elvebreddvalues.json` — full pet list with `regular` / `neon` / `mega`
   - `src/data/display-values.snapshot.json` — flat `id` / `name` / `amount` rows (variants get `-neon` / `-mega` suffixes)

Refresh:

```bash
.venv/bin/python scripts/fetch_amverse_values.py
```

## Source notes

- [amverse.co/values](https://amverse.co/values) aggregates community guides (Elvebredd + AMVGG). Not official Adopt Me prices.
- This project does **not** scrape Elvebredd directly.
- Numbers may lag or include non-pet items; review before treating as canonical.

### Optional authorized feed

```bash
ELVEBREDD_DISPLAY_FEED_URL=https://example.com/authorized-values.json
```

Expected JSON shape matches `src/data/display-values.snapshot.json`:

```json
{
  "providerId": "elvebredd-display-feed",
  "sourceLabel": "Authorized feed",
  "sourceUrl": "https://amverse.co/values",
  "unitLabel": "value",
  "asOf": "2026-10-20T00:00:00.000Z",
  "disclaimer": "Display only. …",
  "items": [{ "id": "pet-shadow-dragon", "name": "Shadow Dragon", "amount": 1690 }]
}
```

## Later: settlement

When guide values should **determine** deposit / withdraw / wager economics:

1. Keep display path unchanged.
2. Add a separate settlement path that snapshots `amount`, `asOf`, and `providerId` on each money-moving action.
3. Never let the client trust raw display JSON for balances.
