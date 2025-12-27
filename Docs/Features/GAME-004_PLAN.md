# GAME-004 — New Game Functionality (Technical Plan)

## Context / Goal
Implement **[GAME-004] New Game Functionality** from `Docs/Context/feature_map.md`: **“Start a fresh game with a randomly selected word from the appropriate word list.”**

This includes the feature map acceptance criteria:
- Clear the game board
- Reset keyboard colors
- Select a new random word of the current length
- Reset the guess counter

## Dependencies
- **[DATA-001] Word Lists**: `js/words.js` should provide word lists by length so a new game can pick a random target word of the active length.

## Current Implementation (Baseline)
`js/game.js` already contains a reset entrypoint and wiring consistent with GAME-004:
- **Reset function**: `newGame()`
- **Random selection**: `pickRandomTargetWord(length)` uses `Math.random()` + `WORDS?.[n]?.answers`
- **UI wiring**:
  - Initial game start calls `newGame()` after `renderKeyboard()`
  - “Play Again” button calls `newGame()`
  - Word length selector calls `setWordLength()` which calls `newGame()`

Relevant DOM elements exist in `index.html`:
- `#board`, `#keyboard`, `#status`, `#play-again`

## Changes Required (Files / Functions)
### 1) Data: ensure target word source exists for all lengths (DATA-001 alignment)
- **File**: `js/words.js`
  - Ensure `window.WORDS` is defined as `Record<number, { answers: string[], valid: string[] }>`
  - Ensure `WORDS[length].answers` is non-empty for lengths 5–8 (so `pickRandomTargetWord()` can actually randomize)

### 2) Game logic: encapsulated reset function
- **File**: `js/game.js`
- **Functions to implement/verify**:
  - `newGame()` encapsulates *all* state reset
  - `pickRandomTargetWord(length)` selects a new random answer from the list for the active length
  - `renderBoard()` re-renders the cleared board for the current length
  - `renderKeyboardColors()` resets key coloring based on cleared `state.letterStatus`
  - `clearStatus()` clears any status message and cancels any pending status timers
  - `syncLengthSelectorUI()` keeps selector buttons consistent with `state.wordLength`

### 3) UI wiring: trigger new game
- **File**: `index.html` (and `js/game.js` event handlers)
  - Ensure the “Play Again” button is present and wired to `newGame()`
  - Ensure changing word length starts a new game (via `setWordLength()` → `newGame()`)

## Step-by-step Algorithm (Reset Flow)
1. User triggers a new game (clicks “Play Again”, changes word length, or initial page load).
2. `newGame()` runs:
   - Choose a new target word for the current `state.wordLength`:
     - `state.targetWord = pickRandomTargetWord(state.wordLength)` (uses `Math.random()`)
   - Reset all gameplay state:
     - `state.currentGuess = ""`
     - `state.guesses = []` (resets guess counter / turn count)
     - `state.letterStatus = new Map()` (resets keyboard colors)
     - `state.gameOver = false`, `state.won = false`
   - Reset UI status:
     - `clearStatus()`
     - Hide “Play Again” button until the next game end
   - Render UI to reflect the reset:
     - `renderBoard()` (clears board + syncs `--word-length`)
     - `renderKeyboardColors()` (clears colored keys)
     - `syncLengthSelectorUI()` (optional but keeps selector accurate)

## Notes / Edge Cases
- If `WORDS[length].answers` is missing/empty, `pickRandomTargetWord()` should fall back to a deterministic placeholder (so the app still runs while DATA-001 is incomplete), but DATA-001 should ultimately provide real lists so GAME-004 behaves as intended.
- Reset must not leave behind transient UI state (e.g., status timeouts); `clearStatus()` should cancel any pending timers.

