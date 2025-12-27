# GAME-007 — Basic Pattern Validation (Technical Plan)

## Context / Goal
Implement **[GAME-007] Basic Pattern Validation** from `Docs/Context/feature_map.md`. The goal is to add lightweight validation that prevents obviously invalid letter combinations (like all consonants or excessive consecutive letters) while maintaining the relaxed validation approach that allows creative experimentation. This sits between the original strict validation (GAME-001) and the current fully relaxed validation (GAME-005).

## Changes Required

### 1) JavaScript: Pattern Validation Function (`js/game.js`)
Add a new validation function that checks for basic English word patterns:

- **Function**: `isReasonableGuess(guess)`
  - Check for presence of at least one vowel (A, E, I, O, U)
  - Check for no more than 2 consecutive consonants
  - Check for no more than 3 consecutive vowels
  - Return boolean indicating if guess passes pattern checks

### 2) JavaScript: Integrate Validation into Submit Flow (`js/game.js`)
Modify the `submitGuess()` function to include pattern validation:

- **Function**: `submitGuess()`
  - After length validation but before evaluation
  - Call `isReasonableGuess(state.currentGuess)`
  - If validation fails, show error message and return early (don't consume turn)
  - If validation passes, continue with existing evaluation flow

### 3) JavaScript: Error Messaging
Add appropriate user feedback for validation failures:

- Show clear, helpful error message like "Please enter a more realistic word combination"
- Use existing `setStatus()` function for consistency
- Keep error display time consistent with other validation errors

## Step-by-step Algorithm (Validation Flow)
1. Player submits guess via Enter key or button
2. `submitGuess()` checks basic guards (game over, max tries, length)
3. Call `isReasonableGuess(state.currentGuess)` with pattern checks:
   - Convert guess to uppercase
   - Test for vowel presence: `/[AEIOU]/`
   - Test for consonant runs: `/[^AEIOU]{3,}/`
   - Test for vowel runs: `/[AEIOU]{4,}/`
4. If any pattern check fails, show error and return
5. If all checks pass, proceed with `evaluateGuess()` and normal flow

## Quick Verification Checklist
- [ ] Type "BBBBB" (5 letters) - should be rejected (no vowels)
- [ ] Type "AAAAA" (5 letters) - should be rejected (4+ consecutive vowels)
- [ ] Type "STREET" (6 letters) - should be accepted (reasonable pattern)
- [ ] Type "QWERTY" (6 letters) - should be accepted (has vowels, reasonable pattern)
- [ ] Invalid guesses show error message and don't consume a turn
- [ ] Valid guesses proceed normally through evaluation