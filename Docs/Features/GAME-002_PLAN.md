# GAME-002 — Letter Feedback (Colors) (Technical Plan)

## Context / Goal
Implement **[GAME-002] Letter Feedback (Colors)** from `Docs/Context/feature_map.md`: **after a valid guess**, color each letter tile:
- 🟩 Green: letter is correct and in the correct position
- 🟨 Yellow: letter is in the word but in the wrong position
- ⬛ Gray: letter is not in the word

Must **handle duplicate letters correctly** (greens first, then yellows using remaining letters) and keep colors **accessible (sufficient contrast)**. Feature depends on **[GAME-001]** so invalid guesses don’t consume a turn and don’t update colors.

## Current Implementation (Baseline)
The repo already contains an implementation consistent with the feature map’s technical notes:
- **Evaluation algorithm**: `evaluateGuess(guess, target)` in `js/game.js`
  - Two-pass algorithm: mark greens first, then mark yellows while tracking remaining target letters (duplicate-safe).
  - Returns an array of statuses: `'correct' | 'present' | 'absent'`.
- **Tile coloring**: `renderBoard()` in `js/game.js`
  - For submitted rows (`r < state.guesses.length`), applies `.correct/.present/.absent` CSS classes to each `.tile` based on the stored evaluation array.
- **Keyboard coloring**: `updateLetterStatusFromEvaluation()` + `setBestLetterStatus()` + `renderKeyboardColors()` in `js/game.js`
  - Tracks the best known status per letter using precedence **correct > present > absent**.
  - Applies `.correct/.present/.absent` classes to `.key` buttons in the on-screen keyboard.
- **CSS classes exist**: `css/style.css` defines `.tile.correct/.present/.absent` and `.key.correct/.present/.absent` using CSS variables.
- **Dependency on GAME-001 satisfied**: `submitGuess()` validates guess length and calls `isValidGuessWord()` before evaluating; invalid guesses show status text and return early (no turn consumed, no color updates).

Given this, GAME-002 work is primarily **verification + small alignment fixes (if any)**.

## Changes Required (Files / Functions)
### 1) Confirm evaluation correctness + duplicate handling
File: `js/game.js`
- Verify `evaluateGuess()` follows the required algorithm:
  1. Initialize all positions to `'absent'`
  2. First pass (greens): for each index \(i\), if `guess[i] === target[i]` → mark `'correct'` and mark that target position as consumed
  3. Second pass (yellows): for each index \(i\) not marked correct, if the guessed letter exists in the remaining (unconsumed) target letters → mark `'present'` and consume one occurrence
- Add/ensure a small set of **manual test cases** is easy to validate in the running app:
  - Target `APPLE`, guess `PAPER` (duplicate letters)
  - Target with repeated letters (e.g., `SHEEP`), guess with more repeats than target contains

### 2) Confirm UI application rules (“after valid guess” only)
File: `js/game.js`
- Confirm `submitGuess()` only calls `evaluateGuess()` and mutates:
  - `state.guesses` (consumes a row)
  - `state.letterStatus` (keyboard colors)
  - Board rerender with evaluation classes
…when the guess passes validation (GAME-001). If any code path colors tiles/keys before validation, adjust to return early.

### 3) Accessibility: ensure contrast and consistent color tokens
Files: `css/style.css`, (optionally) `index.html`
- Confirm `.tile.correct/.present/.absent` and `.key.correct/.present/.absent` meet “colors are accessible (sufficient contrast)”.
  - If contrast is insufficient (often the yellow), adjust **only the CSS variables** (`--color-present`, `--color-text-light`, etc.) to improve contrast while keeping the visual language intact.
- Ensure status text remains readable and doesn’t rely solely on color to convey meaning (already uses text like “Not in word list”).

## Step-by-step Algorithm (Evaluation + Rendering)
1. Player submits a guess (Enter).
2. Validate guess length (must equal selected word length).
3. Validate guess exists in the word list (GAME-001).
4. Evaluate guess vs target (duplicate-safe):
   - Pass 1: mark exact matches as `'correct'` and consume those target letters.
   - Pass 2: for remaining positions, mark `'present'` if the letter exists in remaining target letters (consume one), else keep `'absent'`.
5. Store `{ word, evaluation }` in `state.guesses`.
6. Update per-letter keyboard status with best precedence.
7. Rerender:
   - Board tiles: apply `.correct/.present/.absent` to submitted tiles.
   - Keyboard keys: apply `.correct/.present/.absent` to letter keys.

## Notes / Pitfalls to Avoid
- **Duplicate letters**: must not mark more yellows than the target contains after accounting for greens.
- **Precedence**: once a key is green it must never downgrade; yellow must not downgrade to gray.
- **Case normalization**: evaluation and lookups should operate in consistent casing (current code uses uppercase throughout).

