# GAME-006 — Dynamic Max Tries Based on Word Length (Technical Plan)

## Context / Goal
Implement **[GAME-006] Dynamic Max Tries Based on Word Length** from `Docs/Context/feature_map.md`. Adjust the maximum number of allowed guesses based on the current word length to provide fairer difficulty scaling (5/6 letters = 6 tries, 7 letters = 7 tries, 8 letters = 8 tries).

## Changes Required

### 1) JavaScript: Core Logic (`js/game.js`)
Introduce a helper function to calculate max tries and update all hardcoded `6` values to use this dynamic value.

- **New Function**: `getMaxTries(wordLength)`
    - Formula: `maxTries = wordLength <= 6 ? 6 : wordLength`
- **Function**: `renderBoard()`
    - Replace the hardcoded loop `for (let r = 0; r < 6; r++)` with a loop that goes up to `getMaxTries(state.wordLength)`.
- **Function**: `addLetter()`
    - Replace `if (state.guesses.length >= 6) return;` with `if (state.guesses.length >= getMaxTries(state.wordLength)) return;`.
- **Function**: `submitGuess()`
    - Replace both occurrences of the hardcoded `6` check (the early return guard and the lose condition check) with the dynamic max tries value.

## Step-by-step Algorithm
1.  **Define helper**: Create `getMaxTries(wordLength)` returning the calculated limit.
2.  **Update rendering**: Modify `renderBoard()` to iterate based on `getMaxTries()`, ensuring the correct number of rows is displayed for the selected word length.
3.  **Update guards**:
    - Update `addLetter()` to prevent typing if the dynamic max has been reached.
    - Update `submitGuess()` to prevent submission if the dynamic max has been reached.
4.  **Update lose condition**: In `submitGuess()`, check if `state.guesses.length >= getMaxTries()` to trigger the game over state if the target word wasn't found.

## Quick Verification Checklist
- [ ] Select 5 or 6-letter mode: The board shows 6 rows.
- [ ] Select 7-letter mode: The board shows 7 rows.
- [ ] Select 8-letter mode: The board shows 8 rows.
- [ ] In 7-letter mode, play a game and verify you can submit a 7th guess and only lose if the 7th guess is wrong.
- [ ] In 8-letter mode, verify you can submit up to 8 guesses.
