# GAME-005 — Relaxed Word Validation (Technical Plan)

## Context / Goal
Implement **[GAME-005] Relaxed Word Validation** from `Docs/Context/feature_map.md`. The goal is to remove strict word validation, allowing any combination of letters of the correct length to be submitted as a guess. This improves playability by making the game more experimental.

This modifies the behavior introduced in **[GAME-001] Word Validation**.

## Changes Required

### 1) JavaScript: Guess Validation (`js/game.js`)
Modify the validation logic to allow any letter combination.

- **Function**: `isValidGuessWord(word)`
    - Update to return `true` unconditionally.
    - (Optional) Keep the `VALID_SET_BY_LENGTH` logic commented out or remove it if no longer needed for any validation, but the instructions say "Keep word lists for answer selection only."
- **Function**: `submitGuess()`
    - Ensure it still calls `isValidGuessWord()` (if kept) or remove the conditional block that calls `setStatus("Not in word list", ...)`.
    - Following the technical notes in the feature map: "Modify `isValidGuessWord()` to return `true` unconditionally, or remove validation check entirely from `submitGuess()`."

### 2) JavaScript: Cleanup (Optional but Recommended)
- Since strict validation is removed, the `rebuildValidSets()` function and `VALID_SET_BY_LENGTH` constant become less critical for gameplay but are still used for target word selection indirectly (via `pickRandomTargetWord` which uses `WORDS`).
- However, the feature map states: "Keep word lists for answer selection only."

## Step-by-step Algorithm (Submit Flow)
1. Player hits Enter.
2. `submitGuess()` runs.
3. Check length: if `state.currentGuess.length !== state.wordLength`, return early (no change).
4. Remove or bypass the call to `isValidGuessWord()` that triggers the "Not in word list" error.
5. Proceed to `evaluateGuess()` and append to `state.guesses` regardless of whether the word is in the dictionary.
6. Re-render board and keyboard.

## Quick Verification Checklist
- [ ] Type a non-word of correct length (e.g., `ABCDE` for 5 letters).
- [ ] Submit the guess; it should be accepted, evaluated (likely all 'absent'), and consume a turn.
- [ ] No "Not in word list" error message should appear.
- [ ] Target word selection still works and uses the curated answer list (can verify by checking `state.targetWord` in console).
