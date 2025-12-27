# GAME-001 — Word Validation (Technical Plan)

## Context / Goal
Implement **[GAME-001] Word Validation** from `Docs/Context/feature_map.md`: when the player submits a guess, validate it’s a real word from the word list. **Invalid guesses show brief feedback (e.g., “Not in word list”) and do NOT consume a turn.**

This feature depends on **[DATA-001] Word Lists** (answer words + larger valid-guess lists for lengths 5–8).

## Current Implementation (Baseline)
- **Submission funnel**: `submitGuess()` in `js/game.js`
  - Guards: max turns, and `state.currentGuess.length !== state.wordLength` returns early
  - On submit: calls `evaluateGuess()`, then pushes into `state.guesses`, updates `state.letterStatus`, clears `state.currentGuess`, re-renders
- **Word data**: `WORD_LISTS_BY_LENGTH` currently exists in `js/game.js` and is used for picking the target word only.
- **No UI messaging** exists for errors/feedback (no “toast”/banner region in `index.html` / `css/style.css`).

## Changes Required (Files / Functions)
### 1) Data: Valid words list + Set index (O(1) lookup)
**Primary (aligned with DATA-001 + Architecture doc):**
- Create `js/words.js` to hold word data for each length:
  - `answersByLength[length]` (array of strings)
  - `validGuessesByLength[length]` (array of strings)
- In `js/game.js`, import/use these lists (via `<script src="./js/words.js">` before `game.js`, since this is vanilla JS without bundling).

**Interim (if DATA-001 isn’t implemented yet):**
- Treat the existing `WORD_LISTS_BY_LENGTH[length]` as both **answers** and **valid guesses** temporarily, so GAME-001 can ship while the word lists are expanded later.

**Index structure (required by GAME-001 technical note):**
- Build `VALID_WORD_SET_BY_LENGTH` once at startup:
  - type: `Record<number, Set<string>>` or `Map<number, Set<string>>`
  - contents: `answers ∪ validGuesses`, stored in **uppercase** to match current `state.currentGuess` normalization

### 2) Game logic: validate before consuming a turn
Update `submitGuess()` in `js/game.js` to:
- **Step A — length validation**:
  - If `state.currentGuess.length !== state.wordLength`, return early
  - (Optional) show brief feedback like “Not enough letters” (not required by acceptance criteria, but consistent with Wordle UX)
- **Step B — word list validation**:
  - Normalize guess: `guess = state.currentGuess.toUpperCase()`
  - Lookup: `VALID_WORD_SET_BY_LENGTH[state.wordLength].has(guess)`
  - If not present:
    - Show brief error message: **“Not in word list”**
    - **Do not** push to `state.guesses`
    - **Do not** clear `state.currentGuess`
    - **Do not** update keyboard colors
    - Return
- **Step C — proceed with existing evaluation** (only for valid guesses):
  - Call `evaluateGuess(guess, state.targetWord)`
  - Push `{ word: guess, evaluation }` into `state.guesses`
  - Update `letterStatus`, clear `currentGuess`, and re-render

### 3) UI: brief error messaging
Add a minimal message area in `index.html`:
- A dedicated element near the board (or header) such as:
  - `<div id="message" role="status" aria-live="polite"></div>`
- Keep it visually subtle and mobile-friendly.

Add styling in `css/style.css`:
- A small banner/toast style (centered, max-width consistent with board/keyboard)
- Hidden/empty by default; visible when text is set

Add message helpers in `js/game.js`:
- `showMessage(text, { durationMs })` that:
  - Sets `#message.textContent = text`
  - Clears after ~1000–1500ms
  - Cancels/overwrites any previous timeout to prevent overlap spam on repeated invalid submissions

## Step-by-step Algorithm (Submit Flow)
1. Player hits Enter (physical keyboard or on-screen key)
2. `submitGuess()` runs
3. If guess length is wrong → (optional message) → return
4. Check `VALID_WORD_SET_BY_LENGTH[wordLength].has(guess)`
5. If not found:
   - Show “Not in word list”
   - Return **without** changing guesses/turn count
6. If found:
   - Evaluate guess vs target
   - Append to `state.guesses` (consumes the turn)
   - Update keyboard colors
   - Clear `state.currentGuess`
   - Re-render board + keyboard

## Edge Cases / Notes
- **Case normalization**: store and compare in uppercase (current state already uses uppercase).
- **Missing lists**: if `VALID_WORD_SET_BY_LENGTH` is missing for a length, fail safe:
  - Either treat all guesses as invalid with a clear dev error, or fall back to the current `WORD_LISTS_BY_LENGTH` for MVP.
- **No turn consumed** is enforced by ensuring the “invalid” branch returns before mutating `state.guesses`.

## Quick Verification Checklist (Manual)
- Typing a non-word of correct length (e.g., `AAAAA`) shows **“Not in word list”** and does **not** fill the next row.
- Submitting a valid word of correct length consumes exactly one row and updates keyboard colors.
- Submitting an invalid word repeatedly does not clear the current guess and does not advance turns.

