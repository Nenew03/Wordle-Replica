# GAME-004 — New Game Functionality (Review)

## What shipped
- A single reset entrypoint: `newGame()` in `js/game.js`
- Random target selection by active length via `pickRandomTargetWord(length)`
- UI wiring:
  - Initial load calls `renderKeyboard()` then `newGame()`
  - `#play-again` click calls `newGame()`
  - Word length selector calls `setWordLength()` → `newGame()`

## Acceptance Criteria Check
- **Clears the game board**: `newGame()` clears `state.guesses` + `state.currentGuess` then calls `renderBoard()`
- **Resets keyboard colors**: `newGame()` resets `state.letterStatus = new Map()` then calls `renderKeyboardColors()`
- **Selects new random word of current length**: `newGame()` sets `state.targetWord = pickRandomTargetWord(state.wordLength)`
- **Resets guess counter**: guess counter is `state.guesses.length`, reset to `[]` in `newGame()`

## Data dependency (DATA-001)
- `js/words.js` defines `window.WORDS = { 5: {answers, valid}, 6: {...}, 7: {...}, 8: {...} }`
- `pickRandomTargetWord()` reads from `WORDS[length].answers` (fallbacks to a deterministic placeholder if missing/empty)

## No duplication note
- This feature intentionally **reuses** the existing UI elements (`#status`, `#play-again`) and the existing reset function (`newGame()`) rather than introducing alternate reset paths.

