# Images

All card images are converted from the publisher's square PNG cards (709 × 709 px, received 02/11/2026) by
`scripts/convert-cards.mjs`. Re-run it rather than editing a card by hand.

## Source (publisher folder `Test BGA/misc/Sources/cartes PNG 2026`, not in this repo)

File `cartes-carrees-Elementis-2026_<n>.png`:

| n | Content |
|---|---------|
| 1 | ELEMENTIS logo on black |
| 2–61 | Element faces: Water = P + 1, Air = P + 16, Fire = P + 31, Earth = P + 46, for power P-1 to P-15 |
| 62–76 | Power faces, not in the order of the powers (see `powerFaces` in the script) |
| 77–106 | Help cards, EN / FR (see `helpCards` in the script) |
| 107 | The Elementis card |

P-6, P-11 and P-14 were removed from the game by the publisher: their images are not converted.

## Recipe

Resized to **600 × 600 px**, WebP quality 90. The cards are square with rounded corners.

## Layout

| File | Content |
|------|---------|
| `cards/elements/<element>-<power>.webp` | 48 Element faces, elements `water`, `fire`, `earth`, `air`, powers 1–15 (numbers of the 2026 cards) |
| `cards/powers/power-<power>.webp` | 12 power faces, the same for the 4 elements |
| `cards/help/help-<power>-<en|fr>.webp` | 12 Help cards, in English and in French: French for the French players, English for the other languages |
| `cards/elementis.webp` | the Elementis card |
