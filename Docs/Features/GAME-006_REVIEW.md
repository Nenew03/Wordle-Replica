# GAME-006 — Dynamic Max Tries Based on Word Length (Review)

## 1. Plan Alignment
The implementation aligns perfectly with the plan in `Docs/Features/GAME-006_PLAN.md`.

- **Helper Function**: `getMaxTries(wordLength)` was added and correctly calculates `6` for lengths 5-6, and the length itself for lengths 7-8.
- **Rendering**: `renderBoard()` now uses `getMaxTries()` to determine the number of rows to render.
- **Guards**: `addLetter()` and `submitGuess()` both use `getMaxTries()` to prevent actions after the limit is reached.
- **Lose Condition**: The game over check in `submitGuess()` correctly uses the dynamic max tries value.

## 2. Code Quality
- **Logic**: The logic is sound. Using a central helper function avoids duplication and makes the limit easy to adjust if needed.
- **Style**: The code follows the existing functional-style vanilla JS patterns.
- **Consistency**: Variable naming and function structure are consistent with the rest of `js/game.js`.

## 3. Potential Issues / Suggestions
- **No bugs found**: The implementation is straightforward and covers all requirements.
- **Accessibility**: The `renderBoard()` loop correctly sets up the rows, ensuring that screen readers (if used) would see the correct grid size, although the grid itself is rebuilt on every render.
- **Mobile Considerations**: The increased number of rows for 8-letter words (8 rows) combined with the wider grid might require vertical scrolling on very short devices, but this is an inherent consequence of the feature and is handled by the overall responsive design.

## 4. Verification Results (Mental Check)
- [x] 5-letter word -> 6 tries: Verified.
- [x] 6-letter word -> 6 tries: Verified.
- [x] 7-letter word -> 7 tries: Verified.
- [x] 8-letter word -> 8 tries: Verified.
- [x] Turn consumption: Correctly stops at the limit and triggers lose message.
