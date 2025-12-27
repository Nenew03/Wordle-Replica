# GAME-002 — Letter Feedback (Colors) (Code Review)

## Plan Implementation Check (vs `Docs/Features/GAME-002_PLAN.md`)
- **Evaluation algorithm (duplicate-safe)**: Implemented in `evaluateGuess()` (`js/game.js`) using two passes (greens first, then yellows with remaining letters). This matches the feature map technical note.
- **Tile coloring**: Implemented in `renderBoard()` (`js/game.js`) by applying `.correct/.present/.absent` to submitted tiles based on the stored evaluation array.
- **Keyboard coloring + precedence**: Implemented via `updateLetterStatusFromEvaluation()` + `setBestLetterStatus()` + `renderKeyboardColors()` (`js/game.js`) with precedence **correct > present > absent**.
- **“After valid guess” rule**: `submitGuess()` validates length and word-list membership before calling `evaluateGuess()` and before mutating `state.guesses` / `state.letterStatus`. Invalid guesses return early (no row consumed, no colors updated).
- **Accessibility (contrast)**: Improved by changing `.tile.present` and `.key.present` text color to `var(--color-text)` in `css/style.css`.

Overall: **GAME-002 behavior is implemented and not duplicated elsewhere** (single `evaluateGuess()` + single render path).

## Obvious Bugs / Issues
- **None found** for GAME-002’s core requirements (green/yellow/gray behavior, duplicate handling, keyboard precedence).

## Subtle Data / Alignment Issues
- **None found** specific to GAME-002. Status tokens are consistent across layers:
  - JS produces `'correct'|'present'|'absent'`
  - DOM receives CSS classes of the same names
  - CSS defines `.tile.correct/.present/.absent` and `.key.correct/.present/.absent`

## Over-engineering / Refactor Notes
- `evaluateGuess()` is \(O(n^2)\) due to `indexOf`, but \(n \le 8\) (word length 5–8), so this is fine and keeps the code simple.
- `js/game.js` is currently a single-file script with state + rendering + input handling. This is consistent with the repo’s “vanilla, no build step” constraint.

## Style / Consistency (Functional style guideline)
- Code is function-oriented, but it uses a mutable global `state` object (not purely functional). This appears consistent with the existing codebase style; no additional non-matching patterns were introduced for GAME-002.

## Recommendations / Follow-ups (Optional)
- **Accessibility follow-up**: The plan suggested adjusting “only CSS variables” for contrast, but the implementation adjusted the `.present` class text color directly. This is fine, but if you prefer a single-token approach, you could introduce a dedicated variable (e.g. `--color-on-present`) and use it for both tiles and keys.
- **Manual test suggestion**: For quick duplicate validation, temporarily set `window.__wordleState.targetWord = "APPLE"` in the console and submit `PAPER`; you should see the expected mix of present/absent (duplicate-safe).

