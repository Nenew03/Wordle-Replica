# [GAME-005] Relaxed Word Validation — Code Review

Reviewed against:
- `Docs/Features/GAME-005_PLAN.md`
- `Docs/Context/feature_map.md` (P1 enhancement)
- `Docs/Commands/review_code.md`

## Plan compliance (is GAME-005 implemented correctly?)

- **Removal of strict validation**: The validation check previously calling `isValidGuessWord()` has been removed from `submitGuess()` in `js/game.js`. ✅
- **Acceptance of all inputs**: Any combination of letters of the correct length is now accepted as a valid guess. ✅
- **Turn consumption**: Guesses are still passed to `evaluateGuess()`, pushed to `state.guesses`, and consume a turn as intended. ✅
- **Length validation preserved**: The guard `if (state.currentGuess.length !== state.wordLength) return;` remains in `submitGuess()`, ensuring only complete guesses are submitted. ✅
- **Target word selection**: `pickRandomTargetWord()` continues to use the curated `WORDS[n].answers` list for selecting the goal word. ✅
- **Feedback removal**: The "Not in word list" error message is no longer triggered, as the validation branch was removed. ✅

## Obvious bugs / functional issues

- **No functional bugs found**. The transition from strict to relaxed validation is clean.
- **Evaluation of non-words**: `evaluateGuess()` handles non-dictionary strings correctly (marking each letter as 'absent' if it's not in the target word), which is the expected behavior for relaxed validation.

## Subtle data alignment / integration risks

- **Word lists**: The project still bundles full word lists in `js/words.js`. While these are no longer used for guess validation, they are still required for answer selection. This aligns with the "Keep word lists for answer selection only" note in the plan. ✅
- **Normalization**: Guesses are still converted to uppercase before evaluation, maintaining consistency with the target word's casing. ✅

## Over-engineering / file sizing

- **Clean implementation**: Instead of modifying `isValidGuessWord()` to return `true`, the developer opted to remove the validation check entirely from the submission flow. This is the simplest approach and reduces the complexity of `js/game.js`. ✅
- **Code reduction**: Several support functions and constants (`isValidGuessWord`, `rebuildValidSets`, `VALID_SET_BY_LENGTH`) were removed, slightly reducing the script's footprint. ✅

## Style / consistency (functional programming style)

- **Style**: The changes follow the existing pattern of using small, focused functions and maintaining a central `state` object. ✅

## Recommendations

- **Optional UX feedback**: As noted in previous plans, adding a "Not enough letters" message for incomplete submissions (instead of a silent return) would improve the UX, though it is not strictly part of this feature's requirements.
- **Documentation update**: Ensure the `feature_map.md` is updated to mark `GAME-005` as complete.

## Verification checklist (from plan) ✅

- [x] Type a non-word of correct length (e.g., `ABCDE` for 5 letters).
- [x] Submit the guess; it is accepted, evaluated, and consumes a turn.
- [x] No "Not in word list" error message appears.
- [x] Target word selection still works and uses the curated answer list.
