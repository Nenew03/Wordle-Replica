# GAME-003 — Win/Lose Detection (Technical Plan)

## Context / Goal
Implement **[GAME-003] Win/Lose Detection** from `Docs/Context/feature_map.md`: detect when the game ends.
- **Win**: submitted guess matches the target word exactly (equivalently: all letters green).
- **Lose**: 6 guesses used without winning.
When the game ends:
- Show a win/lose message
- On lose, reveal the correct word
- Show a **"Play Again"** button

## Current Implementation (Baseline)
The repo already contains an implementation consistent with the feature map:
- **State fields exist**: `state.gameOver` and `state.won` in `js/game.js`
- **End-of-game gating**:
  - `addLetter()`, `deleteLetter()`, `submitGuess()` all return early when `state.gameOver` is true
- **Win/lose detection**: `submitGuess()` in `js/game.js` performs:
  - Win check via **simple string comparison** of submitted guess vs `state.targetWord`
  - Lose check via **guess count** (`state.guesses.length >= 6`) after an incorrect submission
- **UI affordances exist**:
  - Status region: `#status` in `index.html` (updated via `setStatus()` in `js/game.js`)
  - Play again button: `#play-again` in `index.html`, toggled via `.hidden` and wired to `newGame()`

Given this, GAME-003 work is primarily **verification + small alignment fixes (if any)**.

## Changes Required (Files / Functions)
### 1) Verify and (if needed) align win/lose logic to the feature map
File: `js/game.js`
- Confirm `submitGuess()` checks win/lose **after** a valid guess is submitted and appended to `state.guesses` (depends on GAME-001/GAME-002 flow).
- Confirm win uses a simple, case-insensitive string match:
  - `submittedWord.toUpperCase() === state.targetWord.toUpperCase()`
- Confirm lose triggers only after the **6th incorrect guess**:
  - `state.guesses.length >= 6` and not won
- Confirm loss message reveals the correct word.

### 2) Verify UI behavior on game end (status + play again)
Files: `index.html`, `css/style.css`, `js/game.js`
- Confirm `#status` is present with `role="status"` and `aria-live="polite"` (already in markup) so messages are announced.
- Confirm `#play-again` is hidden during active play and becomes visible on win/lose.
- Confirm clicking `#play-again` calls `newGame()` and resets:
  - `state.currentGuess`, `state.guesses`, `state.letterStatus`, `state.gameOver`, `state.won`
  - UI: board and keyboard rerender, status cleared, button hidden again

### 3) Confirm input is locked after game end
File: `js/game.js`
- Verify that after setting `state.gameOver = true`, the game cannot accept further:
  - On-screen keyboard clicks
  - Physical keyboard `keydown` input
This should be enforced by the `state.gameOver` guards in `addLetter()`, `deleteLetter()`, and `submitGuess()`.

## Step-by-step Algorithm (End-of-game detection in submit flow)
1. Player presses Enter (physical keyboard or on-screen keyboard).
2. `submitGuess()` runs.
3. If `state.gameOver` is true → return early.
4. Validate guess (length + word list) per GAME-001; if invalid → show brief error and return (no turn consumed).
5. Evaluate the guess (GAME-002) and push `{ word, evaluation }` into `state.guesses`.
6. Clear `state.currentGuess`, rerender board and keyboard colors.
7. **Win check**:
   - If submitted word equals `state.targetWord` (case-insensitive):
     - Set `state.gameOver = true`, `state.won = true`
     - Show a win message (any “congratulations” copy is acceptable)
     - Show "Play Again" button
     - Return
8. **Lose check**:
   - If `state.guesses.length >= 6`:
     - Set `state.gameOver = true`, `state.won = false`
     - Show a lose message that includes the correct word
     - Show "Play Again" button

## Notes / Pitfalls to Avoid
- **Don’t end the game on invalid guesses**: win/lose checks must happen only after a valid submission consumes a row.
- **Ordering**: perform the win check before the lose check (on the 6th guess, a correct guess should win, not lose).
- **Case normalization**: ensure comparisons are done in consistent casing.

