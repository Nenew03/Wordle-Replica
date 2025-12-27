# [UI-001] Game Board Grid — Code Review

Reviewed against:
- `Docs/Features/UI-001_PLAN.md`
- `Docs/Context/briefing.md` (vanilla HTML/CSS/JS, minimal, mobile-first)

Code reviewed:
- `index.html`
- `css/style.css`
- `js/game.js`

## Plan compliance (is UI-001 implemented correctly?)

- **Board container exists**: `div#board.board` is present in `index.html` ✅
- **Grid dimensions**: `.board` uses CSS Grid with `grid-template-rows: repeat(6, ...)` and `grid-template-columns: repeat(var(--word-length), ...)` ✅
- **Word length adaptability (5–8)**:
  - `state.wordLength` is clamped to 5–8 via `clampWordLength()` ✅
  - JS sets `--word-length` on the board element in `renderBoard()` ✅
- **6 × wordLength tiles**: `renderBoard()` generates 6 rows × `state.wordLength` cols in row-major order ✅
- **Empty vs filled tiles**:
  - Empty tiles get `.empty` and show outlined border ✅
  - Filled tiles get `.filled` and show centered uppercase letter ✅
- **Min 44px touch target**: `--tile-size` uses `clamp(44px, ..., 62px)` ✅
- **Feedback colors**: `.correct/.present/.absent` classes exist and are applied when a submitted row has an `evaluation` array ✅
- **Input hooks for UI-002**: `addLetter`, `deleteLetter`, `submitGuess` exist and call `renderBoard()` ✅

## Obvious bugs / functional issues

- **No blocking functional bugs found** for UI-001’s scope (grid renders correctly; typing/submitting updates the active row and locks after 6 submissions).

Minor correctness notes:
- **`setWordLength()` resets guesses/currentGuess**. This is reasonable for MVP and matches the plan’s “resets board-related typing state as needed”, but if later UX expects preserving guesses on word-length change, this would need revisiting.

## Subtle data alignment / integration risks

- **`evaluation` length is not validated**. If a future GAME-002 bug produces an evaluation array shorter/longer than `wordLength`, UI-001 will silently ignore unknown indices (no class added). This is safe, but it can hide upstream bugs; consider adding a dev-only assert later.
- **`state.guesses = []` replaces the array reference**. This is fine today (single file), but if future modules retain a reference to `state.guesses`, they would not see updates after reset. A safer pattern for shared-state scenarios is `state.guesses.length = 0`.

## Over-engineering / file sizing

- **No over-engineering**: one state object + one renderer is appropriate for the vanilla/MVP constraints in the briefing.
- `js/game.js` is still small and cohesive (board + basic input only).

## Style / consistency (functional programming style)

- The code is function-based (no classes) ✅
- **State is mutated in-place** (`state.currentGuess += ...`, `state.guesses.push(...)`). For a tiny vanilla app this is acceptable, but it is less “functional” than a pure `setState(next => ...)` style. If you want to keep a stronger functional style as the project grows, consider introducing a tiny immutable update helper later (especially when UI-002/UI-003 add more event sources).

## UX / layout notes (mobile)

- **Potential subtle layout issue on very small screens**: `--tile-size`’s middle term is `calc((100vw - 48px) / var(--word-length))` and does **not** account for the grid gap (`--gap`) between tiles. With `wordLength = 8`, the grid can be a few pixels wider than the viewport (depends on device width and rounding).
  - Recommendation: adjust the calc to subtract the total horizontal gaps (and/or base the calc on the board container width rather than `100vw`).

## Recommended follow-ups (not required for UI-001)

- Add `aria-rowcount` / `aria-colcount` on the grid and `aria-label` per tile if you want stronger accessibility beyond the MVP.
- Keep the debug globals (`window.__wordleState`, `window.setWordLength`, etc.) for now (useful), but consider removing or gating them before “done”/deploy.

