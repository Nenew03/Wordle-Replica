# [GAME-003] Win/Lose Detection — Code Review

Reviewed against:
- `Docs/Features/GAME-003_PLAN.md`
- `Docs/Context/feature_map.md` ([GAME-003] section)

Code reviewed:
- `js/game.js`
- `index.html`
- `css/style.css`

## Plan compliance (is GAME-003 implemented correctly?)
- **Win detected when guess matches target word exactly**: Implemented in `submitGuess()` via case-insensitive string comparison of the submitted guess vs `state.targetWord` ✅
- **Win shows congratulations message**: Implemented via `setStatus("You win!", "success")` ✅
- **Lose detected after 6th incorrect guess**: Implemented via `if (state.guesses.length >= 6)` after an incorrect submission ✅
- **Lose reveals the correct word**: Implemented via `setStatus(\`You lose. The word was ${state.targetWord}.\`, "info")` ✅
- **"Play Again" button appears on game end**: Implemented via `getPlayAgainEl().hidden = false` on both win and lose ✅

## No feature duplication (guardrails)
- **Single win/lose implementation**: Only one win/lose detection block exists (in `submitGuess()`), and game input is gated by `state.gameOver` checks in `addLetter()`, `deleteLetter()`, and `submitGuess()` ✅
- **Single UI elements**: `#status` and `#play-again` each exist once in `index.html` and are reused (no duplicate message or button regions) ✅

## Obvious bugs / functional issues
- **No blocking issues found** ✅
- **Ordering is correct** ✅
  - Win check happens before the lose check, so a correct 6th guess is a win (not incorrectly treated as a loss).
- **No “stuck timer” issue for status** ✅
  - `setStatus()` cancels any prior `statusTimer`, so a previous auto-clear (e.g., from "Not in word list") won’t unexpectedly wipe out the win/lose message.

## Subtle data alignment issues
- **Case normalization is consistent** ✅
  - `pickRandomTargetWord()` uppercases the target word.
  - The win check compares `submittedWord.toUpperCase()` to `String(state.targetWord).toUpperCase()`, so even if target casing ever changes, the comparison stays safe.
- **“All letters green” equivalence** ✅
  - The implementation uses a simple string match rather than inspecting tile evaluations. This is equivalent for Wordle: guess == target implies all greens; otherwise it’s not a win.

## Over-engineering / refactor notes
- **Appropriate complexity** ✅
  - GAME-003 is intentionally implemented in the submit funnel (`submitGuess()`) with minimal state (`gameOver`, `won`) and a single button. No extra abstractions or duplicated code paths.
- **File size**: `js/game.js` is currently a single script handling state + rendering + input. This matches the repo’s vanilla/static constraint and doesn’t warrant refactoring yet.

## Style / consistency (functional programming style)
- Code is **function-oriented** and uses a shared mutable `state` object (same approach used across UI/GAME features here). GAME-003 follows the existing style (simple functions + early returns, no classes) ✅

## Notes
- `newGame()` resets state and hides the Play Again button again (`#play-again.hidden = true`). This supports GAME-003’s UX, and also aligns with GAME-004’s reset behavior.

